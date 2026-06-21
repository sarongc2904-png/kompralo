-- VERIFICATION: Premium invitations AFTER theme migration
-- Confirms that all Premium paid/published have ivory-editorial theme

-- 1. Verify all Premium now have ivory-editorial theme
SELECT
  COUNT(*) as total_premium,
  COUNT(CASE WHEN theme_id = 'ivory-editorial' THEN 1 END) as with_ivory,
  COUNT(CASE WHEN theme_id != 'ivory-editorial' THEN 1 END) as with_other
FROM public.invitations
WHERE plan_id = 'premium'
  AND status IN ('paid', 'published')
  AND deleted IS NULL;

-- 2. Show any Premium with non-ivory theme (should be 0)
SELECT
  id,
  slug,
  plan_id,
  theme_id,
  status
FROM public.invitations
WHERE plan_id = 'premium'
  AND status IN ('paid', 'published')
  AND deleted IS NULL
  AND theme_id != 'ivory-editorial';

-- 3. Verify plan_id is still 'premium' (not changed to 'gold')
SELECT
  COUNT(DISTINCT plan_id) as distinct_plan_ids,
  STRING_AGG(DISTINCT plan_id, ', ') as plan_ids
FROM public.invitations
WHERE plan_id = 'premium'
  AND status IN ('paid', 'published')
  AND deleted IS NULL;

-- 4. Verify invitation_content still exists
SELECT
  COUNT(DISTINCT i.id) as premium_count,
  COUNT(ic.id) as with_content,
  COUNT(CASE WHEN ic.id IS NULL THEN 1 END) as missing_content
FROM public.invitations i
LEFT JOIN public.invitation_content ic ON i.id = ic.invitation_id
WHERE i.plan_id = 'premium'
  AND i.status IN ('paid', 'published')
  AND i.deleted IS NULL;

-- 5. Verify basic and deluxe unaffected
SELECT
  plan_id,
  COUNT(*) as count
FROM public.invitations
WHERE deleted IS NULL
  AND status IN ('paid', 'published')
GROUP BY plan_id
ORDER BY plan_id;
