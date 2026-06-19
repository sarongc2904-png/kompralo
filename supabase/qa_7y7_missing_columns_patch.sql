-- =============================================================================
-- QA FASE 7Y-7 — Verificación y columnas faltantes
--
-- Aplica DESPUÉS de: schema.sql, orders.sql, orders_7y4_email_patch.sql,
--                    invitations_7y6_auto_create_patch.sql
--
-- Este script es idempotente (usa IF NOT EXISTS / IF EXIST).
-- Corre en Supabase SQL Editor para confirmar el estado del schema.
-- =============================================================================

-- ─── orders ──────────────────────────────────────────────────────────────────
-- Columnas requeridas por FASE 7Y (verificar que existen después de orders.sql
-- y orders_7y4_email_patch.sql).

-- invitation_id: columna FK a invitations (en orders.sql)
-- Si por alguna razón no existe, crear:
alter table public.orders
  add column if not exists invitation_id uuid references public.invitations(id) on delete set null;

-- customer_name: nombre del comprador capturado por Stripe (en orders.sql)
alter table public.orders
  add column if not exists customer_name text;

-- confirmation_email_sent_at: tracking de envío Resend (en orders_7y4_email_patch.sql)
alter table public.orders
  add column if not exists confirmation_email_sent_at timestamptz;

-- confirmation_email_error: último error de Resend (en orders_7y4_email_patch.sql)
alter table public.orders
  add column if not exists confirmation_email_error text;

-- ─── invitations ─────────────────────────────────────────────────────────────
-- Columnas requeridas por FASE 7Y-6 (en invitations_7y6_auto_create_patch.sql).

-- user_id nullable: permite invitaciones auto-creadas sin sesión de usuario
alter table public.invitations
  alter column user_id drop not null;

-- customer_email: email del comprador en invitaciones auto-creadas
alter table public.invitations
  add column if not exists customer_email text;

-- ─── Índices adicionales ─────────────────────────────────────────────────────

-- Búsqueda rápida de órdenes por customer_email (para /cliente?email=...)
create index if not exists orders_customer_email_idx
  on public.orders(customer_email)
  where customer_email is not null;

-- Búsqueda de invitaciones por customer_email
create index if not exists invitations_customer_email_idx
  on public.invitations(customer_email)
  where customer_email is not null;

-- ─── Verificación final ───────────────────────────────────────────────────────
-- Ejecuta esto para confirmar que todas las columnas clave existen:

select
  table_name,
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name in ('orders', 'invitations', 'invitation_content')
  and column_name in (
    'invitation_id', 'stripe_session_id', 'customer_email', 'customer_name',
    'plan_id', 'status', 'amount_total', 'currency',
    'confirmation_email_sent_at', 'confirmation_email_error',
    'user_id', 'created_at', 'updated_at'
  )
order by table_name, column_name;
