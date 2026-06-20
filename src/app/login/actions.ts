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

  // Sanitize redirect — only allow relative internal paths.
  const rawRedirect = (formData.get('redirect') as string | null) ?? '/dashboard';
  const redirectTo =
    rawRedirect.startsWith('/') && !rawRedirect.startsWith('//')
      ? rawRedirect
      : '/dashboard';

  if (!email) return { success: false, error: 'El correo es requerido.' };

  // Validate APP_URL before building the redirect URL.
  // Use .origin to strip any trailing slash or path, preventing double-slash paths
  // that Supabase rejects with "Invalid path specified in request URL".
  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL?.trim() ?? '';
  if (!rawAppUrl) {
    console.error('[login/sendMagicLink] NEXT_PUBLIC_APP_URL is not set');
    return { success: false, error: 'Error de configuración del servidor. Contacta a soporte.' };
  }

  let emailRedirectTo: string;
  try {
    const appUrl = new URL(rawAppUrl);
    emailRedirectTo = `${appUrl.origin}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`;
  } catch {
    console.error('[login/sendMagicLink] NEXT_PUBLIC_APP_URL is not a valid URL: %s', rawAppUrl);
    return { success: false, error: 'Error de configuración del servidor. Contacta a soporte.' };
  }

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
      console.error('[login/sendMagicLink] signInWithOtp error: %s', error.message);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al enviar el correo.';
    return { success: false, error: msg };
  }
}
