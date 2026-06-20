'use client';

import { useActionState, useState } from 'react';
import type { InvitationContent } from '@/domain/invitations';
import { updateInvitationMediaInfo } from './actions';
import { ImageUploadButton } from '@/components/dashboard/ImageUploadButton';
import type { UpdateInvitationResult } from './actions';
import { notifyPreviewRefresh } from './previewRefresh';
import { MusicLibrarySelector } from './MusicLibrarySelector';

const INITIAL_STATE: UpdateInvitationResult | null = null;

// ─── Field ────────────────────────────────────────────────────────────────────

function Field({
  label,
  name,
  defaultValue,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-widest mb-1.5"
        style={{ color: '#6B5B4E' }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="url"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: '#FAFAF8',
          border: '1px solid #E8E2DA',
          color: '#1A1410',
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = '#E8E2DA'; }}
      />
      {hint && (
        <p className="text-[10px] mt-1" style={{ color: '#B0A090' }}>{hint}</p>
      )}
    </div>
  );
}

function TextField({
  label,
  name,
  defaultValue,
  hint,
  placeholder,
}: {
  label: string;
  name: string;
  defaultValue: string;
  hint?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs uppercase tracking-widest mb-1.5"
        style={{ color: '#6B5B4E' }}
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type="text"
        defaultValue={defaultValue}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg text-sm transition-colors"
        style={{
          background: '#FAFAF8',
          border: '1px solid #E8E2DA',
          color: '#1A1410',
          outline: 'none',
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
        onBlur={(e)  => { e.currentTarget.style.borderColor = '#E8E2DA'; }}
      />
      {hint && (
        <p className="text-[10px] mt-1" style={{ color: '#B0A090' }}>{hint}</p>
      )}
    </div>
  );
}

// ─── Section heading ──────────────────────────────────────────────────────────

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[10px] uppercase tracking-[0.2em] mb-3 pb-2"
      style={{ color: '#C5A880', borderBottom: '1px solid #F0EBE4' }}
    >
      {children}
    </p>
  );
}

// ─── Form ─────────────────────────────────────────────────────────────────────

interface MediaFormProps {
  invitation: InvitationContent;
}

export default function MediaForm({ invitation }: MediaFormProps) {
  const [heroImageUrl, setHeroImageUrl] = useState(invitation.hero?.imageUrl ?? '');
  const [result, formAction, isPending] = useActionState(
    async (_prev: UpdateInvitationResult | null, formData: FormData) => {
      const res = await updateInvitationMediaInfo({
        id:            invitation.id,
        slug:          invitation.slug,
        heroImageUrl:  formData.get('heroImageUrl')  as string ?? '',
        heroVideoUrl:  formData.get('heroVideoUrl')  as string ?? '',
        musicUrl:      formData.get('musicUrl')      as string ?? '',
        musicTitle:    formData.get('musicTitle')    as string ?? '',
        youtubeUrl:    formData.get('youtubeUrl')    as string ?? '',
        googleMapsUrl: formData.get('googleMapsUrl') as string ?? '',
        wazeUrl:       formData.get('wazeUrl')       as string ?? '',
      });
      if (res.success) notifyPreviewRefresh();
      return res;
    },
    INITIAL_STATE,
  );

  return (
    <form action={formAction}>
      {/* Feedback */}
      {result && (
        <div
          className="mb-6 px-4 py-3 rounded-lg text-sm"
          style={{
            background: result.success ? '#E8F5E9' : '#FFEBEE',
            color:      result.success ? '#388E3C'  : '#C62828',
            border:     `1px solid ${result.success ? '#C8E6C9' : '#FFCDD2'}`,
          }}
        >
          {result.success ? result.message : result.error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-6">

        {/* Hero */}
        <div>
          <SectionLabel>Hero</SectionLabel>
          <div className="grid grid-cols-1 gap-4">
            <div>
              <label
                htmlFor="heroImageUrl"
                className="block text-xs uppercase tracking-widest mb-1.5"
                style={{ color: '#6B5B4E' }}
              >
                Imagen principal (URL)
              </label>
              <div className="flex gap-2 items-center">
                <input
                  id="heroImageUrl"
                  name="heroImageUrl"
                  type="url"
                  value={heroImageUrl}
                  onChange={(e) => setHeroImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="flex-1 px-3 py-2 rounded-lg text-sm transition-colors"
                  style={{ background: '#FAFAF8', border: '1px solid #E8E2DA', color: '#1A1410', outline: 'none' }}
                  onFocus={(e) => { e.currentTarget.style.borderColor = '#C5A880'; }}
                  onBlur={(e)  => { e.currentTarget.style.borderColor = '#E8E2DA'; }}
                />
                <ImageUploadButton
                  folder="hero"
                  invitationId={invitation.id}
                  onUpload={setHeroImageUrl}
                />
              </div>
              <p className="text-[10px] mt-1" style={{ color: '#B0A090' }}>
                URL directa a la imagen de portada. Formatos: jpg, webp, png.
              </p>
            </div>
            <Field
              label="Video de fondo (URL)"
              name="heroVideoUrl"
              defaultValue={invitation.hero?.videoUrl ?? ''}
              hint="URL directa a archivo mp4. Opcional — sobreescribe la imagen si se proporciona."
              placeholder="https://..."
            />
          </div>
        </div>

        {/* Música */}
        <div>
          <MusicLibrarySelector invitation={invitation} />
        </div>

        {/* Video embed */}
        <div>
          <SectionLabel>Video</SectionLabel>
          <Field
            label="YouTube URL"
            name="youtubeUrl"
            defaultValue={invitation.hero?.youtubeUrl ?? ''}
            hint="Enlace de youtube.com o youtu.be. Se embebe como video del evento."
            placeholder="https://www.youtube.com/watch?v=..."
          />
        </div>

        {/* Navegación */}
        <div>
          <SectionLabel>Navegación</SectionLabel>
          <div className="grid grid-cols-1 gap-4">
            <Field
              label="Google Maps URL"
              name="googleMapsUrl"
              defaultValue={invitation.location?.googleMapsLink ?? ''}
              hint="Enlace de maps.google.com, google.com/maps o goo.gl/maps."
              placeholder="https://maps.google.com/..."
            />
            <Field
              label="Waze URL"
              name="wazeUrl"
              defaultValue={invitation.location?.wazeLink ?? ''}
              hint="Enlace de waze.com."
              placeholder="https://waze.com/ul?..."
            />
          </div>
        </div>
      </div>

      {/* Submit */}
      <div className="mt-8">
        <button
          type="submit"
          disabled={isPending}
          className="px-5 py-2.5 rounded-lg text-sm font-medium transition-opacity"
          style={{ background: '#1A1410', color: '#F5F3F0', opacity: isPending ? 0.6 : 1 }}
        >
          {isPending ? 'Guardando…' : 'Guardar multimedia'}
        </button>
      </div>
    </form>
  );
}
