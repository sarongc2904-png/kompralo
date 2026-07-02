import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { getResendClient, getFromEmail } from '@/lib/resend/resend';
import { buildUnsubscribeUrl } from '@/lib/email/unsubscribe-token';
import AbandonedCart, { subject as abandonedSubject } from '@/lib/email/templates/abandoned-cart';
import WizardIncomplete, { subject as wizardSubject } from '@/lib/email/templates/wizard-incomplete';
import InvitationNotPublished, { subject as notPublishedSubject } from '@/lib/email/templates/invitation-not-published';
import { productsById } from '@/domain/products/catalog';
import type { ProductId } from '@/domain/products';

// Called hourly by Vercel Cron: 0 * * * *
export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const supabase = createServiceRoleSupabaseClient();
  const resend   = getResendClient();
  const from     = getFromEmail();
  const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? '';
  // Per-sequence counters for monitoring (returned + logged).
  const sent = { a1: 0, a2: 0, b: 0, c: 0 };

  // ── SEQUENCE A · Step 1 — Abandoned cart: 1h after capture, not yet emailed ──
  const { data: freshLeads } = await supabase
    .from('email_leads')
    .select('email, name, plan_interest')
    .eq('status', 'lead')
    .is('last_emailed_at', null)
    .lt('created_at', new Date(Date.now() - 60 * 60 * 1000).toISOString());

  for (const lead of freshLeads ?? []) {
    if (!lead.plan_interest || !(lead.plan_interest in productsById)) continue;
    const product = productsById[lead.plan_interest as ProductId];
    try {
      await resend.emails.send({
        from,
        to:      lead.email,
        subject: abandonedSubject(),
        react:   AbandonedCart({
          name:           lead.name ?? undefined,
          plan:           product.name,
          price:          product.price,
          features:       product.features,
          checkoutUrl:    `${appUrl}/invitaciones/precios`,
          unsubscribeUrl: buildUnsubscribeUrl(lead.email),
        }),
      });
      await supabase.from('email_leads')
        .update({ last_emailed_at: new Date().toISOString(), metadata: { sequence_step: 1 } })
        .eq('email', lead.email);
      sent.a1++;
    } catch (err) {
      console.error('[cron/seq-A1] failed for', lead.email, err);
    }
  }

  // ── SEQUENCE A · Step 2 — Last chance: 48h after step 1 ──
  const { data: step1Leads } = await supabase
    .from('email_leads')
    .select('email, name, plan_interest, metadata')
    .eq('status', 'lead')
    .lt('last_emailed_at', new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString());

  for (const lead of step1Leads ?? []) {
    const meta = lead.metadata as Record<string, unknown>;
    if (meta?.sequence_step !== 1) continue;
    if (!lead.plan_interest || !(lead.plan_interest in productsById)) continue;
    const product = productsById[lead.plan_interest as ProductId];
    try {
      await resend.emails.send({
        from,
        to:      lead.email,
        subject: abandonedSubject(true),
        react:   AbandonedCart({
          name:           lead.name ?? undefined,
          plan:           product.name,
          price:          product.price,
          features:       product.features,
          checkoutUrl:    `${appUrl}/invitaciones/precios`,
          unsubscribeUrl: buildUnsubscribeUrl(lead.email),
          isLastChance:   true,
        }),
      });
      await supabase.from('email_leads')
        .update({ last_emailed_at: new Date().toISOString(), metadata: { sequence_step: 2 } })
        .eq('email', lead.email);
      sent.a2++;
    } catch (err) {
      console.error('[cron/seq-A2] failed for', lead.email, err);
    }
  }

  // ── SEQUENCE B — Wizard incomplete: 24h after purchase, step=0 ──
  // orders has customer_email/customer_name (owner_email/owner_name never existed).
  const { data: incompleteWizards, error: seqBErr } = await supabase
    .from('orders')
    .select('customer_email, customer_name, invitation_id, email_sequence_step, created_at')
    .eq('status', 'paid')
    .eq('email_sequence_step', 0)
    .lt('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .not('customer_email', 'is', null);

  if (seqBErr) console.error('[cron/seq-B] query failed:', seqBErr.message);

  for (const order of incompleteWizards ?? []) {
    // Check invitation exists but wizard not complete
    if (!order.invitation_id) continue;
    const { data: inv } = await supabase
      .from('invitations')
      .select('published_at, wizard_step_completed')
      .eq('id', order.invitation_id)
      .maybeSingle();
    if (!inv || inv.published_at) continue; // already published — skip
    // wizard_step_completed: 0 = not started, 1-2 = in progress, 3 = done
    if ((inv.wizard_step_completed ?? 0) >= 3) continue;

    // Check lead is not unsubscribed
    const { data: leadRecord } = await supabase
      .from('email_leads')
      .select('status')
      .eq('email', order.customer_email)
      .maybeSingle();
    if (leadRecord?.status === 'unsubscribed') continue;

    try {
      await resend.emails.send({
        from,
        to:      order.customer_email,
        subject: wizardSubject,
        react:   WizardIncomplete({
          name:           order.customer_name ?? undefined,
          // Real editor deep-link (the editor itself gates into the wizard).
          wizardUrl:      `${appUrl}/dashboard/invitations/${order.invitation_id}/edit`,
          unsubscribeUrl: buildUnsubscribeUrl(order.customer_email),
        }),
      });
      await supabase.from('orders')
        .update({ email_sequence_step: 1, last_sequence_email_at: new Date().toISOString() })
        .eq('invitation_id', order.invitation_id);
      sent.b++;
    } catch (err) {
      console.error('[cron/seq-B] failed for', order.customer_email, err);
    }
  }

  // ── SEQUENCE C — Invitation not published: 72h after purchase, step<2 ──
  const { data: unpublished, error: seqCErr } = await supabase
    .from('orders')
    .select('customer_email, customer_name, invitation_id, email_sequence_step, created_at')
    .eq('status', 'paid')
    .lt('email_sequence_step', 2)
    .lt('created_at', new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString())
    .not('customer_email', 'is', null);

  if (seqCErr) console.error('[cron/seq-C] query failed:', seqCErr.message);

  const supportWhatsApp = process.env.SUPPORT_WHATSAPP_NUMBER ?? '';
  const whatsappUrl = supportWhatsApp
    ? `https://wa.me/${supportWhatsApp}?text=Hola%2C+necesito+ayuda+con+mi+invitaci%C3%B3n`
    : `${appUrl}/cliente`; // fallback until SUPPORT_WHATSAPP_NUMBER is configured

  for (const order of unpublished ?? []) {
    if (!order.invitation_id) continue;
    const { data: inv } = await supabase
      .from('invitations')
      .select('published_at')
      .eq('id', order.invitation_id)
      .maybeSingle();
    if (!inv || inv.published_at) continue;

    const { data: leadRecord } = await supabase
      .from('email_leads')
      .select('status')
      .eq('email', order.customer_email)
      .maybeSingle();
    if (leadRecord?.status === 'unsubscribed') continue;

    try {
      await resend.emails.send({
        from,
        to:      order.customer_email,
        subject: notPublishedSubject,
        react:   InvitationNotPublished({
          name:           order.customer_name ?? undefined,
          dashboardUrl:   `${appUrl}/dashboard/invitations/${order.invitation_id}/edit`,
          whatsappUrl,
          unsubscribeUrl: buildUnsubscribeUrl(order.customer_email),
        }),
      });
      await supabase.from('orders')
        .update({ email_sequence_step: 2, last_sequence_email_at: new Date().toISOString() })
        .eq('invitation_id', order.invitation_id);
      sent.c++;
    } catch (err) {
      console.error('[cron/seq-C] failed for', order.customer_email, err);
    }
  }

  const processed = sent.a1 + sent.a2 + sent.b + sent.c;
  console.log(
    '[cron/email-sequences] sent — abandonedCart=%d lastChance=%d wizardIncomplete=%d notPublished=%d total=%d',
    sent.a1, sent.a2, sent.b, sent.c, processed,
  );
  return NextResponse.json({ processed, sequences: sent });
}
