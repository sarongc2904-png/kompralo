-- FASE 7Y-6: Allow auto-creation of invitations from paid orders (no user session).
--
-- 1. Make user_id nullable so service-role webhook can insert without auth context.
-- 2. Add customer_email column to track the buyer's email at creation time.
-- 3. Add index for customer_email lookups.
--
-- Apply in Supabase SQL Editor BEFORE deploying FASE 7Y-6 webhook changes.

alter table public.invitations
  alter column user_id drop not null;

alter table public.invitations
  add column if not exists customer_email text;

create index if not exists invitations_customer_email_idx
  on public.invitations(customer_email)
  where customer_email is not null;
