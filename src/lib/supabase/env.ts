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

function isHttpUrl(value: string | undefined): value is string {
  if (!value) return false;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export function getSupabaseEnv() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  if (!isHttpUrl(url)) {
    throw new Error('Invalid environment variable: NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.');
  }

  return {
    url,
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
  if (!isHttpUrl(url) || !anonKey) return null;
  return { url, anonKey };
}

export function getSupabaseServiceEnv() {
  const url = requireEnv('NEXT_PUBLIC_SUPABASE_URL');
  if (!isHttpUrl(url)) {
    throw new Error('Invalid environment variable: NEXT_PUBLIC_SUPABASE_URL must be a valid HTTP or HTTPS URL.');
  }

  return {
    url,
    serviceRoleKey: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  };
}
