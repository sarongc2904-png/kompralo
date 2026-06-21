-- VERIFICATION SCRIPT: Premium invitations BEFORE migration
-- This script shows the current state of Premium invitations in production

-- 1. Count Premium invitations with legacy theme
SELECT
  COUNT(*) as total,
  plan_id,
  theme_id,
  status
FROM public.invitations
WHERE plan_id = 'premium'
  AND deleted IS NULL
GROUP BY plan_id, theme_id, status
ORDER BY total DESC;

-- 2. Breakdown by status
SELECT
  status,
  COUNT(*) as count,
  COUNT(CASE WHEN theme_id IN ('champagne', 'luxury-gold') THEN 1 END) as legacy_theme_count
FROM public.invitations
WHERE plan_id = 'premium'
  AND deleted IS NULL
GROUP BY status;

-- 3. Sample of Premium invitations (first 10)
SELECT
  id,
  slug,
  plan_id,
  theme_id,
  status,
  created_at,
  updated_at
FROM public.invitations
WHERE plan_id = 'premium'
  AND deleted IS NULL
LIMIT 10;

-- 4. Check if invitation_content exists for Premium invitations
SELECT
  i.id,
  i.slug,
  i.plan_id,
  i.theme_id,
  CASE
    WHEN ic.id IS NOT NULL THEN 'HAS_CONTENT'
    ELSE 'MISSING_CONTENT'
  END as content_status,
  ic.id as content_id
FROM public.invitations i
LEFT JOIN public.invitation_content ic ON i.id = ic.invitation_id
WHERE i.plan_id = 'premium'
  AND i.deleted IS NULL
  AND i.status IN ('paid', 'published')
LIMIT 20;

-- 5. Invitations with empty hero or protagonists
SELECT
  i.id,
  i.slug,
  ic.protagonists,
  ic.hero,
  i.theme_id
FROM public.invitations i
LEFT JOIN public.invitation_content ic ON i.id = ic.invitation_id
WHERE i.plan_id = 'premium'
  AND i.deleted IS NULL
  AND i.status IN ('paid', 'published')
  AND (ic.protagonists IS NULL OR ic.protagonists = '[]'::jsonb OR ic.hero IS NULL)
LIMIT 10;
