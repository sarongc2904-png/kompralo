'use client';

import React, { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { updateInlineEditableText } from '@/app/dashboard/invitations/[id]/edit/actions';

const INTRO_FIELDS = [
  { fieldPath: 'hero.introTitle',      label: 'Texto superior',  placeholder: 'Estás Invitado a Celebrar' },
  { fieldPath: 'hero.introSubtitle',   label: 'Subtítulo',       placeholder: 'Nuestra Boda' },
  { fieldPath: 'hero.introButtonText', label: 'Texto del botón', placeholder: 'Abrir Invitación' },
] as const;

export function IntroInspector({ invitationId, isMobileSheet, onSaved }: InspectorProps) {
  const [drafts,  setDrafts]  = useState<Record<string, string>>({});
  const [saving,  setSaving]  = useState(false);
  const [saved,   setSaved]   = useState(false);
  const [error,   setError]   = useState<string | null>(null);

  function setDraft(fieldPath: string, value: string) {
    setDrafts(prev => ({ ...prev, [fieldPath]: value }));
    setSaved(false);
  }

  const dirtyFields = INTRO_FIELDS.filter(f => {
    const v = drafts[f.fieldPath];
    return v !== undefined && v !== '';
  });
  const isDirty = dirtyFields.length > 0;

  async function handleSave() {
    if (!isDirty || saving) return;
    setSaving(true);
    setError(null);
    try {
      await Promise.all(
        dirtyFields.map(f =>
          updateInlineEditableText({ id: invitationId, fieldPath: f.fieldPath, value: drafts[f.fieldPath] })
        )
      );
      // Trigger iframe reload (no fieldPath → structural refresh)
      onSaved();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,252,245,0.8)',
    border: '1px solid rgba(200,167,93,0.3)',
    borderRadius: 8, padding: '9px 12px',
    fontSize: 13, color: '#1F1A16', fontFamily: 'inherit',
    lineHeight: 1.5, outline: 'none', boxSizing: 'border-box',
    transition: 'border-color 150ms',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      {!isMobileSheet && (
        <>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C5A880', fontWeight: 600, marginBottom: 4 }}>
              Intro Cinematográfico
            </p>
            <p style={{ fontSize: 11, color: '#9B8878', lineHeight: 1.5 }}>
              Edita los textos que aparecen en la pantalla de entrada.
            </p>
          </div>
          <div style={{ height: 1, background: 'rgba(200,167,93,0.15)' }} />
        </>
      )}

      {INTRO_FIELDS.map(field => (
        <div key={field.fieldPath} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>
            {field.label}
          </label>
          <input
            type="text"
            value={drafts[field.fieldPath] ?? ''}
            onChange={e => setDraft(field.fieldPath, e.target.value)}
            placeholder={field.placeholder}
            style={inputStyle}
            onFocus={e => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
            onBlur={e  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
          />
        </div>
      ))}

      {error && (
        <p style={{ fontSize: 11, color: '#c0392b', margin: 0 }}>{error}</p>
      )}

      <button
        type="button"
        onClick={handleSave}
        disabled={!isDirty || saving}
        style={{
          padding: '9px 0', borderRadius: 8, border: 'none',
          background: isDirty && !saving ? '#1A1410' : 'rgba(200,167,93,0.15)',
          color:      isDirty && !saving ? '#F5EDD8' : '#9B8878',
          fontSize: 12, fontWeight: 600,
          cursor: isDirty && !saving ? 'pointer' : 'not-allowed',
          transition: 'all 150ms',
        }}
      >
        {saving ? 'Guardando…' : saved ? '✓ Guardado' : 'Guardar'}
      </button>

      <div style={{ height: 1, background: 'rgba(200,167,93,0.1)' }} />
      <p style={{ fontSize: 10, color: '#9B8878', lineHeight: 1.6 }}>
        Los nombres y fecha se editan en la sección Portada.
      </p>
    </div>
  );
}
