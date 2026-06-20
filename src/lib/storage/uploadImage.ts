'use client';

import { createBrowserSupabaseClient } from '@/lib/supabase/client';

// ─── Types ────────────────────────────────────────────────────────────────────

/**
 * Bucket sub-folders that map to invitation content sections.
 *
 * Bucket layout inside `invitations`:
 *   hero/            ← hero image / video thumbnail
 *   gallery/         ← horizontal gallery photos
 *   storybook/       ← story-book slide images
 *   protagonists/    ← protagonist portrait photos
 *   hotels/          ← accommodation hotel images
 *   final-message/   ← closing-section image
 */
export type StorageFolder =
  | 'hero'
  | 'gallery'
  | 'storybook'
  | 'timeline'
  | 'protagonists'
  | 'hotels'
  | 'final-message';

export interface UploadResult {
  /** Supabase Storage public URL — ready to use in invitation content */
  url: string;
  /** Internal storage path (bucket-relative) — store if you need to delete later */
  path: string;
}

// ─── Config ───────────────────────────────────────────────────────────────────

const BUCKET = 'invitation-assets';
const MAX_SIZE_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fileExtension(file: File): string {
  const parts = file.name.split('.');
  return parts.length > 1 ? parts.pop()!.toLowerCase() : 'jpg';
}

function generatePath(folder: StorageFolder, invitationId: string, ext: string): string {
  const uid = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  return `${folder}/${invitationId}/${uid}.${ext}`;
}

// ─── Main upload ──────────────────────────────────────────────────────────────

/**
 * Uploads a File to the `invitations` Supabase Storage bucket and returns its
 * public URL. Validates type and size before sending.
 *
 * Path format: `{folder}/{invitationId}/{timestamp}-{random}.{ext}`
 *
 * @throws {Error} with a user-readable Spanish message on validation or upload failure.
 */
export async function uploadInvitationAsset(
  file: File,
  folder: StorageFolder,
  invitationId: string,
): Promise<UploadResult> {
  if (!ALLOWED_TYPES.has(file.type)) {
    throw new Error(
      `Tipo de archivo no permitido. Usa: jpg, png, webp o gif.`,
    );
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error(`El archivo supera el límite de 10 MB.`);
  }

  const ext  = fileExtension(file);
  const path = generatePath(folder, invitationId, ext);

  const supabase = createBrowserSupabaseClient();

  console.log('[upload] supabaseUrl:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('[upload] bucket:', BUCKET);
  console.log('[upload] folder:', folder);
  console.log('[upload] filePath:', path);

  // Diagnóstico: listar buckets para confirmar proyecto conectado
  const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
  console.log('[upload] buckets:', buckets?.map((b) => b.name));
  if (bucketsError) console.log('[upload] bucketsError:', bucketsError.message);

  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { cacheControl: '31536000', upsert: false });

  if (error) {
    const msg = error.message.includes('Bucket not found')
      ? `No encontramos el bucket ${BUCKET} en el proyecto Supabase conectado. Revisa que NEXT_PUBLIC_SUPABASE_URL apunte al mismo proyecto donde creaste el bucket.`
      : `Error al subir imagen: ${error.message}`;
    throw new Error(msg);
  }

  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);

  return { url: data.publicUrl, path };
}
