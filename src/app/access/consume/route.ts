import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { hashInvitationAccessToken } from '@/lib/access/createInvitationAccessToken';
import {
  mergeInvitationAccessCookieValue,
  INVITATION_ACCESS_COOKIE,
} from '@/lib/access/verifyInvitationAccess';

const MAX_TOKEN_LENGTH = 256;

type AccessTokenRow = {
  invitation_id: string;
  order_id: string | null;
  customer_email: string;
  expires_at: string;
  purpose: string;
};

function redirectToLogin(request: NextRequest, error: 'invalid_link' | 'expired_link' | 'config') {
  const response = NextResponse.redirect(new URL(`/login?error=${error}`, request.url));
  response.headers.set('Cache-Control', 'no-store');
  response.headers.set('Referrer-Policy', 'no-referrer');
  return response;
}

export async function GET(request: NextRequest) {
  const rawToken = request.nextUrl.searchParams.get('token')?.trim() ?? '';
  if (!rawToken || rawToken.length > MAX_TOKEN_LENGTH || !/^[A-Za-z0-9_-]+$/.test(rawToken)) {
    return redirectToLogin(request, 'invalid_link');
  }

  try {
    const supabase = createServiceRoleSupabaseClient();
    const tokenHash = hashInvitationAccessToken(rawToken);
    const { data, error } = await supabase
      .from('invitation_access_tokens')
      .select('invitation_id,order_id,customer_email,expires_at,purpose')
      .eq('token_hash', tokenHash)
      .maybeSingle();

    if (error || !data) return redirectToLogin(request, 'invalid_link');

    const token = data as AccessTokenRow;
    const expiresAt = new Date(token.expires_at);
    if (!Number.isFinite(expiresAt.getTime()) || expiresAt.getTime() <= Date.now()) {
      return redirectToLogin(request, 'expired_link');
    }
    if (token.purpose !== 'post_payment_access') {
      return redirectToLogin(request, 'invalid_link');
    }

    const normalizedEmail = token.customer_email.trim().toLowerCase();
    const { data: invitation } = await supabase
      .from('invitations')
      .select('id,customer_email')
      .eq('id', token.invitation_id)
      .maybeSingle();

    if (
      !invitation ||
      typeof invitation.customer_email !== 'string' ||
      invitation.customer_email.trim().toLowerCase() !== normalizedEmail
    ) {
      return redirectToLogin(request, 'invalid_link');
    }

    if (token.order_id) {
      const { data: order } = await supabase
        .from('orders')
        .select('invitation_id,customer_email,status')
        .eq('id', token.order_id)
        .maybeSingle();

      if (
        !order ||
        order.status !== 'paid' ||
        order.invitation_id !== token.invitation_id ||
        typeof order.customer_email !== 'string' ||
        order.customer_email.trim().toLowerCase() !== normalizedEmail
      ) {
        return redirectToLogin(request, 'invalid_link');
      }
    }

    // Audit-only timestamp — a transient DB error must not bounce a valid
    // token holder to /login.
    const { error: updateError } = await supabase
      .from('invitation_access_tokens')
      .update({ last_used_at: new Date().toISOString() })
      .eq('token_hash', tokenHash);
    if (updateError) {
      console.warn('[access/consume] last_used_at update failed (non-fatal):', updateError.message);
    }

    const { value: cookieValue, maxAgeSeconds: maxAge } = mergeInvitationAccessCookieValue({
      existingCookieValue: request.cookies.get(INVITATION_ACCESS_COOKIE)?.value,
      invitationId: token.invitation_id,
      expiresAt,
    });
    const response = NextResponse.redirect(
      new URL(`/dashboard/invitations/${token.invitation_id}/edit`, request.url),
    );
    response.cookies.set(INVITATION_ACCESS_COOKIE, cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
      priority: 'high',
    });
    response.headers.set('Cache-Control', 'no-store');
    response.headers.set('Referrer-Policy', 'no-referrer');
    return response;
  } catch {
    return redirectToLogin(request, 'config');
  }
}

