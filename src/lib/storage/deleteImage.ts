'use client';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

const BUCKET = 'invitations';

/**
 * Extracts the bucket-relative path from a Supabase public URL.
 *
 * Example input:
 *   https://xxx.supabase.co/storage/v1/object/public/invitations/gallery/abc.jpg
 * Example output:
 *   gallery/abc.jpg
 *
 * Returns null for empty strings or non-Supabase URLs.
 */
function extractPath(pathOrUrl: string): string | null {
  if (!pathOrUrl) return null;
  if (!pathOrUrl.startsWith('http')) return pathOrUrl;
  const marker = `/object/public/${BUCKET}/`;
  const idx = pathOrUrl.indexOf(marker);
  if (idx === -1) return null;
  return pathOrUrl.slice(idx + marker.length);
}

/**
 * Deletes an asset from the `invitations` Supabase Storage bucket.
 * Accepts either the raw storage path or the full public URL.
 * Silently returns if the path is empty or unresolvable.
 *
 * @throws {Error} on Supabase deletion failure.
 */
export async function deleteInvitationAsset(pathOrUrl: string): Promise<void> {
  const path = extractPath(pathOrUrl);
  if (!path) return;

  const supabase = createBrowserSupabaseClient();
  const { error } = await supabase.storage.from(BUCKET).remove([path]);

  if (error) {
    throw new Error(`Error al eliminar imagen: ${error.message}`);
  }
}
