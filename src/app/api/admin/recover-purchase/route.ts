/**
 * POST /api/admin/recover-purchase
 *
 * Resends the confirmation email for a paid order whose email was never sent.
 * Requires x-admin-secret header matching RECOVERY_ADMIN_SECRET env var.
 *
 * Body: { stripe_session_id: string }
 */

import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { SupabaseOrderRepository } from '@/domain/orders';
import { SupabaseInvitationRepository } from '@/domain/invitations/supabase.repository';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { sendOrderConfirmationEmail } from '@/lib/resend';
import { createInvitationAccessToken } from '@/lib/access/createInvitationAccessToken';
import { resolvePurchasedPlanId } from '@/domain/plans/types';

function err(msg: string, status = 400) {
  return NextResponse.json({ success: false, error: msg }, { status });
}

export async function POST(request: NextRequest) {
  // Auth
  const secret = request.headers.get('x-admin-secret');
  if (!secret || secret !== process.env.RECOVERY_ADMIN_SECRET) {
    return err('Unauthorized', 401);
  }

  let body: unknown;
  try { body = await request.json(); } catch { return err('Invalid JSON', 400); }

  const stripeSessionId = (body as Record<string, unknown>).stripe_session_id;
  if (typeof stripeSessionId !== 'string' || !stripeSessionId.startsWith('cs_')) {
    return err('stripe_session_id is required and must start with cs_');
  }

  const supabase     = createServiceRoleSupabaseClient();
  const orderRepo    = new SupabaseOrderRepository(supabase);
  const invRepo      = new SupabaseInvitationRepository(supabase);

  // 1. Fetch Stripe session
  let session: Awaited<ReturnType<typeof stripe.checkout.sessions.retrieve>>;
  try {
    session = await stripe.checkout.sessions.retrieve(stripeSessionId, {
      expand: ['customer_details'],
    });
  } catch (e) {
    return err(`Stripe fetch failed: ${e instanceof Error ? e.message : String(e)}`, 502);
  }

  if (session.payment_status !== 'paid') {
    return err(`Session payment_status is "${session.payment_status}", not "paid".`, 422);
  }

  const customerEmail = session.customer_details?.email ?? null;
  const customerName  = session.customer_details?.name  ?? null;
  const rawPlanId     = session.metadata?.plan_id ?? session.metadata?.planId;
  const planResolution = resolvePurchasedPlanId(rawPlanId, session.amount_total);
  const planId        = planResolution.planId;
  const ownerUserId   = session.metadata?.ownerUserId ?? null;
  const ownerEmail    = session.metadata?.ownerEmail ?? customerEmail;
  const emailTo       = ownerEmail ?? customerEmail;

  if (!emailTo)  return err('No recipient email found in Stripe session');

  if (planResolution.error) {
    console.error(
      '[recover-purchase] plan resolution warning — session=%s source=%s: %s',
      stripeSessionId,
      planResolution.source,
      planResolution.error,
    );
  }

  // 2. Get or create order
  let order = await orderRepo.getBySessionId(stripeSessionId);
  if (!order) {
    order = await orderRepo.create({
      stripeSessionId,
      stripePaymentIntentId: typeof session.payment_intent === 'string' ? session.payment_intent : null,
      productId: planId,
      planId,
      amountTotal: session.amount_total ?? 0,
      currency: session.currency ?? 'mxn',
      status: 'paid',
      customerEmail,
      customerName,
      ownerUserId,
    });
    console.log('[recover-purchase] order created:', order.id);
  }

  // 3. Get or create invitation
  let finalInvitationId = order.invitationId ?? session.metadata?.invitationId ?? null;

  if (!finalInvitationId && customerEmail) {
    const { invitationId: newId } = await invRepo.createFromPaidOrder({
      planId,
      customerEmail,
      customerName,
      stripeSessionId,
      ownerUserId,
    });
    finalInvitationId = newId;
    await orderRepo.attachInvitationToOrder({ stripeSessionId, invitationId: newId });
    console.log('[recover-purchase] invitation created:', newId);
  }

  if (!finalInvitationId) {
    return err('Could not resolve invitation id', 500);
  }

  // 4. Resend email (even if previously attempted)
  const appUrlValue = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrlValue) return err('NEXT_PUBLIC_APP_URL not configured', 500);
  const appUrl = new URL(appUrlValue);

  const freshOrder = await orderRepo.getBySessionId(stripeSessionId);
  if (!freshOrder) return err('Order not found after upsert', 500);

  try {
    const { rawToken } = await createInvitationAccessToken({
      invitationId: finalInvitationId,
      orderId: freshOrder.id,
      customerEmail: emailTo,
    });
    const accessUrl = new URL('/access/consume', appUrl);
    accessUrl.searchParams.set('token', rawToken);

    let inviteUrl: string | null = null;
    try {
      const setPasswordUrl = new URL('/auth/set-password', appUrl);
      const { data: linkData } = await supabase.auth.admin.generateLink({
        type: 'invite',
        email: emailTo,
        options: { redirectTo: setPasswordUrl.toString() },
      });
      inviteUrl = linkData?.properties?.action_link ?? null;
    } catch { /* non-fatal */ }

    await sendOrderConfirmationEmail({
      to: emailTo,
      customerName,
      planId,
      amountTotal: session.amount_total,
      currency: session.currency,
      accessUrl: accessUrl.toString(),
      inviteUrl,
      loginUrl: new URL('/login', appUrl).toString(),
    });

    await orderRepo.markConfirmationEmailSent(stripeSessionId);
    console.log('[recover-purchase] email sent to', emailTo, 'for session', stripeSessionId);

    return NextResponse.json({
      success: true,
      orderId: freshOrder.id,
      invitationId: finalInvitationId,
      emailSentTo: emailTo,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    await orderRepo.markConfirmationEmailFailed(stripeSessionId, msg).catch(() => {});
    return err(`Email failed: ${msg}`, 502);
  }
}
