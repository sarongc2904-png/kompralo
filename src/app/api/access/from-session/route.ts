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

function logReject(reason: string, details?: Record<string, unknown>) {
  console.error('[access/from-session] rejected:', reason, details ?? {});
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
    logReject('invalid_request_json');
    return jsonError('invalid_request', 400);
  }

  const sessionId = typeof (body as { session_id?: unknown })?.session_id === 'string'
    ? (body as { session_id: string }).session_id.trim()
    : '';

  if (!sessionId || sessionId.length > MAX_SESSION_ID_LENGTH || !sessionId.startsWith('cs_')) {
    logReject('invalid_session_id', {
      hasSessionId: !!sessionId,
      length: sessionId.length,
      prefix: sessionId.slice(0, 3),
    });
    return jsonError('invalid_session', 400);
  }

  try {
    let session;
    try {
      session = await stripe.checkout.sessions.retrieve(sessionId);
    } catch (error) {
      logReject('stripe_session_retrieve_failed', {
        sessionId,
        error: error instanceof Error ? error.message : String(error),
      });
      return jsonError('stripe_session_not_found', 404);
    }

    if (session.id !== sessionId || session.payment_status !== 'paid') {
      logReject('payment_status_not_paid', {
        sessionId,
        retrievedId: session.id,
        paymentStatus: session.payment_status,
      });
      return jsonError('payment_not_confirmed', 403);
    }

    const supabase = createServiceRoleSupabaseClient();
    const orderRepo = new SupabaseOrderRepository(supabase);
    const order = await orderRepo.getBySessionId(sessionId);

    if (!order) {
      logReject('order_not_found_by_session_id', { sessionId });
      return jsonError('order_not_found', 404);
    }
    if (order.status !== 'paid') {
      logReject('order_status_not_paid', {
        sessionId,
        orderId: order.id,
        orderStatus: order.status,
      });
      return jsonError('order_not_paid', 409);
    }
    if (!order.invitationId) {
      logReject('order_missing_invitation_id', {
        sessionId,
        orderId: order.id,
      });
      return jsonError('invitation_not_ready', 409);
    }
    if (!order.customerEmail) {
      logReject('order_missing_customer_email', {
        sessionId,
        orderId: order.id,
      });
      return jsonError('missing_order_email', 403);
    }

    const orderEmail = normalizeEmail(order.customerEmail);
    const stripeEmail = normalizeEmail(session.customer_details?.email ?? session.customer_email);
    if (!orderEmail || !stripeEmail || stripeEmail !== orderEmail) {
      logReject('stripe_email_does_not_match_order_customer_email', {
        sessionId,
        orderId: order.id,
        hasStripeEmail: !!stripeEmail,
        stripeEmail,
        orderEmail,
      });
      return jsonError('email_mismatch', 403);
    }

    const { data: invitation, error: invitationError } = await supabase
      .from('invitations')
      .select('id, customer_email')
      .eq('id', order.invitationId)
      .maybeSingle();

    if (invitationError || !invitation) {
      logReject('invitation_not_found', {
        sessionId,
        orderId: order.id,
        invitationId: order.invitationId,
        error: invitationError?.message ?? null,
      });
      return jsonError('invitation_not_found', 404);
    }

    const invitationEmail = normalizeEmail((invitation as { customer_email?: string | null }).customer_email);
    if (!invitationEmail || invitationEmail !== orderEmail) {
      logReject('invitation_customer_email_does_not_match_order_customer_email', {
        sessionId,
        orderId: order.id,
        invitationId: order.invitationId,
        invitationEmail,
        orderEmail,
      });
      return jsonError('invitation_email_mismatch', 403);
    }

    const since = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString();
    const { count, error: rateLimitError } = await supabase
      .from('invitation_access_tokens')
      .select('id', { count: 'exact', head: true })
      .eq('order_id', order.id)
      .eq('purpose', 'post_payment_access')
      .gte('created_at', since);

    if (rateLimitError) {
      logReject('rate_limit_check_failed', {
        sessionId,
        orderId: order.id,
        error: rateLimitError.message,
      });
      return jsonError('rate_limit_check_failed', 500);
    }
    if ((count ?? 0) >= RATE_LIMIT_MAX_TOKENS) {
      logReject('rate_limit_exceeded', {
        sessionId,
        orderId: order.id,
        count,
        max: RATE_LIMIT_MAX_TOKENS,
      });
      return jsonError('too_many_requests', 429);
    }

    const { rawToken } = await createInvitationAccessToken({
      invitationId: order.invitationId,
      orderId: order.id,
      customerEmail: order.customerEmail,
    });

    const accessUrl = `/access/consume?token=${encodeURIComponent(rawToken)}`;
    return NextResponse.json({ success: true, accessUrl }, { status: 200 });
  } catch (error) {
    logReject('unexpected_error', {
      sessionId,
      error: error instanceof Error ? error.message : String(error),
    });
    return jsonError('access_from_session_failed', 500);
  }
}
