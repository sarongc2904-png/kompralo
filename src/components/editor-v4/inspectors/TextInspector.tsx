'use client';

import { useEffect, useRef, useState } from 'react';
import type { EditorV4ElementSelectedEvent } from '../editor-v4-events';

interface TextInspectorProps {
  element: EditorV4ElementSelectedEvent;
  onSave: (fieldPath: string, value: string) => void;
  onCancel: () => void;
  saving?: boolean;
}

export function TextInspector({ element, onSave, onCancel, saving = false }: TextInspectorProps) {
  const [draft, setDraft] = useState(element.value ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Sync draft when a different element is selected
  useEffect(() => {
    setDraft(element.value ?? '');
  }, [element.fieldPath, element.value]);

  // Auto-focus and auto-resize
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.focus();
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }, [element.fieldPath]);

  function handleResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    el.style.height = `${el.scrollHeight}px`;
  }

  const isDirty = draft !== (element.value ?? '');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Field info */}
      <div>
        <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C5A880', fontWeight: 600, marginBottom: 4 }}>
          Texto
        </p>
        <p style={{ fontSize: 11, color: '#9B8878', fontFamily: 'monospace', wordBreak: 'break-all' }}>
          {element.fieldPath}
        </p>
        {element.label && (
          <p style={{ fontSize: 12, color: '#5C4A3E', marginTop: 2 }}>{element.label}</p>
        )}
      </div>

      {/* Divider */}
      <div style={{ height: 1, background: 'rgba(200,167,93,0.15)' }} />

      {/* Textarea */}
      <div>
        <label style={{ fontSize: 11, color: '#9B8878', display: 'block', marginBottom: 6 }}>
          Contenido
        </label>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); handleResize(); }}
          rows={3}
          style={{
            width: '100%',
            resize: 'none',
            background: 'rgba(255,252,245,0.8)',
            border: '1px solid rgba(200,167,93,0.3)',
            borderRadius: 8,
            padding: '10px 12px',
            fontSize: 13,
            color: '#1F1A16',
            fontFamily: 'inherit',
            lineHeight: 1.5,
            outline: 'none',
            boxSizing: 'border-box',
            overflow: 'hidden',
            transition: 'border-color 150ms',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
          placeholder="Escribe aquí…"
        />
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          onClick={() => onSave(element.fieldPath, draft)}
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
    </div>
  );
}
