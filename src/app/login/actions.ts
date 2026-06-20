'use server';

import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface SendMagicLinkResult {
  success: boolean;
  error?: string;
}

export interface SignInResult {
  success: boolean;
  error?: string;
}

export interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

export interface UpdatePasswordResult {
  success: boolean;
  error?: string;
}

// ─── Sign in with email + password ───────────────────────────────────────────

export async function signInWithPassword(
  _prev: SignInResult | null,
  formData: FormData,
): Promise<SignInResult> {
  const email    = (formData.get('email')    as string | null)?.trim() ?? '';
  const password = (formData.get('password') as string | null) ?? '';
  const rawRedirect = (formData.get('redirect') as string | null) ?? '/cliente';
  const safeRedirect =
    rawRedirect.startsWith('/') &&
    !rawRedirect.startsWith('//') &&
    !rawRedirect.includes('http://')  &&
    !rawRedirect.includes('https://')
      ? rawRedirect
      : '/cliente';

  if (!email)    return { success: false, error: 'El correo es requerido.' };
  if (!password) return { success: false, error: 'La contraseña es requerida.' };

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const msg = error.message.includes('Invalid login credentials')
        ? 'Correo o contraseña incorrectos.'
        : error.message;
      return { success: false, error: msg };
    }
    redirect(safeRedirect);
  } catch (err: unknown) {
    // redirect() throws a NEXT_REDIRECT — let it propagate.
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    const msg = err instanceof Error ? err.message : 'Error al iniciar sesión.';
    return { success: false, error: msg };
  }
}

// ─── Request password reset ───────────────────────────────────────────────────

export async function requestPasswordReset(
  _prev: ResetPasswordResult | null,
  formData: FormData,
): Promise<ResetPasswordResult> {
  const email = (formData.get('email') as string | null)?.trim() ?? '';
  if (!email) return { success: false, error: 'El correo es requerido.' };

  const rawAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  if (!rawAppUrl) return { success: false, error: 'NEXT_PUBLIC_APP_URL no está configurada.' };

  try {
    const appOrigin = new URL(rawAppUrl).origin;
    const callbackUrl = new URL('/auth/callback', appOrigin);
    callbackUrl.searchParams.set('redirect', '/auth/update-password');
    const emailRedirectTo = callbackUrl.toString();

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: emailRedirectTo });
    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Error al enviar el correo.';
    return { success: false, error: msg };
  }
}

// ─── Update password (after invite/recovery link) ────────────────────────────

export async function updatePassword(
  _prev: UpdatePasswordResult | null,
  formData: FormData,
): Promise<UpdatePasswordResult> {
  const password = (formData.get('password') as string | null) ?? '';
  const confirm  = (formData.get('confirm')  as string | null) ?? '';

  if (!password || password.length < 8)
    return { success: false, error: 'La contraseña debe tener al menos 8 caracteres.' };
  if (password !== confirm)
    return { success: false, error: 'Las contraseñas no coinciden.' };

  try {
    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) return { success: false, error: error.message };
    redirect('/cliente');
  } catch (err: unknown) {
    if (err instanceof Error && err.message === 'NEXT_REDIRECT') throw err;
    const msg = err instanceof Error ? err.message : 'Error al actualizar la contraseña.';
    return { success: false, error: msg };
  }
}

// ─── Send magic link (kept as fallback) ──────────────────────────────────────

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
