-- =============================================================================
-- Kompralo — Admin Dashboard Migration
-- Run in Supabase SQL Editor AFTER schema.sql and orders.sql.
-- Safe to re-run: uses IF NOT EXISTS and IF EXISTS patterns.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- 1. TABLE: admin_users
-- Stores which auth.users are platform admins.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_users (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email       text NOT NULL,
  role        text NOT NULL DEFAULT 'admin'
              CHECK (role IN ('admin', 'superadmin')),
  created_at  timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT admin_users_user_id_unique UNIQUE (user_id)
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
-- No permissive policies = only service role can read/write admin_users

COMMENT ON TABLE public.admin_users IS
  'Platform admins. user_id references auth.users. Only service role can query this table.';

-- ---------------------------------------------------------------------------
-- 2. TABLE: admin_audit_logs
-- Immutable audit trail of admin actions.
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_user_id  uuid,
  admin_email    text,
  action         text NOT NULL,
  entity_type    text NOT NULL,
  entity_id      text,
  before         jsonb,
  after          jsonb,
  metadata       jsonb,
  created_at     timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS admin_audit_logs_admin_user_id_idx ON public.admin_audit_logs(admin_user_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_action_idx        ON public.admin_audit_logs(action);
CREATE INDEX IF NOT EXISTS admin_audit_logs_entity_id_idx     ON public.admin_audit_logs(entity_id);
CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx    ON public.admin_audit_logs(created_at DESC);

ALTER TABLE public.admin_audit_logs ENABLE ROW LEVEL SECURITY;
-- No permissive policies = only service role can read/write

COMMENT ON TABLE public.admin_audit_logs IS
  'Immutable audit trail of all admin actions. Written exclusively by service role.';

-- ---------------------------------------------------------------------------
-- 3. Extend invitation statuses: add paused + cancelled
-- The existing constraint name is invitations_status_check (Postgres default).
-- ---------------------------------------------------------------------------
ALTER TABLE public.invitations
  DROP CONSTRAINT IF EXISTS invitations_status_check;

ALTER TABLE public.invitations
  ADD CONSTRAINT invitations_status_check CHECK (
    status IN (
      'draft',
      'preview',
      'pending_payment',
      'paid',
      'published',
      'archived',
      'deleted',
      'paused',
      'cancelled'
    )
  );

-- ---------------------------------------------------------------------------
-- 4. Soft-delete columns on invitations
-- ---------------------------------------------------------------------------
ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS deleted_at  timestamptz;

ALTER TABLE public.invitations
  ADD COLUMN IF NOT EXISTS deleted_by  uuid REFERENCES auth.users(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS invitations_deleted_at_idx ON public.invitations(deleted_at)
  WHERE deleted_at IS NOT NULL;

-- ---------------------------------------------------------------------------
-- 5. Admin RLS policies for invitations
-- Lets admin users (in admin_users table) read/write ALL invitations
-- via the anon/authenticated client without bypassing RLS entirely.
-- This means the existing editor server actions work for admins.
-- ---------------------------------------------------------------------------

-- SELECT: admin can read all invitations (including draft/paused/cancelled)
CREATE POLICY IF NOT EXISTS "invitations_admin_select" ON public.invitations
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- UPDATE: admin can update any invitation
CREATE POLICY IF NOT EXISTS "invitations_admin_update" ON public.invitations
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- INSERT: admin can insert any invitation
CREATE POLICY IF NOT EXISTS "invitations_admin_insert" ON public.invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- DELETE: admin can delete any invitation
CREATE POLICY IF NOT EXISTS "invitations_admin_delete" ON public.invitations
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 6. Admin RLS policies for invitation_content
-- ---------------------------------------------------------------------------
CREATE POLICY IF NOT EXISTS "invitation_content_admin_select" ON public.invitation_content
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "invitation_content_admin_update" ON public.invitation_content
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY IF NOT EXISTS "invitation_content_admin_insert" ON public.invitation_content
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- 7. Admin RLS policies for orders (read-only — writes stay service-role)
-- ---------------------------------------------------------------------------
CREATE POLICY IF NOT EXISTS "orders_admin_select" ON public.orders
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.admin_users
      WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- HOW TO CREATE FIRST ADMIN
-- Run this with your Supabase user UUID and email:
--
--   INSERT INTO public.admin_users (user_id, email, role)
--   VALUES ('<your-auth-user-uuid>', '<your@email.com>', 'superadmin');
--
-- Get your UUID from: Supabase Dashboard → Authentication → Users
-- Or: SELECT id, email FROM auth.users WHERE email = 'your@email.com';
-- ---------------------------------------------------------------------------
