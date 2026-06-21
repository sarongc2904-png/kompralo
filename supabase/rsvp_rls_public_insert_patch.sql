-- RSVP RLS patch: ensure anon users can INSERT rsvp_responses.
-- Safe to run multiple times (DROP IF EXISTS + CREATE).

ALTER TABLE public.rsvp_responses ENABLE ROW LEVEL SECURITY;

-- INSERT: allow any anonymous or authenticated user (guests have no login).
DROP POLICY IF EXISTS "rsvp_insert_public" ON public.rsvp_responses;
CREATE POLICY "rsvp_insert_public"
  ON public.rsvp_responses
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    invitation_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = rsvp_responses.invitation_id
    )
  );

-- SELECT: only invitation owner can read their RSVPs.
DROP POLICY IF EXISTS "rsvp_select_owner" ON public.rsvp_responses;
CREATE POLICY "rsvp_select_owner"
  ON public.rsvp_responses
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = invitation_id
        AND i.user_id = auth.uid()
    )
  );

-- UPDATE / DELETE: only invitation owner.
DROP POLICY IF EXISTS "rsvp_update_owner" ON public.rsvp_responses;
CREATE POLICY "rsvp_update_owner"
  ON public.rsvp_responses
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = invitation_id
        AND i.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "rsvp_delete_owner" ON public.rsvp_responses;
CREATE POLICY "rsvp_delete_owner"
  ON public.rsvp_responses
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.invitations i
      WHERE i.id = invitation_id
        AND i.user_id = auth.uid()
    )
  );
