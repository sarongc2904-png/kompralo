-- =============================================================================
-- Kompralo — Orders: email tracking columns (FASE 7Y-4)
-- Run AFTER orders.sql in the Supabase SQL Editor.
-- Safe to run multiple times — uses IF NOT EXISTS / DO NOTHING patterns.
-- =============================================================================

-- confirmation_email_sent_at: set to now() after Resend confirms delivery.
-- null means the email has not been sent yet (or was not applicable).
alter table public.orders
  add column if not exists confirmation_email_sent_at timestamptz;

-- confirmation_email_error: stores a short error message if Resend failed.
-- null means no error recorded.
alter table public.orders
  add column if not exists confirmation_email_error text;

-- Index: quickly find orders where email has not been sent (for retries / audits).
create index if not exists orders_email_not_sent_idx
  on public.orders(created_at)
  where confirmation_email_sent_at is null
    and status = 'paid';

comment on column public.orders.confirmation_email_sent_at is
  'Timestamp when the post-payment confirmation email was successfully sent via Resend. null = not yet sent.';

comment on column public.orders.confirmation_email_error is
  'Last error message if Resend delivery failed. Cleared on successful retry.';
