-- MIGRATION SCRIPT: Update Premium invitations to use 'gold' plan and 'ivory-editorial' theme
--
-- SAFETY CHECKS:
-- - Only updates invitations where plan_id = 'premium'
-- - Only updates paid/published invitations
-- - Respects soft deletes (deleted IS NULL)
-- - Does NOT touch basic or deluxe
-- - Does NOT delete or modify invitation_content
-- - Updates updated_at to track migration

-- Run this in a transaction so you can ROLLBACK if needed:
BEGIN;

-- Show how many will be affected
SELECT
  COUNT(*) as affected_count,
  STRING_AGG(DISTINCT theme_id, ', ') as current_themes
FROM public.invitations
WHERE plan_id = 'premium'
  AND status IN ('paid', 'published')
  AND deleted IS NULL;

-- Execute the migration
UPDATE public.invitations
SET
  plan_id = 'gold',
  theme_id = 'ivory-editorial',
  updated_at = now()
WHERE
  plan_id = 'premium'
  AND status IN ('paid', 'published')
  AND deleted IS NULL;

-- Verify the update
SELECT
  COUNT(*) as migrated_count,
  COUNT(CASE WHEN plan_id = 'gold' THEN 1 END) as now_gold,
  COUNT(CASE WHEN theme_id = 'ivory-editorial' THEN 1 END) as now_ivory
FROM public.invitations
WHERE plan_id = 'gold'
  AND status IN ('paid', 'published')
  AND deleted IS NULL;

-- COMMIT to apply changes
-- ROLLBACK to undo
COMMIT;
