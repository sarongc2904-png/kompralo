import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { getSupabaseEnv, getSupabaseServiceEnv } from '@/lib/supabase/env';

/**
 * Creates a Supabase client for use in Server Components, Route Handlers,
 * and Server Actions. Reads/writes cookies via next/headers.
 * Must be called inside an async server context.
 */
export async function createServerSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();
  const cookieStore = await cookies();

  return createServerClient<Database>(url, anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options),
        );
      },
    },
  });
}

/**
 * Creates a Supabase client using the service role key.
 * Use ONLY in server-side code that must bypass RLS (e.g. webhook handlers).
 * Never expose to the client or include in 'use client' files.
 */
export function createServiceRoleSupabaseClient() {
  const { url, serviceRoleKey } = getSupabaseServiceEnv();
  return createClient<Database>(url, serviceRoleKey);
}
