'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { getSupabaseEnv } from '@/lib/supabase/env';

/**
 * Creates a Supabase client for use in browser (Client Components).
 * Uses the anon key — subject to RLS policies.
 * Call once per component tree; do not call in Server Components.
 */
export function createBrowserSupabaseClient() {
  const { url, anonKey } = getSupabaseEnv();
  return createClient<Database>(url, anonKey);
}
