// Plain-HTML email templates — no Tailwind, no React, inline styles only.
// Compatible with all major email clients (Gmail, Outlook, Apple Mail).
import type { PlanId } from '@/domain/plans/types';

const planLabels: Record<PlanId, string> = {
  basic:    'Basic',
  premium:  'Premium',
  deluxe:   'Deluxe',
};

function formatPrice(centavos: number, currency: string): string {
  return new Intl.NumberFormat('es-MX', {
    style:    'currency',
    currency: currency.toUpperCase(),
    minimumFractionDigits: 0,
  }).format(centavos / 100);
}

export interface OrderConfirmationParams {
  customerName?:   string | null;
  planId:          PlanId;
  amountTotal?:    number | null;
  currency?:       string | null;
  accessUrl:       string;
}

// ─── Password setup email (sent when inviteUrl is available) ─────────────────

export interface PasswordSetupEmailParams {
  customerName?:  string | null;
  planId:         PlanId;
  amountTotal?:   number | null;
  currency?:      string | null;
  inviteUrl:      string;
  loginUrl:       string;
  /** Direct 7-day access-token link — works without a password even if the invite link expires. */
  accessUrl?:     string | null;
}

export function buildPasswordSetupEmail(params: PasswordSetupEmailParams): {
  subject: string;
  html: string;
  text: string;
} {
  const { customerName, planId, amountTotal, currency, inviteUrl, loginUrl, accessUrl } = params;
  const planName  = planLabels[planId] ?? planId;
  const greeting  = customerName ? `Hola ${customerName},` : 'Hola,';
  const priceStr  = amountTotal && currency ? formatPrice(amountTotal, currency) : null;
  const subject   = `Crea tu contraseña y edita tu invitación — KOMPRALO`;

  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F0EB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(26,20,16,0.08);">
          <tr>
            <td style="background:#1A1410;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#F5EDD8;letter-spacing:0.06em;text-transform:uppercase;">KOMPRALO</p>
              <p style="margin:6px 0 0;font-size:12px;color:#C5A880;letter-spacing:0.12em;text-transform:uppercase;">Invitaciones Digitales</p>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 32px;">
              <p style="margin:0 0 8px;font-size:16px;color:#1A1410;">${greeting}</p>
              <p style="margin:0 0 24px;font-size:16px;color:#4B3A2C;line-height:1.6;">
                🎉 Tu pago fue confirmado. Crea una contraseña para acceder a tu editor cuando lo necesites.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#FAFAF8;border:1px solid #E8E2DA;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#9B8878;letter-spacing:0.12em;text-transform:uppercase;">Plan adquirido</p>
                    <p style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1A1410;">${planName}</p>
                    ${priceStr ? `<p style="margin:0 0 4px;font-size:11px;color:#9B8878;letter-spacing:0.12em;text-transform:uppercase;">Total pagado</p><p style="margin:0;font-size:16px;font-weight:600;color:#4B3A2C;">${priceStr}</p>` : ''}
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:14px;color:#1A1410;font-weight:600;">Paso 1 — Crea tu contraseña</p>
              <p style="margin:0 0 24px;font-size:14px;color:#4B3A2C;line-height:1.6;">
                Haz clic en el botón para crear tu contraseña. El enlace es válido por 24 horas.
              </p>
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:24px;">
                <tr>
                  <td align="center" style="background:#C5A880;border-radius:8px;">
                    <a href="${inviteUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#1A1410;text-decoration:none;letter-spacing:0.02em;">
                      Crear contraseña
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:0 0 8px;font-size:13px;color:#9B8878;line-height:1.6;">
                Paso 2 — Después de crear tu contraseña, entra a tu panel en:
                <a href="${loginUrl}" style="color:#C5A880;font-weight:700;">${loginUrl}</a>
              </p>
              ${accessUrl ? `
              <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
                <tr><td style="border-top:1px solid #E8E2DA;padding-top:20px;">
                  <p style="margin:0 0 8px;font-size:13px;color:#4B3A2C;font-weight:600;">
                    ¿Prefieres empezar a editar ahora mismo?
                  </p>
                  <p style="margin:0 0 14px;font-size:13px;color:#9B8878;line-height:1.6;">
                    Este acceso directo funciona sin contraseña y es válido por 7 días.
                  </p>
                  <table cellpadding="0" cellspacing="0" border="0">
                    <tr>
                      <td align="center" style="border:1px solid #C5A880;border-radius:8px;">
                        <a href="${accessUrl}"
                           style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;color:#8A6D3B;text-decoration:none;letter-spacing:0.02em;">
                          Entrar directo a editar (sin contraseña)
                        </a>
                      </td>
                    </tr>
                  </table>
                </td></tr>
              </table>` : ''}
              <p style="margin:16px 0 0;font-size:13px;color:#9B8878;line-height:1.6;">
                ¿Tienes alguna duda? Responde este correo y te ayudamos.
              </p>
            </td>
          </tr>
          <tr>
            <td style="background:#FAFAF8;border-top:1px solid #E8E2DA;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#B0A090;line-height:1.6;">
                Pago procesado de forma segura por Stripe · Pago único, sin suscripción.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  const text = [
    greeting,
    '',
    '🎉 Tu pago fue confirmado. Crea una contraseña para acceder a tu editor.',
    '',
    `Plan adquirido: ${planName}`,
    priceStr ? `Total pagado: ${priceStr}` : '',
    '',
    'Paso 1 — Crea tu contraseña:',
    inviteUrl,
    '',
    `Paso 2 — Accede a tu panel en: ${loginUrl}`,
    '',
    ...(accessUrl
      ? [
          '¿Prefieres empezar a editar ahora mismo?',
          'Este acceso directo funciona sin contraseña y es válido por 7 días:',
          accessUrl,
          '',
        ]
      : []),
    '¿Tienes alguna duda? Responde este correo.',
    '',
    'KOMPRALO — Invitaciones Digitales',
  ].filter((l) => l !== '').join('\n');

  return { subject, html, text };
}

