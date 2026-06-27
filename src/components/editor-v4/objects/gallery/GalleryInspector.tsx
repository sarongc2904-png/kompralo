'use client';

import React, { useRef, useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { uploadInvitationAsset } from '@/lib/storage';
import { updateInvitationGallery } from '@/app/dashboard/invitations/[id]/edit/actions';

const MAX_PHOTOS = 20;

const inputStyle: React.CSSProperties = {
  fontSize: 11,
  color: '#9B8878',
  fontWeight: 500,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
} as const;

function parseImages(raw?: string): string[] {
  try {
    const parsed = JSON.parse(raw || '[]') as unknown;
    return Array.isArray(parsed) ? (parsed as string[]).filter(Boolean) : [];
  } catch {
    return [];
  }
}

export function GalleryInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const slug    = element.meta?.slug    ?? '';
  const planId  = element.meta?.planId  ?? '';

  const [images, setImages] = useState<string[]>(
    () => parseImages(element.meta?.imagesJson),
  );
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Plan gate ────────────────────────────────────────────────────────────────

  if (planId === 'basic') {
    return (
      <div style={{
        padding: '24px 16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        alignItems: 'center',
        textAlign: 'center',
      }}>
        <span style={{ fontSize: 28 }}>🖼</span>
        <p style={{ fontSize: 13, color: '#1A1410', fontWeight: 600, margin: 0 }}>
          La galería requiere Plan Premium
        </p>
        <p style={{ fontSize: 12, color: '#9B8878', margin: 0, lineHeight: 1.5 }}>
          Actualiza tu plan para subir fotos a la galería de tu invitación.
        </p>
      </div>
    );
  }

  // ── Helpers ──────────────────────────────────────────────────────────────────

  async function persist(nextImages: string[]) {
    setError(null);
    const result = await updateInvitationGallery({
      id:    invitationId,
      slug,
      items: nextImages.map((url) => ({ url, caption: '' })),
    });
    if (!result.success) {
      setError(result.error ?? 'Error al guardar');
      return false;
    }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    onSaved();
    return true;
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!fileInputRef.current) return;
    fileInputRef.current.value = '';
    if (!file) return;
    if (images.length >= MAX_PHOTOS) {
      setError(`Máximo ${MAX_PHOTOS} fotos permitidas.`);
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadInvitationAsset(file, 'gallery', invitationId);
      const next = [...images, url];
      setImages(next);
      await persist(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la foto.');
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(index: number) {
    const next = images.filter((_, i) => i !== index);
    setImages(next);
    await persist(next);
  }

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 12,
      paddingBottom: isMobileSheet ? 12 : undefined,
    }}>
      {!isMobileSheet && (
        <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={inputStyle}>Fotos</span>
        <span style={{ fontSize: 11, color: images.length >= MAX_PHOTOS ? '#c0392b' : '#9B8878' }}>
          {images.length} / {MAX_PHOTOS}
        </span>
      </div>

      {/* Grid */}
      {images.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 8,
        }}>
          {images.map((url, i) => (
            <div key={i} style={{ position: 'relative' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Galería ${i + 1}`}
                style={{
                  width: '100%',
                  aspectRatio: '1 / 1',
                  objectFit: 'cover',
                  borderRadius: 6,
                  display: 'block',
                  border: '1px solid rgba(200,167,93,0.2)',
                }}
              />
              <button
                type="button"
                onClick={() => void handleDelete(i)}
                title="Eliminar foto"
                style={{
                  position: 'absolute',
                  top: 4,
                  right: 4,
                  width: 20,
                  height: 20,
                  borderRadius: '50%',
                  border: 'none',
                  background: 'rgba(26,20,16,0.7)',
                  color: '#F5EDD8',
                  fontSize: 11,
                  fontWeight: 700,
                  lineHeight: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backdropFilter: 'blur(4px)',
                }}
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {images.length === 0 && !uploading && (
        <p style={{ fontSize: 12, color: '#B0A090', textAlign: 'center', margin: '8px 0' }}>
          No hay fotos. Agrega una para comenzar.
        </p>
      )}

      {/* Feedback */}
      {error && (
        <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{error}</p>
      )}
      {saved && !error && (
        <p style={{ fontSize: 11, color: '#C5A880', margin: 0 }}>✓ Guardado</p>
      )}

      {/* Add button */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        style={{ display: 'none' }}
        onChange={(e) => void handleFileChange(e)}
      />
      <button
        type="button"
        disabled={uploading || images.length >= MAX_PHOTOS}
        onClick={() => fileInputRef.current?.click()}
        style={{
          width: '100%',
          padding: '10px 12px',
          borderRadius: 8,
          border: '1px dashed rgba(200,167,93,0.5)',
          background: uploading ? 'rgba(200,167,93,0.08)' : '#FAFAF8',
          color: images.length >= MAX_PHOTOS ? '#B0A090' : '#1A1410',
          fontSize: 13,
          fontWeight: 600,
          cursor: uploading || images.length >= MAX_PHOTOS ? 'default' : 'pointer',
          opacity: uploading || images.length >= MAX_PHOTOS ? 0.7 : 1,
          transition: 'all 150ms',
        }}
      >
        {uploading ? 'Subiendo…' : '＋ Agregar foto'}
      </button>
    </div>
  );
}
