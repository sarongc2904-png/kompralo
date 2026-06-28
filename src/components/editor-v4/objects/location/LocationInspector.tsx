'use client';

import React, { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { updateInvitationLocation } from '@/app/dashboard/invitations/[id]/edit/actions';

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: '#9B8878',
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
  display: 'block',
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '9px 12px',
  border: '1px solid rgba(200,167,93,0.3)',
  borderRadius: 8,
  fontSize: 13,
  color: '#1F1A16',
  background: 'rgba(255,252,245,0.8)',
  outline: 'none',
  boxSizing: 'border-box',
  fontFamily: 'inherit',
};

export function LocationInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const slug = element.meta?.slug ?? '';

  const [mapsUrl, setMapsUrl] = useState(element.meta?.googleMapsLink ?? '');
  const [wazeUrl, setWazeUrl] = useState(element.meta?.wazeLink ?? '');
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState<string | null>(null);
  const [saved,   setSaved]   = useState(false);

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);
    const result = await updateInvitationLocation({
      id:            invitationId,
      slug,
      googleMapsUrl: mapsUrl,
      wazeUrl,
    });
    setSaving(false);
    if (result.success) {
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      onSaved();
    } else {
      setError(result.error ?? 'Error al guardar');
    }
  }

  async function handleClearUrl(type: 'maps' | 'waze') {
    if (type === 'maps') setMapsUrl('');
    if (type === 'waze') setWazeUrl('');
    setError(null);
    const result = await updateInvitationLocation({
      id:            invitationId,
      slug,
      googleMapsUrl: type === 'maps' ? '' : mapsUrl,
      wazeUrl:       type === 'waze' ? '' : wazeUrl,
    });
    if (result.success) {
      onSaved();
    } else {
      setError(result.error ?? 'Error al limpiar');
    }
  }

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
          El nombre del lugar y la dirección se editan tocando directamente el texto en la invitación.
        </p>
      </div>

      {/* Google Maps */}
      <div>
        <label style={labelStyle}>Google Maps URL</label>
        <div style={{ position: 'relative' }}>
          <input
            type="url"
            value={mapsUrl}
            onChange={(e) => setMapsUrl(e.target.value)}
            placeholder="https://maps.google.com/..."
            style={{ ...inputStyle, paddingRight: mapsUrl ? '2rem' : '12px' }}
          />
          {mapsUrl && (
            <button
              type="button"
              onClick={() => void handleClearUrl('maps')}
              title="Eliminar URL"
              style={{
                position: 'absolute', right: '0.5rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#999', fontSize: '1rem',
                lineHeight: 1, padding: 0,
              }}
            >✕</button>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem', margin: '0.25rem 0 0' }}>
          Si no ingresas una URL, el botón &ldquo;Cómo llegar&rdquo; no aparecerá en la invitación.
        </p>
      </div>

      {/* Waze */}
      <div>
        <label style={labelStyle}>Waze URL</label>
        <div style={{ position: 'relative' }}>
          <input
            type="url"
            value={wazeUrl}
            onChange={(e) => setWazeUrl(e.target.value)}
            placeholder="https://waze.com/ul?..."
            style={{ ...inputStyle, paddingRight: wazeUrl ? '2rem' : '12px' }}
          />
          {wazeUrl && (
            <button
              type="button"
              onClick={() => void handleClearUrl('waze')}
              title="Eliminar URL"
              style={{
                position: 'absolute', right: '0.5rem', top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                cursor: 'pointer', color: '#999', fontSize: '1rem',
                lineHeight: 1, padding: 0,
              }}
            >✕</button>
          )}
        </div>
        <p style={{ fontSize: '0.75rem', color: '#888', marginTop: '0.25rem', margin: '0.25rem 0 0' }}>
          Si no ingresas una URL, el botón de Waze no aparecerá en la invitación.
        </p>
      </div>

      {/* Feedback */}
      {error && (
        <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{error}</p>
      )}
      {saved && !error && (
        <p style={{ fontSize: 11, color: '#C5A880', margin: 0 }}>✓ Guardado</p>
      )}

      {/* Save button */}
      <button
        type="button"
        onClick={() => void handleSave()}
        disabled={saving}
        style={{
          width: '100%',
          padding: '10px 0',
          borderRadius: 8,
          border: 'none',
          background: saving ? 'rgba(200,167,93,0.15)' : '#1A1410',
          color: saving ? '#9B8878' : '#F5EDD8',
          fontSize: 13,
          fontWeight: 600,
          cursor: saving ? 'default' : 'pointer',
          transition: 'all 150ms',
        }}
      >
        {saving ? 'Guardando…' : 'Guardar ubicación'}
      </button>
    </div>
  );
}
