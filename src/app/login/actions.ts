'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export interface SendMagicLinkResult {
  success: boolean;
  error?: string;
}

export interface SignInResult {
  success: boolean;
  error?: string;
  redirectTo?: string;
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
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error al iniciar sesión.';
    return { success: false, error: msg };
  }

  // Return redirectTo instead of calling redirect() so that the browser receives
  // the Set-Cookie headers from signInWithPassword before navigating.
  // The PasswordForm component will do window.location.assign() for a full page reload.
  return { success: true, redirectTo: safeRedirect };
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
    const emailRedirectTo = new URL('/auth/set-password', appOrigin).toString();

    const supabase = await createServerSupabaseClient();
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: emailRedirectTo });
    if (error) {
      const raw = error.message.toLowerCase();
      const isRateLimit =
        raw.includes('rate limit') ||
        raw.includes('too many requests') ||
        raw.includes('over_email_send_rate_limit');
      const friendly = isRateLimit
        ? 'RATE_LIMIT'
        : error.message;
      return { success: false, error: friendly };
    }
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'NO_SESSION' };

    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      console.error('[updatePassword] updateUser failed:', error.message);
      return { success: false, error: 'No pudimos actualizar tu contraseña. Solicita un nuevo enlace.' };
    }
    console.log('[updatePassword] password updated for user=%s', user.id);
    return { success: true };
  } catch (err: unknown) {
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
