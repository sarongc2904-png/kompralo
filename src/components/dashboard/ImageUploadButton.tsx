'use client';

import { useRef, useState } from 'react';
import { uploadInvitationAsset, type StorageFolder } from '@/lib/storage';

interface ImageUploadButtonProps {
  folder: StorageFolder;
  invitationId: string;
  /** Called with the Supabase public URL once the upload succeeds */
  onUpload: (url: string) => void;
  label?: string;
}

/**
 * Small inline button that opens a file picker, uploads to Supabase Storage,
 * and calls `onUpload(url)` on success.
 *
 * Drop this next to any image-URL text input in the dashboard forms.
 * Requires ThemeProviderV2 NOT to be present — it's a pure admin component.
 */
export function ImageUploadButton({
  folder,
  invitationId,
  onUpload,
  label = 'Subir',
}: ImageUploadButtonProps) {
  const inputRef  = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    try {
      const { url } = await uploadInvitationAsset(file, folder, invitationId);
      onUpload(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir');
    } finally {
      setLoading(false);
      // Reset so the same file can be re-selected if needed
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <span className="inline-flex flex-col gap-0.5">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleFileChange}
      />
      <button
        type="button"
        onClick={() => { setError(null); inputRef.current?.click(); }}
        disabled={loading}
        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded text-xs font-medium transition-opacity"
        style={{
          background: '#F0EBE4',
          color:      '#3D2B1A',
          border:     '1px solid #D4C5B0',
          opacity:    loading ? 0.6 : 1,
          whiteSpace: 'nowrap',
        }}
      >
        {loading ? (
          <>
            <span
              className="inline-block w-3 h-3 rounded-full border-2 border-current border-t-transparent animate-spin"
              aria-hidden="true"
            />
            Subiendo…
          </>
        ) : (
          <>↑ {label}</>
        )}
      </button>
      {error && (
        <span className="text-[10px] leading-tight" style={{ color: '#C62828' }}>
          {error}
        </span>
      )}
    </span>
  );
}
