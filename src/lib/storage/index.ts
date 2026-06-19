/**
 * Supabase Storage helpers for the `invitations` bucket.
 *
 * Bucket structure:
 *   invitations/
 *     hero/           ← hero image / video thumbnail
 *     gallery/        ← horizontal gallery photos
 *     storybook/      ← story-book slide images
 *     protagonists/   ← protagonist portrait photos
 *     hotels/         ← accommodation hotel images
 *     final-message/  ← closing-section background image
 *
 * File-path format: {folder}/{invitationId}/{timestamp}-{random}.{ext}
 *
 * Setup required in Supabase dashboard:
 *   1. Create bucket named `invitations` (set to Public for CDN URLs)
 *   2. Add RLS INSERT policy for authenticated users
 *   3. Add RLS DELETE policy for authenticated users
 */

export { uploadInvitationAsset }  from './uploadImage';
export type { UploadResult, StorageFolder } from './uploadImage';

export { deleteInvitationAsset } from './deleteImage';

export { getPublicUrl } from './getPublicUrl';
