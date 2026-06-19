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
  const redirectTo = (formData.get('redirect') as string | null) ?? '/dashboard';

  if (!email) return { success: false, error: 'El correo es requerido.' };

  try {
    const supabase = await createServerSupabaseClient();
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${appUrl}/auth/callback?redirect=${encodeURIComponent(redirectTo)}`,
      },
    });

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al enviar el correo.';
    return { success: false, error: msg };
  }
}
