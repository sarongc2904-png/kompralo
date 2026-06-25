import { NextRequest, NextResponse } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { getResendClient, getFromEmail } from '@/lib/resend/resend';
import { buildUnsubscribeUrl } from '@/lib/email/unsubscribe-token';
import AbandonedCart, { subject as abandonedSubject } from '@/lib/email/templates/abandoned-cart';
import { productsById } from '@/domain/products/catalog';
import type { ProductId } from '@/domain/products';

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const { email, name, plan, source = 'save_for_later' } = body as {
    email?: string; name?: string; plan?: string; source?: string;
  };

  if (!email || typeof email !== 'string' || !email.includes('@')) {
    return NextResponse.json({ error: 'Email inválido' }, { status: 400 });
  }

  const supabase = createServiceRoleSupabaseClient();

  // Upsert lead — on conflict update plan and source
  const { data: existing } = await supabase
    .from('email_leads')
    .select('id, status')
    .eq('email', email)
    .maybeSingle();

  const isNew = !existing;

  await supabase.from('email_leads').upsert(
    {
      email,
      name:          name ?? null,
      plan_interest: (plan as ProductId | undefined) ?? null,
      source,
      metadata:      { saved_at: new Date().toISOString() },
    },
    { onConflict: 'email' },
  );

  // Only send abandoned-cart email on first capture and if not already a customer/unsubscribed
  if (isNew && plan && plan in productsById) {
    const product = productsById[plan as ProductId];
    try {
      const resend = getResendClient();
      const unsubUrl = buildUnsubscribeUrl(email);
      await resend.emails.send({
        from:    getFromEmail(),
        to:      email,
        subject: abandonedSubject(),
        react:   AbandonedCart({
          name,
          plan:           product.name,
          price:          product.price,
          features:       product.features,
          unsubscribeUrl: unsubUrl,
        }),
      });

      await supabase.from('email_leads')
        .update({ last_emailed_at: new Date().toISOString(), metadata: { sequence_step: 1, saved_at: new Date().toISOString() } })
        .eq('email', email);
    } catch (err) {
      // Email failure must not break the 200 response to the client
      console.error('[leads/save] email send failed:', err);
    }
  }

  return NextResponse.json({ success: true });
}
