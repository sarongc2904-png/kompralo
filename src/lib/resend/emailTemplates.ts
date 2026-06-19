// Plain-HTML email templates — no Tailwind, no React, inline styles only.
// Compatible with all major email clients (Gmail, Outlook, Apple Mail).

const planLabels: Record<string, string> = {
  basic:    'Basic',
  gold:     'Premium',
  platinum: 'Deluxe',
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
  planId:          string;
  amountTotal?:    number | null;
  currency?:       string | null;
  accessUrl:       string;
}

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
