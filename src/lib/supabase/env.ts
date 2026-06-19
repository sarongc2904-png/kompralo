/**
 * Validates required Supabase environment variables and returns them typed.
 * Throws at module load time so missing config surfaces immediately on startup.
 */

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing environment variable: ${name}.\n` +
        'Copy .env.example to .env.local and fill in the Supabase values.',
    );
  }
  return value;
}

export function getSupabaseEnv() {
  return {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    anonKey: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  };
}

/**
 * Non-throwing variant. Returns null if any variable is missing.
 * Used by repositories to decide whether to attempt Supabase or fall back to local.
 */
export function tryGetSupabaseEnv(): { url: string; anonKey: string } | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return null;
  return { url, anonKey };
}

export function getSupabaseServiceEnv() {
  return {
    url: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}
