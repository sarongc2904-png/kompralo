-- VERIFICATION: Premium invitations BEFORE theme migration
-- Check which Premium invitations still have legacy theme

SELECT
  COUNT(*) as total_premium,
  COUNT(CASE WHEN theme_id = 'ivory-editorial' THEN 1 END) as already_ivory,
  COUNT(CASE WHEN theme_id != 'ivory-editorial' THEN 1 END) as need_update
FROM public.invitations
WHERE plan_id = 'premium'
  AND status IN ('paid', 'published')
  AND deleted IS NULL;

-- Sample of Premium with legacy theme
SELECT
  id,
  slug,
  plan_id,
  theme_id,
  status,
  created_at
FROM public.invitations
WHERE plan_id = 'premium'
  AND status IN ('paid', 'published')
  AND deleted IS NULL
  AND theme_id != 'ivory-editorial'
LIMIT 10;

-- Verify invitation_content exists
SELECT
  COUNT(*) as premium_with_content
FROM public.invitations i
INNER JOIN public.invitation_content ic ON i.id = ic.invitation_id
WHERE i.plan_id = 'premium'
  AND i.status IN ('paid', 'published')
  AND i.deleted IS NULL;
