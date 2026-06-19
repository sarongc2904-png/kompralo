-- FASE 7B — Auth Cliente / Magic Link
-- Verifica que invitations.customer_email existe (creado en FASE 7Y-6).
-- Si no existe, lo añade. Este script es idempotente.

-- 1. Asegura que customer_email existe en invitations
alter table public.invitations
  add column if not exists customer_email text;

-- 2. Índice para búsquedas por customer_email (idempotente)
create index if not exists invitations_customer_email_idx
  on public.invitations(customer_email)
  where customer_email is not null;

-- 3. Verificación
select
  column_name,
  data_type,
  is_nullable
from information_schema.columns
where table_schema = 'public'
  and table_name   = 'invitations'
  and column_name  = 'customer_email';
-- Debe devolver exactamente 1 fila.
