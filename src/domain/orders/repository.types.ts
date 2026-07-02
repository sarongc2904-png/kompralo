import type { Order, CreateOrderInput, OrderStatus } from './types';

export interface IOrderRepository {
  create(input: CreateOrderInput): Promise<Order>;
  getBySessionId(stripeSessionId: string): Promise<Order | null>;
  /** All orders for a Stripe session, ordered by cart_item_index (multi-cart = N rows). */
  listBySessionId(stripeSessionId: string): Promise<Order[]>;
  /** Links an invitation to a specific order row (multi-cart safe; no-op if already set). */
  attachInvitationToOrderById(orderId: string, invitationId: string): Promise<void>;
  updateStatus(stripeSessionId: string, status: OrderStatus, paymentIntentId?: string): Promise<void>;
  listByInvitationId(invitationId: string): Promise<Order[]>;
  markConfirmationEmailSent(stripeSessionId: string): Promise<void>;
  markConfirmationEmailFailed(stripeSessionId: string, error: string): Promise<void>;
  findByCustomerEmail(email: string): Promise<Order[]>;
  findByOwnerUserId(userId: string): Promise<Order[]>;
  /**
   * Links an auto-created invitation to an order.
   * Only sets invitation_id if it is currently null; logs a warning if it already
   * holds a different value (does not overwrite to prevent data loss).
   */
  attachInvitationToOrder(params: { stripeSessionId: string; invitationId: string }): Promise<void>;
}
