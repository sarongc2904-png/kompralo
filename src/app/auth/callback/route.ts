import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { tryGetSupabaseEnv } from '@/lib/supabase/env';

type EmailOtpType = 'signup' | 'invite' | 'magiclink' | 'recovery' | 'email_change' | 'email';

const VALID_OTP_TYPES = new Set<string>([
  'signup', 'invite', 'magiclink', 'recovery', 'email_change', 'email',
]);

function safeNextPath(raw: string | null, fallback: string): string {
  if (!raw) return fallback;
  // Only allow internal relative paths — no protocol, no double-slash, no external hosts.
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.includes('://')) {
    return raw;
  }
  return fallback;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code      = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const typeRaw   = searchParams.get('type');
  const type      = (typeRaw && VALID_OTP_TYPES.has(typeRaw) ? typeRaw : null) as EmailOtpType | null;

  // Support both `next` (Supabase standard) and `redirect` (legacy).
  // `next` takes priority. Default to /cliente (customer panel).
  const next = safeNextPath(
    searchParams.get('next') ?? searchParams.get('redirect'),
    '/cliente',
  );

  console.log('[authCallback] received has_code=%s has_token_hash=%s type=%s next=%s',
    !!code, !!tokenHash, typeRaw ?? 'none', next);

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

  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (error) {
      console.warn('[authCallback] exchangeCodeForSession failed: %s', error.message);
      return NextResponse.redirect(new URL('/login?error=expired_link', request.url));
    }
    console.log('[authCallback] session exchanged successfully → %s', next);
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      console.warn('[authCallback] verifyOtp failed type=%s: %s', type, error.message);
      return NextResponse.redirect(new URL('/login?error=expired_link', request.url));
    }
    console.log('[authCallback] OTP verified type=%s → %s', type, next);
  } else {
    console.warn('[authCallback] no code or token_hash has_type=%s', !!typeRaw);
    return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
  }

  return response;
}
