'use server';

import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createRateLimiter } from '@/lib/rate-limit/in-memory';
import { getResendClient, getFromEmail } from '@/lib/resend/resend';

const resendLinkRateLimit = createRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });

export interface ResendPasswordLinkResult {
  success: boolean;
  error?: string;
}

const GENERIC_OK: ResendPasswordLinkResult = { success: true };

function buildEmail(confirmUrl: string): { subject: string; html: string; text: string } {
  const subject = 'Tu nuevo enlace de acceso — KOMPRALO';
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F0EB;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#FFFFFF;border-radius:12px;overflow:hidden;">
        <tr><td style="background:#1A1410;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#F5EDD8;letter-spacing:0.06em;text-transform:uppercase;">KOMPRALO</p>
        </td></tr>
        <tr><td style="padding:36px 32px;">
          <p style="margin:0 0 24px;font-size:16px;color:#4B3A2C;line-height:1.6;">
            Aquí está tu nuevo enlace para crear (o restablecer) tu contraseña y entrar a tu panel.
            Es válido por 24 horas y solo puede usarse una vez.
          </p>
          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
            <tr><td align="center" style="background:#C5A880;border-radius:8px;">
              <a href="${confirmUrl}" style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#1A1410;text-decoration:none;">
                Crear mi contraseña
              </a>
            </td></tr>
          </table>
          <p style="margin:0;font-size:13px;color:#9B8878;line-height:1.6;">
            Si no solicitaste este enlace, puedes ignorar este correo.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
  const text = [
    'Aquí está tu nuevo enlace para crear (o restablecer) tu contraseña:',
    confirmUrl,
    '',
    'Es válido por 24 horas y solo puede usarse una vez.',
    'Si no solicitaste este enlace, ignora este correo.',
    '',
    'KOMPRALO — Invitaciones Digitales',
  ].join('\n');
  return { subject, html, text };
}

/**
 * Re-sends a password-setup link to an existing Auth user whose previous
 * invite/recovery link expired. Anti-enumeration: the response is identical
 * whether or not the email exists. Rate limited to 3 requests/hour per email.
 */
export async function resendPasswordLink(rawEmail: string): Promise<ResendPasswordLinkResult> {
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    // Invalid format is safe to surface — it reveals nothing about accounts.
    return { success: false, error: 'Ingresa un correo válido.' };
  }

  const rl = resendLinkRateLimit(email);
  if (!rl.allowed) {
    return {
      success: false,
      error: 'Has solicitado demasiados enlaces. Intenta de nuevo en una hora.',
    };
  }

  const appUrlValue = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrlValue) {
    console.error('[resendPasswordLink] NEXT_PUBLIC_APP_URL not configured');
    return GENERIC_OK; // never leak config state
  }

  try {
    const svc = createServiceRoleSupabaseClient();

    // 'recovery' works for any existing user (confirmed or not, unlike
    // 'invite' which fails once the user exists). If the email has no
    // account, generateLink errors — swallow it (anti-enumeration).
    const { data: linkData, error: linkError } = await svc.auth.admin.generateLink({
      type: 'recovery',
      email,
    });

    const hashedToken = linkData?.properties?.hashed_token ?? null;
    if (linkError || !hashedToken) {
      console.log('[resendPasswordLink] no link generated for %s: %s', email, linkError?.message ?? 'no token');
      return GENERIC_OK;
    }

    const confirmUrl = new URL('/auth/confirm', appUrlValue);
    confirmUrl.searchParams.set('token_hash', hashedToken);
    confirmUrl.searchParams.set('type', 'recovery');
    confirmUrl.searchParams.set('next', '/auth/set-password');
    confirmUrl.searchParams.set('email', email);

    const { subject, html, text } = buildEmail(confirmUrl.toString());
    const { error: sendErr } = await getResendClient().emails.send({
      from: getFromEmail(),
      to: [email],
      subject,
      html,
      text,
    });

    if (sendErr) {
      console.error('[resendPasswordLink] Resend failed for %s: %s', email, sendErr.message);
    } else {
      console.log('[resendPasswordLink] link re-sent to %s', email);
    }
  } catch (e) {
    console.error('[resendPasswordLink] unexpected error:', e);
  }

  return GENERIC_OK;
}
