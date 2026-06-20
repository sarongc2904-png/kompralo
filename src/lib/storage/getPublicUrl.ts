'use client';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

const BUCKET = 'invitation-assets';

/**
 * Returns the Supabase Storage public URL for a given path inside the
 * `invitations` bucket. Works synchronously (no network request needed).
 *
 * The bucket must be configured as "Public" in the Supabase dashboard, or
 * the URL will return 403 on fetch.
 */
export function getPublicUrl(path: string): string {
  const supabase = createBrowserSupabaseClient();
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return data.publicUrl;
}
