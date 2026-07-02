import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/stripe';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { SupabaseOrderRepository } from '@/domain/orders';
import { createInvitationAccessToken } from '@/lib/access/createInvitationAccessToken';

const MAX_SESSION_ID_LENGTH = 256;
const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX_TOKENS = 3;

function jsonError(error: string, status: number) {
  return NextResponse.json({ success: false, error }, { status });
}

function normalizeEmail(value?: string | null): string | null {
  const normalized = value?.trim().toLowerCase();
  return normalized ? normalized : null;
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return jsonError('invalid_request', 400);
  }

  const sessionId = typeof (body as { session_id?: unknown })?.session_id === 'string'
    ? (body as { session_id: string }).session_id.trim()
    : '';

  if (!sessionId || sessionId.length > MAX_SESSION_ID_LENGTH || !sessionId.startsWith('cs_')) {
    return jsonError('invalid_session', 400);
  }

  try {
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch {
      return jsonError('stripe_session_not_found', 404);
    }

    if (session.id !== sessionId || session.payment_status !== 'paid') {
      return jsonError('payment_not_confirmed', 403);
    }

    const supabase = createServiceRoleSupabaseClient();
    const orderRepo = new SupabaseOrderRepository(supabase);
    // Multi-cart sessions have N orders; single purchases have exactly one.
    const orders = await orderRepo.listBySessionId(sessionId);

    if (orders.length === 0) {
      return jsonError('order_not_found', 404);
    }

    const stripeEmail = normalizeEmail(session.customer_details?.email ?? session.customer_email);
    if (!stripeEmail) {
      return jsonError('missing_order_email', 403);
    }

    // Validate each order; collect the ones eligible for a fresh token.
    const eligible: { orderId: string; invitationId: string; customerEmail: string }[] = [];
    for (const order of orders) {
      if (order.status !== 'paid' || !order.invitationId || !order.customerEmail) continue;

      const orderEmail = normalizeEmail(order.customerEmail);
      if (!orderEmail || stripeEmail !== orderEmail) continue;

      const { data: invitation } = await supabase
        .from('invitations')
        .select('id, customer_email, status')
        .eq('id', order.invitationId)
        .maybeSingle();
      if (!invitation) continue;
      if ((invitation as { status?: string }).status === 'deleted') continue;

      const invitationEmail = normalizeEmail((invitation as { customer_email?: string | null }).customer_email);
      if (!invitationEmail || invitationEmail !== orderEmail) continue;

      eligible.push({ orderId: order.id, invitationId: order.invitationId, customerEmail: order.customerEmail });
    }

    if (eligible.length === 0) {
      // Preserve the legacy error semantics for the single-order case.
      const first = orders[0];
      if (first.status !== 'paid') return jsonError('order_not_paid', 409);
      if (!first.invitationId)     return jsonError('invitation_not_ready', 409);
      return jsonError('email_mismatch', 403);
    }

    // Rate limit scales with cart size: each request mints one token per order.
    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: rateLimitError } = await supabase
      .from('invitation_access_tokens')
      .select('id', { count: 'exact', head: true })
      .in('order_id', eligible.map((e) => e.orderId))
      .eq('purpose', 'post_payment_access')
      .gte('created_at', since);

    if (rateLimitError) {
      return jsonError('rate_limit_check_failed', 500);
    }
    if ((count ?? 0) >= RATE_LIMIT_MAX_TOKENS * eligible.length) {
      return jsonError('too_many_requests', 429);
    }

    const accessUrls: string[] = [];
    for (const item of eligible) {
      const { rawToken } = await createInvitationAccessToken({
        invitationId: item.invitationId,
        orderId: item.orderId,
        customerEmail: item.customerEmail,
      });
      accessUrls.push(`/access/consume?token=${encodeURIComponent(rawToken)}`);
    }

    // accessUrl stays the first invitation for backward compatibility with
    // AccessFromSessionButton; accessUrls carries the full list.
    return NextResponse.json(
      { success: true, accessUrl: accessUrls[0], accessUrls, invitationCount: eligible.length },
      { status: 200 },
    );
  } catch {
    return jsonError('access_from_session_failed', 500);
  }
}
