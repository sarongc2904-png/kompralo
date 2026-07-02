/**
 * Multi-cart post-payment processing.
 *
 * A multi-event checkout (cart_type='multi') pays for N invitations in one
 * Stripe session. This module creates one order + one invitation + one
 * access token PER cart item, keeping the 1:1 order↔invitation model intact.
 *
 * Idempotency: orders carry (stripe_session_id, cart_item_index) with a
 * composite UNIQUE constraint. On webhook redelivery (or recovery after a
 * partial failure) only the missing indexes are created.
 *
 * Dependency-injected so it can be exercised against the real database from
 * test scripts without the Next.js server context.
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { PlanId } from '@/domain/plans/types';
import { parsePlanId } from '@/domain/plans/types';
import { productsById } from '@/domain/products/catalog';
import type { IOrderRepository } from '@/domain/orders/repository.types';
import type { IInvitationRepository } from '@/domain/invitations/repository.types';
import { createInvitationAccessTokenWithClient } from '@/lib/access/token-core';

// ─── Event type → invitation category ────────────────────────────────────────
// KNOWN LIMITATION (approved 2026-07-01): invitations.category has a CHECK
// constraint allowing only wedding | baptism | baby-shower | birthday.
// XV años, graduación and aniversario have no category of their own, so they
// fall back to 'wedding' — the same category legacy createFromPaidOrder
// hardcoded for everything. The invitation title preserves the real event
// type so nothing is lost for the customer.
const EVENT_TYPE_MAP: Record<string, { category: 'wedding' | 'baptism' | 'baby-shower' | 'birthday'; label: string }> = {
  boda:        { category: 'wedding',     label: 'Boda' },
  bautizo:     { category: 'baptism',     label: 'Bautizo' },
  baby:        { category: 'baby-shower', label: 'Baby Shower' },
  cumple:      { category: 'birthday',    label: 'Cumpleaños' },
  xv:          { category: 'wedding',     label: 'XV Años' },
  graduacion:  { category: 'wedding',     label: 'Graduación' },
  aniversario: { category: 'wedding',     label: 'Aniversario' },
};

const FALLBACK_EVENT = { category: 'wedding' as const, label: 'Mi evento' };

// ─── Types ────────────────────────────────────────────────────────────────────

export interface MultiCartItem {
  index: number;
  eventType: string;
  plan: PlanId;
  category: 'wedding' | 'baptism' | 'baby-shower' | 'birthday';
  eventLabel: string;
  /** Canonical server-side price in centavos. */
  price: number;
}

export interface MultiCartSessionLike {
  id: string;
  amount_total: number | null;
  currency: string | null;
  metadata: Record<string, string> | null | undefined;
  customer_details?: { email?: string | null; name?: string | null } | null;
  customer_email?: string | null;
}

export interface MultiCartEmailArgs {
  to: string;
  customerName: string | null;
  items: { title: string; planId: PlanId; accessUrl: string }[];
  amountTotal: number | null;
  currency: string | null;
}

export interface MultiCartDeps {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  supabase: SupabaseClient<any>;
  orderRepo: IOrderRepository;
  invitationRepo: IInvitationRepository;
  /** Base app URL for building /access/consume links. */
  appUrl: string | null;
  /** When absent, the email step is skipped (logged) — used by tests. */
  sendEmail?: (args: MultiCartEmailArgs) => Promise<void>;
}

export interface MultiCartResult {
  ok: boolean;
  reason?: string;
  items: { index: number; orderId: string | null; invitationId: string | null }[];
  createdOrders: number;
  createdInvitations: number;
  emailSent: boolean;
}

// ─── Parsing ──────────────────────────────────────────────────────────────────

/** Parses 'eventType:plan|eventType:plan' into validated cart items. */
export function parseCartItemsV2(raw: string | undefined | null): MultiCartItem[] | null {
  if (!raw || typeof raw !== 'string') return null;
  const parts = raw.split('|').map((p) => p.trim()).filter(Boolean);
  if (parts.length === 0 || parts.length > 20) return null;

  const items: MultiCartItem[] = [];
  for (let i = 0; i < parts.length; i++) {
    const [eventType, planRaw] = parts[i].split(':');
    const plan = parsePlanId(planRaw);
    if (!eventType || !plan) return null;
    const product = productsById[plan];
    if (!product) return null;
    const mapped = EVENT_TYPE_MAP[eventType] ?? FALLBACK_EVENT;
    items.push({
      index: i,
      eventType,
      plan,
      category: mapped.category,
      eventLabel: EVENT_TYPE_MAP[eventType]?.label ?? FALLBACK_EVENT.label,
      price: product.price,
    });
  }
  return items;
}

// ─── Handler ──────────────────────────────────────────────────────────────────

