-- =============================================================================
-- Kompralo — Orders Table
-- Run AFTER schema.sql in the Supabase SQL Editor.
-- Stores every Stripe Checkout Session and its resulting payment state.
-- The set_updated_at() function must already exist (created in schema.sql).
-- =============================================================================

-- -----------------------------------------------------------------------------
-- TABLE: orders
-- One row per Stripe Checkout Session initiated from the pricing page.
-- Status lifecycle: pending → paid | failed | refunded
-- -----------------------------------------------------------------------------
create table if not exists public.orders (
  -- Primary key
  id                       uuid primary key default gen_random_uuid(),

  -- Stripe identifiers
  -- stripe_session_id is unique: re-delivery of the same webhook is idempotent.
  stripe_session_id        text not null unique,
  stripe_payment_intent_id text,                          -- null until payment succeeds

  -- Product purchased
  product_id               text not null,                 -- 'basic' | 'premium' | 'deluxe'
  plan_id                  text not null                  -- 'basic' | 'gold' | 'platinum'
                           check (plan_id in ('basic', 'gold', 'platinum')),

  -- Optional FK to the invitation being purchased for.
  -- SET NULL on delete so orders are preserved even if the invitation is removed.
  invitation_id            uuid references public.invitations(id) on delete set null,

  -- Customer info captured by Stripe at checkout time.
  customer_email           text,
  customer_name            text,

  -- Amount stored in the smallest currency unit (centavos for MXN).
  amount_total             integer not null,
  currency                 text not null default 'mxn',

  -- Payment status.
  status                   text not null default 'pending'
                           check (status in ('pending', 'paid', 'failed', 'refunded')),

  -- Arbitrary key-value metadata forwarded from the Stripe session.
  -- Useful for storing UTM params, promo codes, or future custom fields.
  metadata                 jsonb not null default '{}',

  -- Timestamps
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- Indexes
-- -----------------------------------------------------------------------------

-- Webhook handler looks up by session id on every delivery.
create index if not exists orders_stripe_session_id_idx
  on public.orders(stripe_session_id);

-- Dashboard queries paid orders for a given invitation.
create index if not exists orders_invitation_id_idx
  on public.orders(invitation_id)
  where invitation_id is not null;

-- Admin filtering by status.
create index if not exists orders_status_idx
  on public.orders(status);

-- Admin filtering by product / plan.
create index if not exists orders_product_id_idx
  on public.orders(product_id);

-- Chronological listing.
create index if not exists orders_created_at_idx
  on public.orders(created_at desc);

-- -----------------------------------------------------------------------------
-- Trigger: auto-update updated_at
-- -----------------------------------------------------------------------------
create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Row Level Security
-- -----------------------------------------------------------------------------
alter table public.orders enable row level security;

-- Authenticated users can read their own orders (matched via invitation FK).
-- The invitation owner check: orders.invitation_id → invitations.user_id = auth.uid().
create policy "orders_select_owner" on public.orders
  for select using (
    invitation_id in (
      select id from public.invitations where user_id = auth.uid()
    )
  );

-- All writes (insert / update) are performed exclusively by the webhook handler
-- using the service role key — no permissive policy means anon/authenticated
-- users cannot insert or update orders directly.

-- -----------------------------------------------------------------------------
-- Comments
-- -----------------------------------------------------------------------------
comment on table public.orders is
  'Stripe Checkout Sessions and resulting payment state. Written by the webhook handler using service role. Status lifecycle: pending → paid | failed | refunded.';

comment on column public.orders.stripe_session_id        is 'Stripe cs_... session id. Unique constraint ensures webhook idempotency.';
comment on column public.orders.stripe_payment_intent_id is 'Stripe pi_... id. Populated once checkout.session.completed fires.';
comment on column public.orders.product_id               is 'Internal product id: basic | premium | deluxe.';
comment on column public.orders.plan_id                  is 'Invitation plan unlocked by this purchase: basic | gold | platinum.';
comment on column public.orders.invitation_id            is 'Optional FK — the invitation this purchase is associated with.';
comment on column public.orders.amount_total             is 'Charged amount in smallest currency unit (centavos for MXN).';
comment on column public.orders.status                   is 'pending | paid | failed | refunded. Updated by the Stripe webhook.';
comment on column public.orders.metadata                 is 'Passthrough JSON — UTM params, promo codes, etc.';
