'use client';

import { useEffect, useRef, useState } from 'react';
import type { EditorV4ElementSelectedEvent } from '../editor-v4-events';

interface TextInspectorProps {
  element: EditorV4ElementSelectedEvent;
  onSave: (fieldPath: string, value: string) => void;
  onCancel: () => void;
  saving?: boolean;
  /** When true, render action buttons in a sticky footer (mobile bottom sheet) */
  stickyActions?: boolean;
}

export function TextInspector({ element, onSave, onCancel, saving = false, stickyActions = false }: TextInspectorProps) {
  const [draft, setDraft] = useState(element.value ?? '');
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const actionsRef = useRef<HTMLDivElement>(null);

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

  function handleTextareaFocus() {
    if (!stickyActions) return;
    // After keyboard opens (short delay), scroll actions into view
    setTimeout(() => {
      actionsRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }, 320);
  }

  const actionButtons = (
    <div
      ref={actionsRef}
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
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: stickyActions ? 0 : undefined }}>
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
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; handleTextareaFocus(); }}
          onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
          placeholder="Escribe aquí…"
        />
      </div>

      {actionButtons}
    </div>
  );
}
