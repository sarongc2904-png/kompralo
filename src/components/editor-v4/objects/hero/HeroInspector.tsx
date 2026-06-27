'use client';

import { useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { useSaveManager } from '../../core/SaveManager';
import { updateInlineEditableText, updateEventDateTime } from '@/app/dashboard/invitations/[id]/edit/actions';

interface HeroField {
  key: string;
  label: string;
  placeholder: string;
  type?: 'text' | 'date' | 'time';
}

const HERO_FIELDS: HeroField[] = [
  { key: 'name1',           label: 'Nombre 1',          placeholder: 'María',             type: 'text' },
  { key: 'name2',           label: 'Nombre 2',          placeholder: 'José',              type: 'text' },
  { key: 'emotionalPhrase', label: 'Frase de portada',  placeholder: 'Juntos para siempre', type: 'text' },
  { key: 'venueName',       label: 'Venue / Lugar',     placeholder: 'Jardín Las Palmas', type: 'text' },
  { key: 'date',            label: 'Fecha del evento',  placeholder: '',                  type: 'date' },
  { key: 'time',            label: 'Hora del evento',   placeholder: '',                  type: 'time' },
];

// Map from meta key → fieldPath used by updateInlineEditableText
const TEXT_FIELD_PATHS: Record<string, string> = {
  name1:           'protagonists.0.name',
  name2:           'protagonists.1.name',
  emotionalPhrase: 'hero.emotionalPhrase',
  venueName:       'location.venueName',
};

export function HeroInspector({
  element,
  invitationId,
  isMobileSheet,
  onSaved,
}: InspectorProps) {
  const [drafts, setDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(HERO_FIELDS.map((f) => [f.key, element.meta?.[f.key] ?? ''])),
  );
  const { saving, savedKey, error, save } = useSaveManager();

  function setDraft(key: string, value: string) {
    setDrafts((prev) => ({ ...prev, [key]: value }));
  }

  function isDirty(key: string) {
    return drafts[key] !== (element.meta?.[key] ?? '');
  }

  async function handleSave(key: string) {
    const value = drafts[key] ?? '';

    if (key === 'date' || key === 'time') {
      // Structural change — full reload so Countdown, Itinerary etc. update
      await save(
        'datetime',
        () => updateEventDateTime({
          id: invitationId,
          eventDate: key === 'date' ? value : drafts['date'] ?? element.meta?.date ?? '',
          eventTime: key === 'time' ? value : drafts['time'] ?? element.meta?.time ?? '',
        }),
        () => onSaved(), // no args → reload
      );
      return;
    }

    const fieldPath = TEXT_FIELD_PATHS[key];
    if (!fieldPath) return;
    await save(
      key,
      () => updateInlineEditableText({ id: invitationId, fieldPath, value }),
      () => onSaved(fieldPath, value), // text → postMessage, no reload
    );
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
          <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C5A880', fontWeight: 600 }}>
            Portada
          </p>
          <div style={{ height: 1, background: 'rgba(200,167,93,0.15)' }} />
        </>
      )}

      {error && !saving && (
        <p style={{ fontSize: 11, color: '#c0392b' }}>{error}</p>
      )}

      {HERO_FIELDS.map((field) => {
        const dirty = isDirty(field.key);
        const isSaved = savedKey === field.key || (field.key === 'date' || field.key === 'time' ? savedKey === 'datetime' : false);

        return (
          <div key={field.key} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label style={{ fontSize: 11, color: '#9B8878', fontWeight: 500 }}>
                {field.label}
              </label>
              {isSaved && !saving && (
                <span style={{ fontSize: 10, color: '#C5A880' }}>✓ Guardado</span>
              )}
            </div>

            <input
              type={field.type ?? 'text'}
              value={drafts[field.key] ?? ''}
              onChange={(e) => setDraft(field.key, e.target.value)}
              placeholder={field.placeholder}
              style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
              onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
            />

            <button
              type="button"
              onClick={() => handleSave(field.key)}
              disabled={saving || !dirty}
              style={{
                padding: '7px 0', borderRadius: 8, border: 'none',
                background: dirty && !saving ? '#1A1410' : 'rgba(200,167,93,0.15)',
                color:      dirty && !saving ? '#F5EDD8' : '#9B8878',
                fontSize: 11, fontWeight: 600,
                cursor: dirty && !saving ? 'pointer' : 'not-allowed',
                transition: 'all 150ms',
              }}
            >
              {saving ? 'Guardando…' : 'Guardar'}
            </button>
          </div>
        );
      })}
    </div>
  );
}
