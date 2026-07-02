-- Multi-cart support: one order row per cart item, sharing stripe_session_id.
-- cart_item_index=0 for all existing rows and for single-item purchases,
-- so current behaviour is unchanged. The composite unique keeps webhook
-- idempotency: a duplicate insert for the same (session, index) fails clean.
-- Applied to production via Supabase MCP as `orders_multi_cart_item_index`.

alter table public.orders
  add column if not exists cart_item_index int not null default 0;

alter table public.orders
  drop constraint if exists orders_stripe_session_id_key;

alter table public.orders
  add constraint orders_session_item_key unique (stripe_session_id, cart_item_index);
