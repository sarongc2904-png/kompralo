'use server';

import { createServiceRoleSupabaseClient } from '@/lib/supabase/server';
import { createInvitationAccessToken } from '@/lib/access/createInvitationAccessToken';
import { createRateLimiter } from '@/lib/rate-limit/in-memory';
import { getResendClient, getFromEmail } from '@/lib/resend/resend';

const recoverAccessRateLimit = createRateLimiter({ limit: 3, windowMs: 60 * 60 * 1000 });

export interface RecoverAccessResult {
  success: boolean;
  error?: string;
}

// Identical response whether or not the email has purchases (anti-enumeration).
const GENERIC_OK: RecoverAccessResult = { success: true };

interface AccessLink {
  title: string;
  url: string;
}

function buildRecoveryEmail(links: AccessLink[], loginUrl: string): {
  subject: string;
  html: string;
  text: string;
} {
  const subject = 'Recupera el acceso a tu invitación — KOMPRALO';

  const linksHtml = links.map((l) => `
          <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:14px;">
            <tr><td align="center" style="background:#C5A880;border-radius:8px;">
              <a href="${l.url}" style="display:inline-block;padding:13px 28px;font-size:14px;font-weight:700;color:#1A1410;text-decoration:none;">
                Editar: ${l.title}
              </a>
            </td></tr>
          </table>`).join('');

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
            Aquí ${links.length === 1 ? 'está tu enlace de acceso' : 'están tus enlaces de acceso'} para
            seguir editando. ${links.length === 1 ? 'Es válido' : 'Son válidos'} por 7 días y no
            ${links.length === 1 ? 'necesita' : 'necesitan'} contraseña.
          </p>
          ${linksHtml}
          <p style="margin:20px 0 0;font-size:13px;color:#9B8878;line-height:1.6;">
            ¿Ya creaste una contraseña? También puedes entrar directo desde
            <a href="${loginUrl}" style="color:#C5A880;font-weight:700;">${loginUrl}</a>
          </p>
          <p style="margin:16px 0 0;font-size:13px;color:#9B8878;line-height:1.6;">
            Si no solicitaste este correo, puedes ignorarlo.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    links.length === 1
      ? 'Aquí está tu enlace de acceso (válido 7 días, sin contraseña):'
      : 'Aquí están tus enlaces de acceso (válidos 7 días, sin contraseña):',
    '',
    ...links.map((l) => `${l.title}: ${l.url}`),
    '',
    `¿Ya tienes contraseña? Inicia sesión en: ${loginUrl}`,
    'Si no solicitaste este correo, ignóralo.',
    '',
    'KOMPRALO — Invitaciones Digitales',
  ].join('\n');

  return { subject, html, text };
}

/**
 * Self-service access recovery: looks up paid orders by customer email,
 * mints a fresh 7-day access token per invitation and emails the links.
 * The backend pattern mirrors /api/access/from-session (already in prod);
 * the response never reveals whether the email has purchases.
 */
export async function recoverAccess(rawEmail: string): Promise<RecoverAccessResult> {
  const email = typeof rawEmail === 'string' ? rawEmail.trim().toLowerCase() : '';
  if (!email || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: 'Ingresa un correo válido.' };
  }

  const rl = recoverAccessRateLimit(email);
  if (!rl.allowed) {
    return {
      success: false,
      error: 'Has solicitado demasiados enlaces. Intenta de nuevo en una hora.',
    };
  }

  const appUrlValue = process.env.NEXT_PUBLIC_APP_URL?.trim();
  if (!appUrlValue) {
    console.error('[recoverAccess] NEXT_PUBLIC_APP_URL not configured');
    return GENERIC_OK;
  }

  try {
    const svc = createServiceRoleSupabaseClient();

    // Paid orders for this email that are linked to an invitation.
    const { data: orders, error: ordersErr } = await svc
      .from('orders')
      .select('id, invitation_id, created_at')
      .eq('status', 'paid')
      .ilike('customer_email', email)
      .not('invitation_id', 'is', null)
      .order('created_at', { ascending: false });

    if (ordersErr || !orders || orders.length === 0) {
      console.log('[recoverAccess] no paid orders for %s', email);
      return GENERIC_OK;
    }

    // Latest order per invitation (an invitation can have several orders).
    const latestByInvitation = new Map<string, string>(); // invitationId → orderId
    for (const o of orders) {
      if (o.invitation_id && !latestByInvitation.has(o.invitation_id)) {
        latestByInvitation.set(o.invitation_id, o.id);
      }
    }

    const links: AccessLink[] = [];
    for (const [invitationId, orderId] of latestByInvitation) {
      // Skip deleted invitations — their access must stay revoked.
      const { data: inv } = await svc
        .from('invitations')
        .select('id, title, status')
        .eq('id', invitationId)
        .maybeSingle();
      if (!inv || inv.status === 'deleted') continue;

      const { rawToken } = await createInvitationAccessToken({
        invitationId,
        orderId,
        customerEmail: email,
      });
      const accessUrl = new URL('/access/consume', appUrlValue);
      accessUrl.searchParams.set('token', rawToken);
      links.push({ title: inv.title || 'Mi invitación', url: accessUrl.toString() });
    }

    if (links.length === 0) {
      console.log('[recoverAccess] no recoverable invitations for %s', email);
      return GENERIC_OK;
    }

    const loginUrl = new URL('/login', appUrlValue).toString();
    const { subject, html, text } = buildRecoveryEmail(links, loginUrl);

    const { error: sendErr } = await getResendClient().emails.send({
      from: getFromEmail(),
      to: [email],
      subject,
      html,
      text,
    });

    if (sendErr) {
      console.error('[recoverAccess] Resend failed for %s: %s', email, sendErr.message);
    } else {
      console.log('[recoverAccess] %d access link(s) sent to %s', links.length, email);
    }
  } catch (e) {
    console.error('[recoverAccess] unexpected error:', e);
  }

  return GENERIC_OK;
}
