import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { tryGetSupabaseEnv } from '@/lib/supabase/env';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code      = searchParams.get('code');
  const tokenHash = searchParams.get('token_hash');
  const type      = searchParams.get('type') as 'magiclink' | 'email' | null;

  // Sanitize redirect: only allow relative paths to prevent open redirect attacks.
  const rawRedirect = searchParams.get('redirect') ?? '/dashboard';
  const redirectTo =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/dashboard';

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
      return NextResponse.redirect(new URL('/login?error=expired_link', request.url));
    }
  } else if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
    if (error) {
      return NextResponse.redirect(new URL('/login?error=expired_link', request.url));
    }
  } else {
    return NextResponse.redirect(new URL('/login?error=invalid_link', request.url));
  }

  return response;
}
