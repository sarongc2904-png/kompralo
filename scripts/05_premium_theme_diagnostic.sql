-- DIAGNOSTIC: Check current Premium invitations and their themes
-- Run this to understand what needs to be migrated

-- 1. Count Premium by theme
SELECT
  plan_id,
  theme_id,
  COUNT(*) as count,
  status
FROM public.invitations
WHERE deleted IS NULL
GROUP BY plan_id, theme_id, status
ORDER BY plan_id, count DESC;

-- 2. Premium specifically with breakdown
SELECT
  theme_id,
  COUNT(*) as count,
  COUNT(CASE WHEN status='paid' THEN 1 END) as paid,
  COUNT(CASE WHEN status='published' THEN 1 END) as published,
  COUNT(CASE WHEN status='draft' THEN 1 END) as draft
FROM public.invitations
WHERE plan_id = 'premium'
  AND deleted IS NULL
GROUP BY theme_id;

-- 3. Premium with non-ivory theme (these need migration)
SELECT
  id,
  slug,
  theme_id,
  status,
  created_at,
  updated_at
FROM public.invitations
WHERE plan_id = 'premium'
  AND deleted IS NULL
  AND theme_id IS DISTINCT FROM 'ivory-editorial'
LIMIT 20;

-- 4. Check if any Premium have invitation_content
SELECT
  COUNT(DISTINCT i.id) as premium_total,
  COUNT(ic.id) as with_content,
  COUNT(CASE WHEN ic.id IS NULL THEN 1 END) as missing_content
FROM public.invitations i
LEFT JOIN public.invitation_content ic ON i.id = ic.invitation_id
WHERE i.plan_id = 'premium'
  AND i.deleted IS NULL;
