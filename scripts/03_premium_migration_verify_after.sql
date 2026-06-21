-- VERIFICATION SCRIPT: Premium invitations AFTER migration
-- Confirms that migration was successful and no data was lost

-- 1. Verify all migrated invitations now have plan_id='gold' and theme_id='ivory-editorial'
SELECT
  COUNT(*) as total_gold,
  COUNT(CASE WHEN theme_id = 'ivory-editorial' THEN 1 END) as with_ivory_theme,
  COUNT(CASE WHEN theme_id != 'ivory-editorial' THEN 1 END) as with_other_theme
FROM public.invitations
WHERE plan_id = 'gold'
  AND status IN ('paid', 'published')
  AND deleted IS NULL;

-- 2. Verify NO invitations still have plan_id='premium'
SELECT
  COUNT(*) as remaining_premium
FROM public.invitations
WHERE plan_id = 'premium'
  AND deleted IS NULL;

-- 3. Confirm invitation_content still exists
SELECT
  COUNT(DISTINCT i.id) as gold_invitations,
  COUNT(ic.id) as with_content,
  COUNT(CASE WHEN ic.id IS NULL THEN 1 END) as missing_content
FROM public.invitations i
LEFT JOIN public.invitation_content ic ON i.id = ic.invitation_id
WHERE i.plan_id = 'gold'
  AND i.status IN ('paid', 'published')
  AND i.deleted IS NULL;

-- 4. Sample of migrated invitations
SELECT
  i.id,
  i.slug,
  i.plan_id,
  i.theme_id,
  i.status,
  i.updated_at,
  CASE WHEN ic.id IS NOT NULL THEN 'HAS' ELSE 'MISSING' END as content
FROM public.invitations i
LEFT JOIN public.invitation_content ic ON i.id = ic.invitation_id
WHERE i.plan_id = 'gold'
  AND i.status IN ('paid', 'published')
  AND i.deleted IS NULL
LIMIT 10;

-- 5. Verify basic and deluxe were NOT affected
SELECT
  plan_id,
  COUNT(*) as count
FROM public.invitations
WHERE deleted IS NULL
  AND status IN ('paid', 'published')
GROUP BY plan_id
ORDER BY plan_id;