// ─── Multi-cart order confirmation (N invitations, one email) ─────────────────

export interface MultiOrderConfirmationParams {
  customerName?: string | null;
  items: { title: string; planId: PlanId; accessUrl: string }[];
  amountTotal?: number | null;
  currency?: string | null;
  /** Password-setup link (one account for all invitations). */
  inviteUrl?: string | null;
  loginUrl: string;
}

export function buildMultiOrderConfirmationEmail(params: MultiOrderConfirmationParams): {
  subject: string;
  html: string;
  text: string;
} {
  const { customerName, items, amountTotal, currency, inviteUrl, loginUrl } = params;
  const greeting = customerName ? `Hola ${customerName},` : 'Hola,';
  const priceStr = amountTotal && currency ? formatPrice(amountTotal, currency) : null;
  const subject = `Tus ${items.length} invitaciones digitales KOMPRALO están listas`;

  const itemsHtml = items.map((item) => `
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#FAFAF8;border:1px solid #E8E2DA;border-radius:8px;margin-bottom:14px;">
                <tr>
                  <td style="padding:16px 20px;">
                    <p style="margin:0 0 2px;font-size:15px;font-weight:700;color:#1A1410;">${item.title}</p>
                    <p style="margin:0 0 12px;font-size:12px;color:#9B8878;text-transform:uppercase;letter-spacing:0.08em;">Plan ${planLabels[item.planId] ?? item.planId}</p>
                    <table cellpadding="0" cellspacing="0" border="0">
                      <tr>
                        <td align="center" style="background:#C5A880;border-radius:8px;">
                          <a href="${item.accessUrl}"
                             style="display:inline-block;padding:11px 24px;font-size:13px;font-weight:700;color:#1A1410;text-decoration:none;">
                            Personalizar esta invitación
                          </a>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>`).join('');

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0" /><title>${subject}</title></head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F0EB;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(26,20,16,0.08);">
        <tr><td style="background:#1A1410;padding:28px 32px;text-align:center;">
          <p style="margin:0;font-size:22px;font-weight:700;color:#F5EDD8;letter-spacing:0.06em;text-transform:uppercase;">KOMPRALO</p>
          <p style="margin:6px 0 0;font-size:12px;color:#C5A880;letter-spacing:0.12em;text-transform:uppercase;">Invitaciones Digitales</p>
        </td></tr>
        <tr><td style="padding:36px 32px;">
          <p style="margin:0 0 8px;font-size:16px;color:#1A1410;">${greeting}</p>
          <p style="margin:0 0 24px;font-size:16px;color:#4B3A2C;line-height:1.6;">
            🎉 Tu pago fue confirmado${priceStr ? ` por <strong>${priceStr}</strong> MXN` : ''} y tus
            <strong>${items.length} invitaciones</strong> ya están listas. Cada una tiene su propio
            enlace de edición (válido por 7 días, sin contraseña):
          </p>
          ${itemsHtml}
          ${inviteUrl ? `
          <table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
            <tr><td style="border-top:1px solid #E8E2DA;padding-top:20px;">
              <p style="margin:0 0 8px;font-size:14px;color:#1A1410;font-weight:600;">Crea tu contraseña (una sola cuenta para todas)</p>
              <p style="margin:0 0 14px;font-size:13px;color:#9B8878;line-height:1.6;">
                Con tu contraseña podrás entrar a todas tus invitaciones cuando quieras desde
                <a href="${loginUrl}" style="color:#C5A880;font-weight:700;">${loginUrl}</a>
              </p>
              <table cellpadding="0" cellspacing="0" border="0">
                <tr><td align="center" style="border:1px solid #C5A880;border-radius:8px;">
                  <a href="${inviteUrl}"
                     style="display:inline-block;padding:12px 28px;font-size:13px;font-weight:700;color:#8A6D3B;text-decoration:none;">
                    Crear contraseña
                  </a>
                </td></tr>
              </table>
            </td></tr>
          </table>` : ''}
          <p style="margin:20px 0 0;font-size:13px;color:#9B8878;line-height:1.6;">
            ¿Tienes alguna duda? Responde este correo y te ayudamos.
          </p>
        </td></tr>
        <tr><td style="background:#FAFAF8;border-top:1px solid #E8E2DA;padding:20px 32px;text-align:center;">
          <p style="margin:0;font-size:12px;color:#B0A090;line-height:1.6;">
            Pago procesado de forma segura por Stripe · Pago único, sin suscripción.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  const text = [
    greeting,
    '',
    `🎉 Tu pago fue confirmado${priceStr ? ` por ${priceStr} MXN` : ''}. Tus ${items.length} invitaciones están listas.`,
    'Cada una tiene su propio enlace de edición (válido 7 días, sin contraseña):',
    '',
    ...items.flatMap((item) => [
      `${item.title} — Plan ${planLabels[item.planId] ?? item.planId}:`,
      item.accessUrl,
      '',
    ]),
    ...(inviteUrl
      ? ['Crea tu contraseña (una sola cuenta para todas tus invitaciones):', inviteUrl, '', `Después entra desde: ${loginUrl}`, '']
      : []),
    '¿Tienes alguna duda? Responde este correo.',
    '',
    'KOMPRALO — Invitaciones Digitales',
  ].join('\n');

  return { subject, html, text };
}

