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

// ── Styles ────────────────────────────────────────────────────────────────────

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

// ── Helpers ───────────────────────────────────────────────────────────────────

function parseSlides(raw?: string): InvitationStorySlideInput[] {
  try {
    const parsed = JSON.parse(raw || '[]') as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.map((slide, index) => {
      const item = slide as Partial<InvitationStorySlideInput>;
      return {
        id:       item.id       || `story-slide-${index + 1}`,
        title:    item.title    ?? '',
        subtitle: item.subtitle ?? '',
        text:     item.text     ?? '',
        imageUrl: item.imageUrl ?? '',
        date:     item.date     ?? '',
      };
    });
  } catch {
    return [];
  }
}

function ensureSlides(
  slides: InvitationStorySlideInput[],
  count: number,
): InvitationStorySlideInput[] {
  const result = [...slides];
  while (result.length < count) {
    result.push({
      id:       `story-slide-${result.length + 1}`,
      title:    '',
      subtitle: '',
      text:     '',
      imageUrl: '',
      date:     '',
    });
  }
  return result.slice(0, count);
}

// ── CollapsibleSection ────────────────────────────────────────────────────────

function CollapsibleSection({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ borderBottom: '1px solid rgba(200,167,93,0.15)', marginBottom: 4 }}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '10px 0',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 11,
          fontWeight: 600,
          color: '#9B8878',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        }}
      >
        {title}
        <span style={{ fontSize: 16, lineHeight: 1 }}>{open ? '−' : '+'}</span>
      </button>
      {open && (
        <div style={{ paddingBottom: 12, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {children}
        </div>
      )}
    </div>
  );
}

// ── SlideEditor ───────────────────────────────────────────────────────────────

function SlideEditor({
  index,
  slide,
  invitationId,
  slug,
  allSlides,
  onSlidesChange,
  onSaved,
  saving,
  savedKey,
  save,
}: {
  index: number;
  slide: InvitationStorySlideInput;
  invitationId: string;
  slug: string;
  allSlides: InvitationStorySlideInput[];
  onSlidesChange: (slides: InvitationStorySlideInput[]) => void;
  onSaved: (fieldPath?: string, value?: string) => void;
  saving: boolean;
  savedKey: string | null;
  save: (key: string, action: () => Promise<{ success: boolean; error?: string }>, onSuccess?: () => void) => Promise<void>;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading,   setUploading]   = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fieldPath = `story.slides.${index}.text`;

  async function handleTextSave() {
    await save(
      fieldPath,
      () => updateInlineEditableText({ id: invitationId, fieldPath, value: slide.text }),
      () => onSaved(fieldPath, slide.text),
    );
  }

  async function handleImageFile(file: File) {
    setUploading(true);
    setUploadError(null);
    try {
      const { url } = await uploadInvitationAsset(file, 'storybook', invitationId);
      const nextSlides = allSlides.map((s, i) =>
        i === index ? { ...s, imageUrl: url } : s,
      );
      const result = await updateStoryBook({ id: invitationId, slug, slides: nextSlides });
      if (!result.success) {
        setUploadError(result.error ?? 'Error al guardar');
        return;
      }
      onSlidesChange(nextSlides);
      onSaved();
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Error al subir la foto.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  const textDirty = slide.text !== '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      {/* Text */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>Texto</label>
          {savedKey === fieldPath && !saving && (
            <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>
          )}
        </div>
        <textarea
          value={slide.text}
          rows={3}
          onChange={(e) => {
            const nextSlides = allSlides.map((s, i) =>
              i === index ? { ...s, text: e.target.value } : s,
            );
            onSlidesChange(nextSlides);
          }}
          placeholder="Cuenta este momento especial…"
          style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
        />
        <button
          type="button"
          onClick={handleTextSave}
          disabled={saving}
          style={buttonStyle(!saving)}
        >
          {saving && savedKey === fieldPath ? 'Guardando…' : 'Guardar texto'}
        </button>
      </div>

      {/* Photo */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>Foto</label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleImageFile(file);
          }}
        />
        {slide.imageUrl && (
          <div style={{
            width: '100%', height: 110, borderRadius: 10, overflow: 'hidden',
            border: '1px solid rgba(200,167,93,0.22)', background: '#EEE6DA',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.imageUrl}
              alt={`Foto momento ${index + 1}`}
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}
        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%', padding: '9px 12px', borderRadius: 8,
            border: '1px solid rgba(200,167,93,0.35)', background: '#FAFAF8',
            color: '#1A1410', fontSize: 13, fontWeight: 600,
            cursor: uploading ? 'default' : 'pointer',
            opacity: uploading ? 0.7 : 1,
          }}
        >
          {uploading ? 'Subiendo…' : slide.imageUrl ? '📷 Cambiar foto' : '📷 Subir foto'}
        </button>
        {uploadError && (
          <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{uploadError}</p>
        )}
      </div>
    </div>
  );
}

// ── Main inspector ────────────────────────────────────────────────────────────

export function StoryInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const slug           = element.meta?.slug ?? '';
  const initialSlides  = ensureSlides(parseSlides(element.meta?.slidesJson), 3);

  const [sectionTitle, setSectionTitle] = useState(element.meta?.sectionTitle || 'Nuestra historia');
  const [slides, setSlides]             = useState<InvitationStorySlideInput[]>(initialSlides);

  const { saving, savedKey, error, save } = useSaveManager();

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', gap: 4,
      paddingBottom: isMobileSheet ? 12 : undefined,
    }}>
      {!isMobileSheet && <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 8 }} />}

      {/* Section title */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 8 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Título de sección
          </label>
          {savedKey === 'story.sectionTitle' && !saving && (
            <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>
          )}
        </div>
        <input
          type="text"
          value={sectionTitle}
          onChange={(e) => setSectionTitle(e.target.value)}
          placeholder="Nuestra historia"
          style={inputStyle}
        />
        <button
          type="button"
          onClick={() => save(
            'story.sectionTitle',
            () => updateInlineEditableText({ id: invitationId, fieldPath: 'story.sectionTitle', value: sectionTitle }),
            () => onSaved('story.sectionTitle', sectionTitle),
          )}
          disabled={saving}
          style={buttonStyle(!saving)}
        >
          {saving && savedKey === 'story.sectionTitle' ? 'Guardando…' : 'Guardar título'}
        </button>
      </div>

      {error && !saving && (
        <p style={{ fontSize: 11, color: '#c0392b', margin: '0 0 8px' }}>{error}</p>
      )}

      {/* 3 slides */}
      {[0, 1, 2].map((i) => (
        <CollapsibleSection key={i} title={`Momento ${i + 1}`} defaultOpen={i === 0}>
          <SlideEditor
            index={i}
            slide={slides[i]}
            invitationId={invitationId}
            slug={slug}
            allSlides={slides}
            onSlidesChange={setSlides}
            onSaved={onSaved}
            saving={saving}
            savedKey={savedKey}
            save={save}
          />
        </CollapsibleSection>
      ))}
    </div>
  );
}
