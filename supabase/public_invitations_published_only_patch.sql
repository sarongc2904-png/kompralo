-- =============================================================================
-- Kompralo - Public invitation visibility: published only
-- Run in Supabase SQL Editor after schema.sql.
--
-- Purpose:
-- - Public/anon users can read only invitations with status = 'published'.
-- - Paid but unpublished invitations remain private.
-- - Authenticated owners can still read their own invitations.
-- - Service role continues to bypass RLS for webhook/dashboard server flows.
-- =============================================================================

drop policy if exists "invitations_select_public" on public.invitations;

create policy "invitations_select_public" on public.invitations
  for select using (
    status = 'published'
    or user_id = auth.uid()
  );

drop policy if exists "invitation_content_select_public" on public.invitation_content;

create policy "invitation_content_select_public" on public.invitation_content
  for select using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and (i.status = 'published' or i.user_id = auth.uid())
    )
  );
