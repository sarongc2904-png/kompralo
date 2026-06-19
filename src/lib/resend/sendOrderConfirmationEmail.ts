import { getResendClient, getFromEmail } from './resend';
import { buildOrderConfirmationEmail } from './emailTemplates';

export interface SendOrderConfirmationEmailParams {
  to:              string;
  customerName?:   string | null;
  planId:          string;
  planName?:       string | null;
  amountTotal?:    number | null;
  currency?:       string | null;
  invitationId?:   string | null;
  stripeSessionId: string;
}

/**
 * Sends the post-payment confirmation email via Resend.
 * Throws on delivery failure — callers are responsible for catching.
 */
export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationEmailParams,
): Promise<void> {
  const resend = getResendClient();
  const from   = getFromEmail();

  const { subject, html, text } = buildOrderConfirmationEmail({
    customerName:    params.customerName,
    customerEmail:   params.to,
    planId:          params.planId,
    amountTotal:     params.amountTotal,
    currency:        params.currency,
    invitationId:    params.invitationId,
    stripeSessionId: params.stripeSessionId,
  });

  const { error } = await resend.emails.send({
    from,
    to:      [params.to],
    subject,
    html,
    text,
  });

  if (error) {
    throw new Error(`Resend delivery failed: ${error.message}`);
  }
}
