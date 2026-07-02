import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { tryGetSupabaseEnv } from '@/lib/supabase/env';
import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';

/**
 * /auth/confirm — server-side OTP confirmation for email links.
 *
 * Invite / recovery emails link here with ?token_hash=…&type=…&next=…
 * (built from generateLink().properties.hashed_token, NOT the Supabase-hosted
 * action_link, so the whole flow stays on our domain and the session cookies
 * are set server-side before the next page loads).
 *
 * On success:
 *   1. sb-* session cookies are written to the redirect response.
 *   2. invitations.user_id / orders.owner_user_id that are still NULL and
 *      match the user's email are linked to the Auth user (fixes guest
 *      purchases that were never tied to an account).
 *   3. Redirect to `next` (default /auth/set-password).
 *
 * On failure (expired / already-used link): redirect to /auth/link-expirado
 * where the user can request a fresh link.
 */

type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';

const VALID_OTP_TYPES = new Set<string>([
  'signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email',
]);

function safeNextPath(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('://')) {
    return raw;
  }
  return fallback;
}

async function linkAuthUserToPurchases(userId: string, email: string): Promise<void> {
  try {
    const svc = createServiceRoleSupabaseClient();

    const { error: invErr } = await svc
      .from('invitations')
      .update({ user_id: userId })
      .is('user_id', null)
      .ilike('customer_email', email);
    if (invErr) console.warn('[authConfirm] invitations link failed:', invErr.message);

    const { error: ordErr } = await svc
      .from('orders')
      .update({ owner_user_id: userId })
      .is('owner_user_id', null)
      .ilike('customer_email', email);
    if (ordErr) console.warn('[authConfirm] orders link failed:', ordErr.message);

    console.log('[authConfirm] linked purchases to user %s (%s)', userId, email);
  } catch (e) {
    // Non-fatal: session is already established; linking can be retried later.
    console.warn('[authConfirm] linkAuthUserToPurchases threw:', e);
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const tokenHash = searchParams.get('token_hash');
  const typeRaw   = searchParams.get('type');
  const type      = (typeRaw && VALID_OTP_TYPES.has(typeRaw) ? typeRaw : null) as EmailOtpType | null;
  const next      = safeNextPath(searchParams.get('next'), '/auth/set-password');
  const emailHint = searchParams.get('email') ?? '';

  const expiredUrl = new URL('/auth/link-expirado', request.url);
  if (emailHint) expiredUrl.searchParams.set('email', emailHint);

  if (!tokenHash || !type) {
    console.warn('[authConfirm] missing token_hash or type');
    return NextResponse.redirect(expiredUrl);
  }

  const env = tryGetSupabaseEnv();
  if (!env) {
    return NextResponse.redirect(new URL('/login?error=config', request.url));
  }

  const response = NextResponse.redirect(new URL(next, request.url));

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

  if (error || !data.session) {
    console.warn('[authConfirm] verifyOtp failed type=%s: %s', type, error?.message ?? 'no session');
    return NextResponse.redirect(expiredUrl);
  }

  const user = data.session.user;
  console.log('[authConfirm] OTP verified type=%s user=%s → %s', type, user.id, next);

  if (user.email) {
    await linkAuthUserToPurchases(user.id, user.email);
  }

  return response;
}