// ─── Order confirmation (access token fallback) ───────────────────────────────

export function buildOrderConfirmationEmail(params: OrderConfirmationParams): {
  subject: string;
  html: string;
  text: string;
} {
  const {
    customerName,
    planId,
    amountTotal,
    currency,
    accessUrl,
  } = params;

  const planName   = planLabels[planId] ?? planId;
  const greeting   = customerName ? `Hola ${customerName},` : 'Hola,';
  const priceStr   = amountTotal && currency
    ? formatPrice(amountTotal, currency)
    : null;

  const ctaUrl = accessUrl;
  const ctaLabel = 'Acceder a mi invitación';
  const nextStepText = 'Este enlace es seguro y te permitirá entrar a personalizar tu invitación. No necesitas contraseña ni recibir otro correo.';

  const subject = `Tu invitación digital KOMPRALO está lista — Plan ${planName}`;

  // ── HTML body ────────────────────────────────────────────────────────────────
  const html = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#F5F0EB;font-family:Arial,Helvetica,sans-serif;-webkit-font-smoothing:antialiased;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F5F0EB;padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:520px;background:#FFFFFF;border-radius:12px;overflow:hidden;box-shadow:0 2px 12px rgba(26,20,16,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1A1410;padding:28px 32px;text-align:center;">
              <p style="margin:0;font-size:22px;font-weight:700;color:#F5EDD8;letter-spacing:0.06em;text-transform:uppercase;">
                KOMPRALO
              </p>
              <p style="margin:6px 0 0;font-size:12px;color:#C5A880;letter-spacing:0.12em;text-transform:uppercase;">
                Invitaciones Digitales
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:36px 32px;">

              <!-- Greeting -->
              <p style="margin:0 0 8px;font-size:16px;color:#1A1410;">${greeting}</p>
              <p style="margin:0 0 24px;font-size:16px;color:#4B3A2C;line-height:1.6;">
                🎉 Tu pago fue confirmado y tu invitación digital ya está lista.
              </p>

              <!-- Order summary box -->
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                style="background:#FAFAF8;border:1px solid #E8E2DA;border-radius:8px;margin-bottom:28px;">
                <tr>
                  <td style="padding:20px 24px;">
                    <p style="margin:0 0 4px;font-size:11px;color:#9B8878;letter-spacing:0.12em;text-transform:uppercase;">
                      Plan adquirido
                    </p>
                    <p style="margin:0 0 12px;font-size:20px;font-weight:700;color:#1A1410;">
                      ${planName}
                    </p>
                    ${priceStr ? `
                    <p style="margin:0 0 4px;font-size:11px;color:#9B8878;letter-spacing:0.12em;text-transform:uppercase;">
                      Total pagado
                    </p>
                    <p style="margin:0;font-size:16px;font-weight:600;color:#4B3A2C;">
                      ${priceStr}
                    </p>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Next step -->
              <p style="margin:0 0 8px;font-size:14px;color:#1A1410;font-weight:600;">
                Siguiente paso
              </p>
              <p style="margin:0 0 24px;font-size:14px;color:#4B3A2C;line-height:1.6;">
                ${nextStepText}
              </p>

              <!-- CTA button -->
              <table cellpadding="0" cellspacing="0" border="0" style="margin-bottom:32px;">
                <tr>
                  <td align="center" style="background:#C5A880;border-radius:8px;">
                    <a href="${ctaUrl}"
                       style="display:inline-block;padding:14px 32px;font-size:14px;font-weight:700;color:#1A1410;text-decoration:none;letter-spacing:0.02em;">
                      ${ctaLabel}
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Support -->
              <p style="margin:0;font-size:13px;color:#9B8878;line-height:1.6;">
                ¿Tienes alguna duda? Responde este correo y te ayudamos.
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#FAFAF8;border-top:1px solid #E8E2DA;padding:20px 32px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#B0A090;line-height:1.6;">
                Pago procesado de forma segura por Stripe · Pago único, sin suscripción.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  // ── Plain-text fallback ──────────────────────────────────────────────────────
  const text = [
    greeting,
    '',
    '🎉 Tu pago fue confirmado y tu invitación digital ya está lista.',
    '',
    `Plan adquirido: ${planName}`,
    priceStr ? `Total pagado: ${priceStr}` : '',
    '',
    'Siguiente paso:',
    nextStepText,
    ctaLabel,
    ctaUrl,
    '',
    '¿Tienes alguna duda? Responde este correo.',
    '',
    'KOMPRALO — Invitaciones Digitales',
  ].filter((l) => l !== null).join('\n');

  return { subject, html, text };
}
