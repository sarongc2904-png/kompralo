/**
 * Supabase implementation of IOrderRepository.
 *
 * Requires the following table in your Supabase project:
 *
 *   create table public.orders (
 *     id                       uuid primary key default gen_random_uuid(),
 *     stripe_session_id        text not null unique,
 *     stripe_payment_intent_id text,
 *     product_id               text not null,
 *     plan_id                  text not null,
 *     amount_total             integer not null,
 *     currency                 text not null default 'mxn',
 *     status                   text not null default 'pending',
 *     invitation_id            uuid references invitations(id) on delete set null,
 *     customer_email           text,
 *     created_at               timestamptz not null default now(),
 *     updated_at               timestamptz not null default now()
 *   );
 *
 *   -- RLS: only service role can read/write orders
 *   alter table public.orders enable row level security;
 *
 *   create policy "service_role_all" on public.orders
 *     for all using (auth.role() = 'service_role');
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { IOrderRepository } from './repository.types';
import type { Order, CreateOrderInput, OrderStatus } from './types';
import type { Database } from '@/lib/supabase/types';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type OrderRow = Record<string, any>;

function mapRow(row: OrderRow): Order {
  return {
    id:                      row.id,
    stripeSessionId:         row.stripe_session_id,
    stripePaymentIntentId:   row.stripe_payment_intent_id ?? null,
    productId:               row.product_id,
    planId:                  row.plan_id,
    amountTotal:             row.amount_total,
    currency:                row.currency,
    status:                  row.status,
    invitationId:            row.invitation_id ?? null,
    customerEmail:           row.customer_email ?? null,
    customerName:            row.customer_name  ?? null,
    confirmationEmailSentAt: row.confirmation_email_sent_at ?? null,
    confirmationEmailError:  row.confirmation_email_error  ?? null,
    createdAt:               row.created_at,
    updatedAt:               row.updated_at,
  };
}

export class SupabaseOrderRepository implements IOrderRepository {
  constructor(private readonly supabase: SupabaseClient<Database>) {}

  async create(input: CreateOrderInput): Promise<Order> {
    const { data, error } = await this.supabase
      .from('orders')
      .insert({
        stripe_session_id:        input.stripeSessionId,
        stripe_payment_intent_id: input.stripePaymentIntentId ?? null,
        product_id:               input.productId,
        plan_id:                  input.planId,
        amount_total:             input.amountTotal,
        currency:                 input.currency,
        status:                   input.status,
        invitation_id:            input.invitationId ?? null,
        customer_email:           input.customerEmail ?? null,
        customer_name:            input.customerName  ?? null,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(`[Supabase] orders.create failed: ${error?.message ?? 'no data'}`);
    }
    return mapRow(data);
  }

  async getBySessionId(stripeSessionId: string): Promise<Order | null> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('stripe_session_id', stripeSessionId)
      .single();

    if (error || !data) return null;
    return mapRow(data);
  }

  async updateStatus(
    stripeSessionId: string,
    status: OrderStatus,
    paymentIntentId?: string,
  ): Promise<void> {
    const patch: Record<string, unknown> = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (paymentIntentId) {
      patch.stripe_payment_intent_id = paymentIntentId;
    }

    const { error } = await this.supabase
      .from('orders')
      .update(patch)
      .eq('stripe_session_id', stripeSessionId);

    if (error) {
      throw new Error(`[Supabase] orders.updateStatus failed: ${error.message}`);
    }
  }

  async listByInvitationId(invitationId: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('invitation_id', invitationId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapRow);
  }

  async markConfirmationEmailSent(stripeSessionId: string): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .update({
        confirmation_email_sent_at: new Date().toISOString(),
        confirmation_email_error:   null,
        updated_at:                 new Date().toISOString(),
      })
      .eq('stripe_session_id', stripeSessionId);

    if (error) {
      throw new Error(`[Supabase] orders.markConfirmationEmailSent failed: ${error.message}`);
    }
  }

  async attachInvitationToOrder(params: { stripeSessionId: string; invitationId: string }): Promise<void> {
    const { stripeSessionId, invitationId } = params;

    const existing = await this.getBySessionId(stripeSessionId);
    if (!existing) {
      throw new Error(`[Supabase] attachInvitationToOrder: order not found for session ${stripeSessionId}`);
    }

    if (existing.invitationId !== null && existing.invitationId !== invitationId) {
      console.warn(
        '[Supabase] attachInvitationToOrder: order %s already has invitationId=%s — refusing to overwrite with %s',
        stripeSessionId, existing.invitationId, invitationId,
      );
      return;
    }

    if (existing.invitationId === invitationId) {
      // Already set — idempotent no-op.
      return;
    }

    const { error } = await this.supabase
      .from('orders')
      .update({ invitation_id: invitationId, updated_at: new Date().toISOString() })
      .eq('stripe_session_id', stripeSessionId);

    if (error) {
      throw new Error(`[Supabase] attachInvitationToOrder failed: ${error.message}`);
    }
  }

  async findByCustomerEmail(email: string): Promise<Order[]> {
    const { data, error } = await this.supabase
      .from('orders')
      .select('*')
      .eq('customer_email', email)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map(mapRow);
  }

  async markConfirmationEmailFailed(stripeSessionId: string, errorMsg: string): Promise<void> {
    const { error } = await this.supabase
      .from('orders')
      .update({
        confirmation_email_error: errorMsg.slice(0, 500), // cap at 500 chars
        updated_at:               new Date().toISOString(),
      })
      .eq('stripe_session_id', stripeSessionId);

    if (error) {
      throw new Error(`[Supabase] orders.markConfirmationEmailFailed failed: ${error.message}`);
    }
  }
}
