'use client';

import { useEffect, useState } from 'react';
import type { EditorV4ElementSelectedEvent } from '../editor-v4-events';

interface DateTimeInspectorProps {
  element: EditorV4ElementSelectedEvent;
  onSave: (date: string, time: string) => Promise<void>;
  onCancel: () => void;
  saving?: boolean;
  stickyActions?: boolean;
}

export function DateTimeInspector({
  element,
  onSave,
  onCancel,
  saving = false,
  stickyActions = false,
}: DateTimeInspectorProps) {
  const [date, setDate] = useState(element.meta?.date ?? '');
  const [time, setTime] = useState(element.meta?.time ?? '');

  useEffect(() => {
    setDate(element.meta?.date ?? '');
    setTime(element.meta?.time ?? '');
  }, [element.fieldPath, element.meta?.date, element.meta?.time]);

  const isDirty =
    date !== (element.meta?.date ?? '') || time !== (element.meta?.time ?? '');

  const inputStyle: React.CSSProperties = {
    width: '100%',
    background: 'rgba(255,252,245,0.8)',
    border: '1px solid rgba(200,167,93,0.3)',
    borderRadius: 8,
    padding: '10px 12px',
    fontSize: 13,
    color: '#1F1A16',
    fontFamily: 'inherit',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 150ms',
  };

  const actionButtons = (
    <div
      style={{
        display: 'flex',
        gap: 8,
        ...(stickyActions
          ? {
              position: 'sticky',
              bottom: 0,
              background: '#FAF7F2',
              padding: '12px 16px',
              paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
              borderTop: '1px solid rgba(200,167,93,0.12)',
              marginLeft: -16,
              marginRight: -16,
            }
          : {}),
      }}
    >
      <button
        type="button"
        onClick={() => onSave(date, time)}
        disabled={saving || !isDirty}
        style={{
          flex: 1,
          padding: '9px 0',
          borderRadius: 8,
          border: 'none',
          background: isDirty && !saving ? '#1A1410' : 'rgba(200,167,93,0.15)',
          color: isDirty && !saving ? '#F5EDD8' : '#9B8878',
          fontSize: 12,
          fontWeight: 600,
          cursor: isDirty && !saving ? 'pointer' : 'not-allowed',
          transition: 'all 150ms',
        }}
      >
        {saving ? 'Guardando…' : 'Guardar'}
      </button>
      <button
        type="button"
        onClick={onCancel}
        style={{
          padding: '9px 16px',
          borderRadius: 8,
          border: '1px solid rgba(200,167,93,0.25)',
          background: 'transparent',
          color: '#9B8878',
          fontSize: 12,
          fontWeight: 600,
          cursor: 'pointer',
        }}
      >
        Cancelar
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {stickyActions ? (
        <p style={{ fontSize: 13, fontWeight: 600, color: '#5C4A3E', margin: 0 }}>
          Fecha del evento
        </p>
      ) : (
        <>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C5A880', fontWeight: 600, marginBottom: 4 }}>
              Fecha y hora
            </p>
          </div>
          <div style={{ height: 1, background: 'rgba(200,167,93,0.15)' }} />
        </>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div>
          <label style={{ fontSize: 11, color: '#9B8878', display: 'block', marginBottom: 6 }}>
            Fecha
          </label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
          />
        </div>
        <div>
          <label style={{ fontSize: 11, color: '#9B8878', display: 'block', marginBottom: 6 }}>
            Hora
          </label>
          <input
            type="time"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            style={inputStyle}
            onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
          />
        </div>
      </div>

      {actionButtons}
    </div>
  );
}
