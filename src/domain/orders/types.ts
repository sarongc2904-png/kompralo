import type { ProductId } from '@/domain/products/types';
import type { PlanId } from '@/domain/plans/types';

export type OrderStatus =
  | 'pending'    // checkout session created, payment not yet confirmed
  | 'paid'       // webhook checkout.session.completed received
  | 'failed'     // payment failed or expired
  | 'refunded';  // payment_intent.refunded

export interface Order {
  id: string;
  stripeSessionId: string;
  stripePaymentIntentId: string | null;
  productId: ProductId;
  planId: PlanId;
  /** Amount charged in the smallest currency unit (centavos). */
  amountTotal: number;
  currency: string;
  status: OrderStatus;
  /** Invitation linked at checkout time (may be null if none was selected). */
  invitationId: string | null;
  customerEmail: string | null;
  customerName: string | null;
  /** Auth user who initiated the purchase (null for guest checkouts). */
  ownerUserId: string | null;
  /** Set after Resend confirms delivery. null = not yet sent. */
  confirmationEmailSentAt: string | null;
  /** Last Resend error message if delivery failed. null = no error. */
  confirmationEmailError: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderInput {
  stripeSessionId:       string;
  stripePaymentIntentId: string | null;
  productId:             ProductId;
  planId:                PlanId;
  amountTotal:           number;
  currency:              string;
  status:                OrderStatus;
  invitationId?:         string | null;
  customerEmail?:        string | null;
  customerName?:         string | null;
  /** Auth user who initiated the purchase. Set from Stripe metadata.owner_user_id. */
  ownerUserId?:          string | null;
}
