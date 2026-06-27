'use client';

import React, { useRef, useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { useSaveManager } from '../../core/SaveManager';
import {
  updateInlineEditableText,
  updateStoryBook,
} from '@/app/dashboard/invitations/[id]/edit/actions';
import { uploadInvitationAsset } from '@/lib/storage';
import type { InvitationStorySlideInput } from '@/domain/invitations';

const inputStyle: React.CSSProperties = {
  width: '100%',
  background: 'rgba(255,252,245,0.8)',
  border: '1px solid rgba(200,167,93,0.3)',
  borderRadius: 8,
  padding: '9px 12px',
  fontSize: 13,
  color: '#1F1A16',
  fontFamily: 'inherit',
  lineHeight: 1.5,
  outline: 'none',
  boxSizing: 'border-box',
};

function buttonStyle(active: boolean): React.CSSProperties {
  return {
    width: '100%',
    padding: '9px 0',
    borderRadius: 8,
    border: 'none',
    background: active ? '#1A1410' : 'rgba(200,167,93,0.15)',
    color: active ? '#F5EDD8' : '#9B8878',
    fontSize: 12,
    fontWeight: 600,
    cursor: active ? 'pointer' : 'not-allowed',
    transition: 'all 150ms',
  };
}

function parseSlides(raw?: string): InvitationStorySlideInput[] {
  try {
    const parsed = JSON.parse(raw || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((slide, index) => {
      const item = slide as Partial<InvitationStorySlideInput>;
      return {
        id: item.id || `story-slide-${index + 1}`,
        title: item.title ?? '',
        subtitle: item.subtitle ?? '',
        text: item.text ?? '',
        imageUrl: item.imageUrl ?? '',
        date: item.date ?? '',
      };
    });
  } catch {
    return [];
  }
}

function ensureFirstSlide(slides: InvitationStorySlideInput[]): InvitationStorySlideInput[] {
  if (slides.length > 0) return slides;
  return [{
    id: 'story-slide-1',
    title: 'Nuestra historia',
    subtitle: '',
    text: 'Cada historia de amor tiene momentos que no se olvidan. Esta es una pequeña parte de la nuestra.',
    imageUrl: '',
    date: '',
  }];
}

interface TextControlProps {
  label: string;
  value: string;
  placeholder: string;
  multiline?: boolean;
  saving: boolean;
  saved: boolean;
  onChange: (value: string) => void;
  onSave: () => void;
}

function TextControl({
  label,
  value,
  placeholder,
  multiline = false,
  saving,
  saved,
  onChange,
  onSave,
}: TextControlProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>{label}</label>
        {saved && !saving && <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>}
      </div>
      {multiline ? (
        <textarea
          value={value}
          rows={4}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={{ ...inputStyle, resize: 'vertical', minHeight: 92 }}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          style={inputStyle}
        />
      )}
      <button type="button" onClick={onSave} disabled={saving} style={buttonStyle(!saving)}>
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
    </div>
  );
}

export function StoryInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const slug = element.meta?.slug ?? '';
  const initialSlides = ensureFirstSlide(parseSlides(element.meta?.slidesJson));
  const initialFirstSlide = initialSlides[0];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [sectionTitle, setSectionTitle] = useState(element.meta?.sectionTitle || 'Nuestra historia');
  const [storyText, setStoryText] = useState(initialFirstSlide.text);
  const [slides, setSlides] = useState<InvitationStorySlideInput[]>(initialSlides);
  const [imageUrl, setImageUrl] = useState(initialFirstSlide.imageUrl);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const { saving, savedKey, error, save } = useSaveManager();

  async function saveText(fieldPath: string, value: string) {
    const savedValue = value;
    await save(
      fieldPath,
      () => updateInlineEditableText({ id: invitationId, fieldPath, value: savedValue }),
      () => onSaved(fieldPath, savedValue),
    );
  }

  async function handleImageFile(file: File) {
    setUploading(true);
    setUploadError(null);

    try {
      const { url } = await uploadInvitationAsset(file, 'storybook', invitationId);
      const nextSlides = ensureFirstSlide(slides).map((slide, index) => (
        index === 0 ? { ...slide, imageUrl: url } : slide
      ));

      const result = await updateStoryBook({ id: invitationId, slug, slides: nextSlides });
      if (!result.success) {
        setUploadError(result.error);
        return;
      }

      setSlides(nextSlides);
      setImageUrl(url);
      onSaved();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir la foto.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      paddingBottom: isMobileSheet ? 12 : undefined,
    }}>
      {!isMobileSheet && <div style={{ height: 1, background: 'rgba(200,167,93,0.15)' }} />}

      <div style={{
        border: '1px solid rgba(200,167,93,0.18)',
        borderRadius: 12,
        padding: 12,
        background: 'rgba(255,252,245,0.55)',
      }}>
        <p style={{ margin: 0, fontSize: 12, color: '#5C4A3E', lineHeight: 1.5 }}>
          Personaliza la historia principal. Los demás slides siguen disponibles en el editor avanzado.
        </p>
      </div>

      <TextControl
        label="Título"
        value={sectionTitle}
        placeholder="Nuestra historia"
        saving={saving}
        saved={savedKey === 'story.sectionTitle'}
        onChange={setSectionTitle}
        onSave={() => saveText('story.sectionTitle', sectionTitle)}
      />

      <TextControl
        label="Texto"
        value={storyText}
        placeholder="Cuenta este momento especial…"
        multiline
        saving={saving}
        saved={savedKey === 'story.slides.0.text'}
        onChange={setStoryText}
        onSave={() => saveText('story.slides.0.text', storyText)}
      />

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>Foto de pareja</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void handleImageFile(file);
          }}
        />

        {imageUrl && (
          <div style={{
            width: '100%',
            height: 130,
            borderRadius: 12,
            overflow: 'hidden',
            border: '1px solid rgba(200,167,93,0.22)',
            background: '#EEE6DA',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imageUrl} alt="Foto de historia" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
        )}

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '10px 12px',
            borderRadius: 8,
            border: '1px solid rgba(200,167,93,0.35)',
            background: '#FAFAF8',
            color: '#1A1410',
            fontSize: 13,
            fontWeight: 600,
            cursor: uploading ? 'default' : 'pointer',
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? 'Subiendo…' : imageUrl ? 'Cambiar foto' : 'Subir foto'}
        </button>
      </div>

      {error && !saving && (
        <p style={{ fontSize: 11, color: '#c0392b', textAlign: 'center', margin: 0 }}>{error}</p>
      )}
      {uploadError && (
        <p style={{ fontSize: 11, color: '#c0392b', textAlign: 'center', margin: 0 }}>{uploadError}</p>
      )}
    </div>
  );
}
