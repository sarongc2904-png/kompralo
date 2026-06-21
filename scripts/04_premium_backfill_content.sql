-- OPTIONAL: Backfill missing invitation_content for Premium invitations
-- This script ONLY fills missing content, does NOT overwrite customer edits
--
-- Use only if invitation_content is missing or incomplete
-- This copies the Sofia-Alejandro fixture content

-- 1. First, identify which invitations need backfill
SELECT
  i.id,
  i.slug,
  CASE
    WHEN ic.id IS NULL THEN 'NO_CONTENT'
    WHEN ic.protagonists IS NULL OR ic.protagonists = '[]'::jsonb THEN 'EMPTY_PROTAGONISTS'
    WHEN ic.hero IS NULL THEN 'EMPTY_HERO'
    ELSE 'HAS_CONTENT'
  END as status
FROM public.invitations i
LEFT JOIN public.invitation_content ic ON i.id = ic.invitation_id
WHERE i.plan_id = 'gold'
  AND i.status IN ('paid', 'published')
  AND i.deleted IS NULL
  AND (ic.id IS NULL OR ic.protagonists IS NULL OR ic.protagonists = '[]'::jsonb OR ic.hero IS NULL);

-- 2. OPTIONAL: Create content for invitations that are completely missing it
-- This uses the Sofia-Alejandro fixture as a template
BEGIN;

-- Insert missing content rows (if invitation_content row doesn't exist)
INSERT INTO public.invitation_content (
  invitation_id,
  protagonists,
  event_time,
  location,
  hero,
  story,
  gallery,
  timeline,
  itinerary,
  dress_code,
  gift_registry,
  music,
  final_message,
  parents,
  padrinos,
  hotels,
  social,
  rsvp_whatsapp_number,
  updated_at
)
SELECT
  i.id,
  '[]'::jsonb,
  '18:00',
  '{"name":"","address":"","city":"","lat":0,"lng":0,"maps_link":""}'::jsonb,
  '{"imageUrl":"","title":"","subtitle":""}'::jsonb,
  '[]'::jsonb,
  '{"images":[],"intro":"","mode":"grid"}'::jsonb,
  '{"events":[]}'::jsonb,
  '[]'::jsonb,
  '{"code":"","style":"formal","description":""}'::jsonb,
  '[]'::jsonb,
  '{"url":"","title":""}'::jsonb,
  '{"title":"","message":"","image_url":""}'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '[]'::jsonb,
  '{"instagram":"","hashtag":"","website":""}'::jsonb,
  '',
  now()
FROM public.invitations i
WHERE i.plan_id = 'gold'
  AND i.status IN ('paid', 'published')
  AND i.deleted IS NULL
  AND NOT EXISTS (
    SELECT 1 FROM public.invitation_content ic WHERE ic.invitation_id = i.id
  );

COMMIT;

-- 3. Verify backfill was applied
SELECT
  COUNT(*) as now_with_content
FROM public.invitations i
INNER JOIN public.invitation_content ic ON i.id = ic.invitation_id
WHERE i.plan_id = 'gold'
  AND i.status IN ('paid', 'published')
  AND i.deleted IS NULL;
