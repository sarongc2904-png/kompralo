'use client';

import { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { useSaveManager } from '../../core/SaveManager';
import { updateInlineEditableText } from '@/app/dashboard/invitations/[id]/edit/actions';

interface IntroField {
  fieldPath: string;
  label: string;
  placeholder: string;
}

const INTRO_FIELDS: IntroField[] = [
  { fieldPath: 'hero.introTitle',      label: 'Texto superior',  placeholder: 'Estás Invitado a Celebrar' },
  { fieldPath: 'hero.introSubtitle',   label: 'Subtítulo',       placeholder: 'Nombre del evento o venue' },
  { fieldPath: 'hero.introButtonText', label: 'Texto del botón', placeholder: 'Abrir Invitación' },
];

export function IntroInspector({
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const [drafts, setDrafts]     = useState<Record<string, string>>({});
  const { saving, savedKey, error, save } = useSaveManager();

  function setDraft(fieldPath: string, value: string) {
    setDrafts((prev) => ({ ...prev, [fieldPath]: value }));
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
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

      {error && !saving && (
        <p style={{ fontSize: 11, color: '#c0392b' }}>{error}</p>
      )}

      {INTRO_FIELDS.map((field) => {
        const draft   = drafts[field.fieldPath] ?? '';
        const isDirty = draft !== '';
        const isSaved = savedKey === field.fieldPath;

        return (
          <div key={field.fieldPath} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>
                {field.label}
              </label>
              {isSaved && !saving && (
                <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>
              )}
            </div>

            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(field.fieldPath, e.target.value)}
              placeholder={field.placeholder}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
            />

            <button
              type="button"
              onClick={() => {
                const savedValue = draft;
                save(
                  field.fieldPath,
                  () => updateInlineEditableText({ id: invitationId, fieldPath: field.fieldPath, value: savedValue }),
                  () => onSaved(field.fieldPath, savedValue),
                );
              }}
              disabled={saving || !isDirty}
              style={{
                padding: '7px 0', borderRadius: 8, border: 'none',
                background: isDirty && !saving ? '#1A1410' : 'rgba(200,167,93,0.15)',
                color:      isDirty && !saving ? '#F5EDD8' : '#9B8878',
                fontSize: 11, fontWeight: 600,
                cursor: isDirty && !saving ? 'pointer' : 'not-allowed',
                transition: 'all 150ms',
              }}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        );
      })}

      <div style={{ height: 1, background: 'rgba(200,167,93,0.1)' }} />
      <p style={{ fontSize: 10, color: '#9B8878', lineHeight: 1.6 }}>
        Los nombres y fecha se editan en la sección Portada.
      </p>
    </div>
  );
}
