-- MIGRATION: Update Premium invitations theme to 'ivory-editorial'
--
-- IMPORTANT: This ONLY changes theme_id, NOT plan_id
-- plan_id remains 'premium' (Supabase constraint requires this)
--
-- SAFETY:
-- - Only updates Premium invitations (plan_id = 'premium')
-- - Only updates invitations with a different theme (IS DISTINCT FROM)
-- - Respects soft deletes (deleted IS NULL)
-- - Does NOT touch basic or deluxe
-- - Does NOT delete or modify invitation_content

BEGIN;

-- Show how many will be affected
SELECT
  COUNT(*) as will_be_updated,
  STRING_AGG(DISTINCT theme_id, ', ') as current_themes
FROM public.invitations
WHERE plan_id = 'premium'
  AND deleted IS NULL
  AND theme_id IS DISTINCT FROM 'ivory-editorial';

-- Execute the migration
UPDATE public.invitations
SET
  theme_id = 'ivory-editorial',
  updated_at = now()
WHERE
  plan_id = 'premium'
  AND deleted IS NULL
  AND theme_id IS DISTINCT FROM 'ivory-editorial';

-- Verify the update
SELECT
  COUNT(*) as now_with_ivory,
  COUNT(CASE WHEN theme_id != 'ivory-editorial' THEN 1 END) as still_wrong
FROM public.invitations
WHERE plan_id = 'premium'
  AND deleted IS NULL;

-- COMMIT to apply
-- ROLLBACK to undo
COMMIT;
