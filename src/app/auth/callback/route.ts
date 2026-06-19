import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { tryGetSupabaseEnv } from '@/lib/supabase/env';

// Valid OTP types accepted by supabase.auth.verifyOtp
type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';

const VALID_OTP_TYPES = new Set<string>([
  'signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email',
]);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code      = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const typeRaw   = searchParams.get('type');
  const type      = (typeRaw && VALID_OTP_TYPES.has(typeRaw) ? typeRaw : null) as EmailOtpType | null;

  // Sanitize redirect: only allow relative paths to prevent open redirect attacks.
  const rawRedirect = searchParams.get('redirect') ?? '/dashboard';
  const redirectTo =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/dashboard';

  // Safe debug logging — no tokens, no codes.
  console.log('[auth/callback] has_code=%s has_token_hash=%s type=%s redirect=%s',
    !!code, !!tokenHash, typeRaw ?? 'none', redirectTo);

  const env = tryGetSupabaseEnv();
  if (!env) {
    return NextResponse.redirect(new URL('/login?error=config', request.url));
  }

  // Build the redirect response first so we can attach session cookies to it.
  const response = NextResponse.redirect(new URL(redirectTo, request.url));

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

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.warn('[auth/callback] exchangeCodeForSession failed: %s', error.message);
      return NextResponse.redirect(new URL('/login?error=expired_link', request.url));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      console.warn('[auth/callback] verifyOtp failed (type=%s): %s', type, error.message);
      return NextResponse.redirect(new URL('/login?error=expired_link', request.url));
    }
  } else {
    console.warn('[auth/callback] no code or token_hash — has_type=%s', !!typeRaw);
    return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
  }

  return response;
}
