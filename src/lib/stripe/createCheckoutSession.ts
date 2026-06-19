import type Stripe from 'stripe';
import { stripe } from './stripe';
import { getProductById } from '@/domain/products';

export interface CreateCheckoutSessionInput {
  productId: string;
  /** Optional — links the order to an existing invitation once payment completes. */
  invitationId?: string;
  /** URL to redirect after successful payment (must be absolute). */
  successUrl: string;
  /** URL to redirect if the buyer cancels. */
  cancelUrl: string;
  /** Customer email pre-filled in the Stripe checkout form. */
  customerEmail?: string;
}

export interface CheckoutSessionResult {
  sessionId: string;
  url: string;
}

export async function createCheckoutSession(
  input: CreateCheckoutSessionInput,
): Promise<CheckoutSessionResult> {
  const product = getProductById(input.productId);
  if (!product) {
    throw new Error(`Product not found: ${input.productId}`);
  }

  const metadata: Record<string, string> = {
    productId: product.id,
    planId:    product.planId,
  };

  if (input.invitationId) {
    metadata.invitationId = input.invitationId;
  }

  const params: Stripe.Checkout.SessionCreateParams = {
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency:     product.currency,
          unit_amount:  product.price,
          product_data: {
            name:        product.name,
            description: product.description,
          },
        },
      },
    ],
    metadata,
    success_url: input.successUrl,
    cancel_url:  input.cancelUrl,
    ...(input.customerEmail ? { customer_email: input.customerEmail } : {}),
  };

  const session = await stripe.checkout.sessions.create(params);

  if (!session.url) {
    throw new Error('Stripe did not return a checkout URL.');
  }

  return { sessionId: session.id, url: session.url };
}
