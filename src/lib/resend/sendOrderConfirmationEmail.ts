import { getResendClient, getFromEmail } from './resend';
import { buildOrderConfirmationEmail, buildPasswordSetupEmail, buildMultiOrderConfirmationEmail } from './emailTemplates';
import type { MultiOrderConfirmationParams } from './emailTemplates';
import type { PlanId } from '@/domain/plans/types';

export interface SendOrderConfirmationEmailParams {
  to:              string;
  customerName?:   string | null;
  planId:          PlanId;
  planName?:       string | null;
  amountTotal?:    number | null;
  currency?:       string | null;
  /** Access-token URL (fallback when inviteUrl is not available). */
  accessUrl:       string;
  /** Supabase invite/recovery link for password setup. When present, sends password-setup email. */
  inviteUrl?:      string | null;
  /** App login URL, included in the password-setup email. */
  loginUrl?:       string | null;
}

export async function sendOrderConfirmationEmail(
  params: SendOrderConfirmationEmailParams,
): Promise<void> {
  const resend = getResendClient();
  const from   = getFromEmail();

  let subject: string;
  let html: string;
  let text: string;

  if (params.inviteUrl) {
    ({ subject, html, text } = buildPasswordSetupEmail({
      customerName: params.customerName,
      planId:       params.planId,
      amountTotal:  params.amountTotal,
      currency:     params.currency,
      inviteUrl:    params.inviteUrl,
      loginUrl:     params.loginUrl ?? params.accessUrl,
      // Always include the 7-day token link: the invite link is single-use and
      // short-lived, so without this the token dies orphaned in the DB.
      accessUrl:    params.accessUrl,
    }));
  } else {
    ({ subject, html, text } = buildOrderConfirmationEmail({
      customerName: params.customerName,
      planId:       params.planId,
      amountTotal:  params.amountTotal,
      currency:     params.currency,
      accessUrl:    params.accessUrl,
    }));
  }

  const { error } = await resend.emails.send({ from, to: [params.to], subject, html, text });

  if (error) {
    throw new Error(`Resend delivery failed: ${error.message}`);
  }
}

// ─── Multi-cart confirmation ──────────────────────────────────────────────────

export type SendMultiOrderConfirmationEmailParams = MultiOrderConfirmationParams & { to: string };

export async function sendMultiOrderConfirmationEmail(
  params: SendMultiOrderConfirmationEmailParams,
): Promise<void> {
  const resend = getResendClient();
  const from   = getFromEmail();
  const { to, ...templateParams } = params;
  const { subject, html, text } = buildMultiOrderConfirmationEmail(templateParams);

  const { error } = await resend.emails.send({ from, to: [to], subject, html, text });
  if (error) {
    throw new Error(`Resend delivery failed: ${error.message}`);
  }
}
