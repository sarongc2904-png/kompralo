'use client';

import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import type { Database } from '@/lib/supabase/types';
import { tryGetSupabaseEnv } from '@/lib/supabase/env';

export function createBrowserSupabaseClient() {
  const env = tryGetSupabaseEnv();
  if (!env) {
    throw new Error('El servicio de almacenamiento no está disponible en este momento. Recarga la página o contacta soporte.');
  }
  return createClient<Database>(env.url, env.anonKey);
}

/**
 * Browser Supabase client backed by cookies (not localStorage).
 * Use this in Client Components that need to sign in / sign out so that
 * the session cookies are visible to Server Components and middleware on
 * the very next request.
 */
export function createSupabaseBrowserClient() {
  const env = tryGetSupabaseEnv();
  if (!env) {
    throw new Error('Supabase no está configurado. Recarga la página.');
  }
  return createBrowserClient<Database>(env.url, env.anonKey);
}
