import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import type { CookieOptions } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Cookies refreshed by applyServerStorage (token refresh only).
  // Collected BEFORE the response is built so we can set them on it.
  const cookiesToApply: Array<{ name: string; value: string; options: CookieOptions }> = [];

  if (url && anonKey) {
    const supabase = createServerClient(url, anonKey, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          // Update request.cookies (name+value only — RequestCookies.set does
          // not accept cookie attributes). This syncs the new values into
          // request.headers so request.cookies.getAll() is fresh below.
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          cookiesToApply.push(...cookiesToSet);
        },
      },
    });

    // getUser() validates the session server-side and triggers token refresh
    // when needed (which calls setAll above). Must run BEFORE requestHeaders
    // is built so that any request.cookies.set() calls have already happened.
    await supabase.auth.getUser();
  }

  // Build the forwarded request headers AFTER getUser() so that any cookies
  // updated via request.cookies.set() are reflected in request.headers and
  // therefore in request.cookies.getAll() below.
  //
  // We explicitly reconstruct the Cookie header from request.cookies.getAll()
  // rather than relying on new Headers(request.headers) alone. This is a
  // safeguard: in some runtimes the Cookie header may not survive the
  // Headers copy, while request.cookies is always authoritative.
  const allCookies = request.cookies.getAll();
  const cookieHeader = allCookies.map(({ name, value }) => `${name}=${value}`).join('; ');

  const requestHeaders = new Headers(request.headers);
  if (cookieHeader) requestHeaders.set('cookie', cookieHeader);
  requestHeaders.set('x-pathname', pathname);

  const response = NextResponse.next({ request: { headers: requestHeaders } });

  // Write any refreshed tokens to the browser so it stores the updated session.
  cookiesToApply.forEach(({ name, value, options }) =>
    response.cookies.set(name, value, options),
  );

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
