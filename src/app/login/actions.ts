'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface SendMagicLinkResult {
  success: boolean;
  error?: string;
}

export async function sendMagicLink(
  _prev: unknown,
  formData: FormData,
): Promise<SendMagicLinkResult> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';

  // Sanitize redirect: must be a relative internal path, no protocol, no double-slash.
  const rawRedirect = (formData.get('redirect') as string | null) ?? '/cliente';
  const safeRedirectTo =
    rawRedirect.startsWith('/') &&
    !rawRedirect.startsWith('//') &&
    !rawRedirect.includes('http://')  &&
    !rawRedirect.includes('https://')
      ? rawRedirect
      : '/cliente';

  if (!email) return { success: false, error: 'El correo es requerido.' };

  // ── Build emailRedirectTo using URL API (never string concatenation) ──────────
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;

  // Safe diagnostic log — no tokens or secrets.
  console.log('[login] rawAppUrl:', rawAppUrl ?? '(not set)');
  console.log('[login] safeRedirectTo:', safeRedirectTo);
  console.log('[login] NODE_ENV:', process.env.NODE_ENV);

  if (!rawAppUrl) {
    console.error('[login] NEXT_PUBLIC_APP_URL is not configured');
    return { success: false, error: 'NEXT_PUBLIC_APP_URL no está configurada.' };
  }

  let appOrigin: string;
  try {
    appOrigin = new URL(rawAppUrl).origin;
  } catch {
    console.error('[login] NEXT_PUBLIC_APP_URL is not a valid URL:', rawAppUrl);
    return { success: false, error: 'NEXT_PUBLIC_APP_URL inválida.' };
  }

  // Build callback URL with URL API — no string concatenation, no double-slash risk.
  const callbackUrl = new URL('/auth/callback', appOrigin);
  callbackUrl.searchParams.set('redirect', safeRedirectTo);
  const emailRedirectTo = callbackUrl.toString();

  console.log('[login] emailRedirectTo:', emailRedirectTo);

  try {
    const supabase = await createServerSupabaseClient();

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo,
      },
    });

    if (error) {
      console.error('[login] signInWithOtp error:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[login] magic link sent successfully');
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al enviar el correo.';
    console.error('[login] unexpected error:', msg);
    return { success: false, error: msg };
  }
}
