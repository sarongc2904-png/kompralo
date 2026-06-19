import type Stripe from 'stripe';
import { stripe } from './stripe';

function requireWebhookSecret(): string {
  const value = process.env.STRIPE_WEBHOOK_SECRET;
  if (!value) {
    throw new Error(
      'Missing environment variable: STRIPE_WEBHOOK_SECRET.\n' +
        'Add it to .env.local. Obtain it from the Stripe Dashboard → Webhooks.',
    );
  }
  return value;
}

/**
 * Verifies the Stripe-Signature header and constructs the event.
 *
 * @param body   Raw request body as a Buffer or string (must NOT be parsed).
 * @param header Value of the `Stripe-Signature` HTTP header.
 * @throws {Error} when the signature is invalid or the secret is missing.
 */
export function verifyWebhookSignature(
  body: Buffer | string,
  header: string | null,
): Stripe.Event {
  if (!header) {
    throw new Error('Missing Stripe-Signature header.');
  }

  const secret = requireWebhookSecret();

  return stripe.webhooks.constructEvent(body, header, secret);
}