export async function handleMultiCartSession(
  session: MultiCartSessionLike,
  deps: MultiCartDeps,
): Promise<MultiCartResult> {
  const fail = (reason: string): MultiCartResult => {
    console.error('[multi-cart] ABORT session=%s reason=%s', session.id, reason);
    return { ok: false, reason, items: [], createdOrders: 0, createdInvitations: 0, emailSent: false };
  };

  // ── 1. Parse and validate the cart ─────────────────────────────────────────
  const items = parseCartItemsV2(session.metadata?.cart_items_v2);
  if (!items) return fail('unparseable_cart_items_v2');

  const declaredCount = Number(session.metadata?.item_count);
  if (Number.isFinite(declaredCount) && declaredCount !== items.length) {
    return fail(`item_count_mismatch declared=${declaredCount} parsed=${items.length}`);
  }

  // ── 2. Price integrity: sum of canonical plan prices MUST equal the amount
  //       Stripe actually charged. On mismatch, create NOTHING — a visible
  //       stuck order beats silently corrupted data.
  const expectedTotal = items.reduce((sum, it) => sum + it.price, 0);
  if (session.amount_total !== expectedTotal) {
    return fail(`amount_mismatch stripe=${session.amount_total} expected=${expectedTotal}`);
  }

  const customerEmail = session.customer_details?.email ?? session.customer_email ?? null;
  const customerName  = session.customer_details?.name ?? null;
  const ownerUserId   = session.metadata?.ownerUserId ?? null;
  const ownerEmail    = session.metadata?.ownerEmail ?? customerEmail;

  if (!customerEmail) return fail('missing_customer_email');

  // ── 3. Idempotency: load whatever a previous delivery already created ──────
  const existingOrders = await deps.orderRepo.listBySessionId(session.id);
  const ordersByIndex = new Map(existingOrders.map((o) => [o.cartItemIndex, o]));

  const resultItems: MultiCartResult['items'] = [];
  let createdOrders = 0;
  let createdInvitations = 0;

  // ── 4. Per item: ensure order, then ensure invitation ──────────────────────
  for (const item of items) {
    let order = ordersByIndex.get(item.index) ?? null;

    if (!order) {
      try {
        order = await deps.orderRepo.create({
          stripeSessionId:       session.id,
          stripePaymentIntentId: null,
          productId:             item.plan,
          planId:                item.plan,
          amountTotal:           item.price,
          currency:              session.currency ?? 'mxn',
          status:                'paid',
          customerEmail,
          customerName,
          ownerUserId,
          cartItemIndex:         item.index,
        });
        createdOrders++;
      } catch (err) {
        // Unique-violation race with a concurrent delivery: re-read and reuse.
        const refreshed = await deps.orderRepo.listBySessionId(session.id);
        order = refreshed.find((o) => o.cartItemIndex === item.index) ?? null;
        if (!order) {
          console.error('[multi-cart] order create failed session=%s index=%d:', session.id, item.index, err);
          resultItems.push({ index: item.index, orderId: null, invitationId: null });
          continue;
        }
      }
    }

    let invitationId = order.invitationId;
    if (!invitationId) {
      try {
        const { invitationId: newId } = await deps.invitationRepo.createFromPaidOrder({
          planId:          item.plan,
          customerEmail,
          customerName,
          stripeSessionId: session.id,
          ownerUserId,
          category:        item.category,
          title:           `Mi invitación — ${item.eventLabel}`,
        });
        await deps.orderRepo.attachInvitationToOrderById(order.id, newId);
        invitationId = newId;
        createdInvitations++;
      } catch (err) {
        console.error('[multi-cart] invitation create failed session=%s index=%d:', session.id, item.index, err);
      }
    }

    resultItems.push({ index: item.index, orderId: order.id, invitationId });
  }

  console.log(
    '[multi-cart] session=%s items=%d ordersCreated=%d invitationsCreated=%d',
    session.id, items.length, createdOrders, createdInvitations,
  );

  // ── 5. Confirmation email (once per session, guarded like the single flow) ─
  let emailSent = false;
  const emailRecipient = ownerEmail ?? customerEmail;
  const complete = resultItems.every((r) => r.orderId && r.invitationId);

  if (!complete) {
    console.warn('[multi-cart] session=%s incomplete — email deferred to next delivery', session.id);
  } else if (!deps.sendEmail) {
    console.log('[multi-cart] session=%s email step skipped (no sender configured)', session.id);
  } else if (!deps.appUrl) {
    console.error('[multi-cart] session=%s email skipped — appUrl missing', session.id);
  } else {
    const fresh = await deps.orderRepo.listBySessionId(session.id);
    const first = fresh.find((o) => o.cartItemIndex === 0);
    if (first?.confirmationEmailSentAt) {
      console.log('[multi-cart] session=%s email already sent at %s — skipping', session.id, first.confirmationEmailSentAt);
    } else {
      try {
        const emailItems: MultiCartEmailArgs['items'] = [];
        for (const item of items) {
          const r = resultItems.find((x) => x.index === item.index)!;
          const { rawToken } = await createInvitationAccessTokenWithClient(deps.supabase, {
            invitationId:  r.invitationId!,
            orderId:       r.orderId!,
            customerEmail: emailRecipient,
          });
          const accessUrl = new URL('/access/consume', deps.appUrl);
          accessUrl.searchParams.set('token', rawToken);
          emailItems.push({
            title:     `Mi invitación — ${item.eventLabel}`,
            planId:    item.plan,
            accessUrl: accessUrl.toString(),
          });
        }

        await deps.sendEmail({
          to:           emailRecipient,
          customerName,
          items:        emailItems,
          amountTotal:  session.amount_total,
          currency:     session.currency,
        });
        await deps.orderRepo.markConfirmationEmailSent(session.id);
        emailSent = true;
        console.log('[multi-cart] session=%s confirmation email sent to %s (%d items)', session.id, emailRecipient, emailItems.length);
      } catch (emailErr) {
        const msg = emailErr instanceof Error ? emailErr.message : String(emailErr);
        console.error('[multi-cart] session=%s email failed: %s', session.id, msg);
        try {
          await deps.orderRepo.markConfirmationEmailFailed(session.id, msg);
        } catch { /* logged upstream */ }
      }
    }
  }

  return { ok: true, items: resultItems, createdOrders, createdInvitations, emailSent };
}
