import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // Build initial request headers — adds x-pathname so Server Components can
  // read the current route without relying on searchParams or usePathname.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-pathname', pathname);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return response;

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        // 1. Update the mutable RequestCookies store on the request object.
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        // 2. Rebuild the Cookie header so Server Components see the refreshed tokens.
        //    request.cookies.getAll() now includes the newly set cookies.
        //    We rebuild requestHeaders (which has x-pathname) with the fresh Cookie value
        //    so the downstream NextResponse carries BOTH the custom header AND new tokens.
        const freshCookieHeader = request.cookies
          .getAll()
          .map((c) => `${c.name}=${c.value}`)
          .join('; ');
        requestHeaders.set('cookie', freshCookieHeader);

        response = NextResponse.next({ request: { headers: requestHeaders } });

        // 3. Also set cookies on the response so the browser stores them.
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // Refresh session on every request — required by @supabase/ssr to keep tokens fresh.
  const { data: { user: mwUser } } = await supabase.auth.getUser();

  // TEMP diagnostic — remove after auth bug is resolved.
  const isProtectedRoute =
    pathname.startsWith('/cliente/invitaciones/') ||
    pathname.startsWith('/dashboard/invitations/');
  if (isProtectedRoute) {
    console.log('[middleware] route=%s hasUser=%s userId=%s',
      pathname, !!mwUser, mwUser?.id ?? 'null');
    // Middleware does NOT redirect — it only refreshes tokens.
    // If you see "redirect to login" it is coming from page.tsx, not here.
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
