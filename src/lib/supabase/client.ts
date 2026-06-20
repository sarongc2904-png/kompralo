'use client';

import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/types';
import { tryGetSupabaseEnv } from '@/lib/supabase/env';

export function createBrowserSupabaseClient() {
  const env = tryGetSupabaseEnv();
  if (!env) {
    throw new Error('El servicio de almacenamiento no está disponible en este momento. Recarga la página o contacta soporte.');
  }
  return createClient<Database>(env.url, env.anonKey);
}
