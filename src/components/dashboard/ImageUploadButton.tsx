'use client';

import { useRef, useState } from 'react';
import { uploadInvitationAsset, type StorageFolder } from '@/lib/storage';

interface ImageUploadButtonProps {
  folder: StorageFolder;
  invitationId: string;
  /** Called with the Supabase public URL once the upload succeeds */
  onUpload: (url: string) => void;
  label?: string;
  /** Extra classes applied to the trigger button — e.g. "w-full sm:w-auto" for mobile stacking */
  className?: string;
}

export function ImageUploadButton({
  folder,
  invitationId,
  onUpload,
  label = 'Subir imagen',
  className = '',
}: ImageUploadButtonProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(false);
  const [error,   setError]     = useState<string | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { url } = await uploadInvitationAsset(file, folder, invitationId);
      onUpload(url);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('No pudimos subir la imagen. Intenta de nuevo.');
      console.error('[ImageUploadButton]', err);
    } finally {
      setLoading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <span className="inline-flex flex-col gap-1">
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
        className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60${className ? ` ${className}` : ''}`}
        style={{
          background:  success ? '#E8F5E9' : '#F0EBE4',
          color:       success ? '#2E7D32' : '#2B1A0E',
          border:      `1px solid ${success ? '#A5D6A7' : '#C5A880'}`,
          whiteSpace:  'nowrap',
        }}
      >
        {loading ? (
          <>
            <span
              className="inline-block h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin"
              aria-hidden="true"
            />
            Subiendo…
          </>
        ) : success ? (
          <>✓ Imagen cargada</>
        ) : (
          <>↑ {label}</>
        )}
      </button>
      {error && (
        <span className="text-xs leading-tight font-medium" style={{ color: '#C62828' }}>
          {error}
        </span>
      )}
    </span>
  );
}
