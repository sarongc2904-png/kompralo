'use client';

import React, { useRef, useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { uploadInvitationAsset } from '@/lib/storage';
import { updateFinalMessage } from '@/app/dashboard/invitations/[id]/edit/actions';
import type { InvitationFinalMessage } from '@/domain/invitations';

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#9B8878',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: 6,
};

function parseFinalMessage(raw?: string): InvitationFinalMessage {
  try {
    const parsed = JSON.parse(raw || '{}') as Partial<InvitationFinalMessage>;
    return {
      quote:     parsed.quote     ?? '',
      imageUrl:  parsed.imageUrl  ?? '',
      title:     parsed.title     ?? '',
      message:   parsed.message   ?? '',
      signature: parsed.signature ?? '',
    };
  } catch {
    return { quote: '', imageUrl: '', title: '', message: '', signature: '' };
  }
}

export function MessageInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const slug = element.meta?.slug ?? '';
  const base = parseFinalMessage(element.meta?.finalMessageJson);

  const [imageUrl,  setImageUrl]  = useState(base.imageUrl ?? '');
  const [uploading, setUploading] = useState(false);
  const [error,     setError]     = useState<string | null>(null);
  const [saved,     setSaved]     = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Upload ────────────────────────────────────────────────────────────────────

  async function handleFile(file: File) {
    setUploading(true);
    setError(null);
    try {
      const { url } = await uploadInvitationAsset(file, 'hero', invitationId);
      await persistImageUrl(url);
      setImageUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen.');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  }

  async function handleRemove() {
    await persistImageUrl('');
    setImageUrl('');
  }

  async function persistImageUrl(url: string) {
    setError(null);
    const result = await updateFinalMessage({
      id:   invitationId,
      slug,
      finalMessage: {
        title:     base.title     ?? '',
        message:   base.message   ?? '',
        quote:     base.quote     ?? '',
        imageUrl:  url,
        signature: base.signature ?? '',
      },
    });
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } else {
      setError(result.error ?? 'Error al guardar');
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
      paddingBottom: isMobileSheet ? 12 : undefined,
    }}>
      {!isMobileSheet && (
        <div style={{ height: 1, background: 'rgba(200,167,93,0.15)', marginBottom: 4 }} />
      )}

      {/* Hint */}
      <div style={{
        background: 'rgba(200,167,93,0.07)',
        border: '1px solid rgba(200,167,93,0.2)',
        borderRadius: 8,
        padding: '10px 12px',
      }}>
        <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.5, margin: 0 }}>
          El título, frase y firma se editan tocando directamente el texto en la invitación.
        </p>
      </div>

      {/* Image section */}
      <div>
        <span style={labelStyle}>Foto de fondo</span>

        {imageUrl && (
          <div style={{
            width: '100%',
            height: 140,
            borderRadius: 10,
            overflow: 'hidden',
            border: '1px solid rgba(200,167,93,0.22)',
            background: '#EEE6DA',
            marginBottom: 8,
            position: 'relative',
          }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt="Foto de fondo"
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleFile(file);
          }}
        />

        <button
          type="button"
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
          style={{
            width: '100%',
            padding: '9px 12px',
            borderRadius: 8,
            border: '1px solid rgba(200,167,93,0.35)',
            background: '#FAFAF8',
            color: '#1A1410',
            fontSize: 13,
            fontWeight: 600,
            cursor: uploading ? 'default' : 'pointer',
            opacity: uploading ? 0.7 : 1,
            marginBottom: imageUrl ? 6 : 0,
          }}
        >
          {uploading ? 'Subiendo…' : imageUrl ? '📷 Cambiar foto' : '📷 Subir foto de fondo'}
        </button>

        {imageUrl && (
          <button
            type="button"
            onClick={() => void handleRemove()}
            style={{
              width: '100%',
              padding: '8px 0',
              borderRadius: 8,
              border: '1px solid rgba(192,57,43,0.3)',
              background: 'rgba(192,57,43,0.06)',
              color: '#c0392b',
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Eliminar foto
          </button>
        )}
      </div>

      {/* Feedback */}
      {error && (
        <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{error}</p>
      )}
      {saved && !error && (
        <p style={{ fontSize: 11, color: '#C5A880', margin: 0 }}>✓ Guardado</p>
      )}
    </div>
  );
}
