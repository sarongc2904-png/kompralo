-- One-email post-payment access tokens.
-- Apply this patch after the existing orders/invitations migrations.

create table if not exists public.invitation_access_tokens (
  id uuid primary key default gen_random_uuid(),
  invitation_id uuid not null references public.invitations(id) on delete cascade,
  order_id uuid references public.orders(id) on delete cascade,
  customer_email text not null,
  token_hash text not null unique,
  purpose text not null default 'post_payment_access'
    check (purpose = 'post_payment_access'),
  expires_at timestamptz not null,
  used_at timestamptz,
  last_used_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists invitation_access_tokens_invitation_id_idx
  on public.invitation_access_tokens(invitation_id);

create index if not exists invitation_access_tokens_order_id_idx
  on public.invitation_access_tokens(order_id);

create index if not exists invitation_access_tokens_expires_at_idx
  on public.invitation_access_tokens(expires_at);

alter table public.invitation_access_tokens enable row level security;

-- Browser clients must never read or mutate access tokens. The webhook and
-- consume route use the server-only service role, which bypasses RLS.
revoke all on table public.invitation_access_tokens from anon, authenticated;
grant all on table public.invitation_access_tokens to service_role;

