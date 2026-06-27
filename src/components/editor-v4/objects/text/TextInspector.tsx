'use client';

import { useEffect, useRef, useState } from 'react';
import type { InspectorProps } from '../../core/editor-types';
import { useSaveManager } from '../../core/SaveManager';
import { updateInlineEditableText } from '@/app/dashboard/invitations/[id]/edit/actions';

export function TextInspector({
  element,
  invitationId,
  isMobileSheet: stickyActions,
  onCancel,
  onSaved,
}: InspectorProps) {
  const [draft, setDraft] = useState(element.value ?? '');
  const { saving, savedKey, error, save } = useSaveManager();
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const actionsRef  = useRef<HTMLDivElement>(null);

  useEffect(() => { setDraft(element.value ?? ''); }, [element.fieldPath, element.value]);

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

  function handleTextareaFocus() {
    if (!stickyActions) return;
    setTimeout(() => actionsRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' }), 320);
  }

  const isDirty = draft !== (element.value ?? '');
  const isSaved = savedKey === element.fieldPath;

  async function handleSave() {
    const savedValue = draft; // capture before any async state change
    await save(
      element.fieldPath,
      () => updateInlineEditableText({ id: invitationId, fieldPath: element.fieldPath, value: savedValue }),
      () => onSaved(element.fieldPath, savedValue),
    );
  }

  const actionButtons = (
    <div
      ref={actionsRef}
      style={{
        display: 'flex',
        gap: 8,
        ...(stickyActions ? {
          position: 'sticky',
          bottom: 0,
          background: '#FAF7F2',
          padding: '12px 16px',
          paddingBottom: 'max(12px, env(safe-area-inset-bottom))',
          borderTop: '1px solid rgba(200,167,93,0.12)',
          marginLeft: -16,
          marginRight: -16,
        } : {}),
      }}
    >
      <button
        type="button"
        onClick={handleSave}
        disabled={saving || !isDirty}
        style={{
          flex: 1, padding: '9px 0', borderRadius: 8, border: 'none',
          background: isDirty && !saving ? '#1A1410' : 'rgba(200,167,93,0.15)',
          color:      isDirty && !saving ? '#F5EDD8' : '#9B8878',
          fontSize: 12, fontWeight: 600,
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
          padding: '9px 16px', borderRadius: 8,
          border: '1px solid rgba(200,167,93,0.25)',
          background: 'transparent', color: '#9B8878',
          fontSize: 12, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Cancelar
      </button>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, paddingBottom: stickyActions ? 0 : undefined }}>
      {stickyActions ? (
        <p style={{ fontSize: 13, fontWeight: 600, color: '#5C4A3E', margin: 0 }}>
          {element.label && element.label !== element.fieldPath ? element.label : 'Editar texto'}
        </p>
      ) : (
        <>
          <div>
            <p style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#C5A880', fontWeight: 600, marginBottom: 4 }}>
              Texto
            </p>
            <p style={{ fontSize: 11, color: '#9B8878', fontFamily: 'monospace', wordBreak: 'break-all' }}>
              {element.fieldPath}
            </p>
            {element.label && element.label !== element.fieldPath && (
              <p style={{ fontSize: 12, color: '#5C4A3E', marginTop: 2 }}>{element.label}</p>
            )}
          </div>
          <div style={{ height: 1, background: 'rgba(200,167,93,0.15)' }} />
        </>
      )}

      <div>
        <label style={{ fontSize: 11, color: '#9B8878', display: 'block', marginBottom: 6 }}>Contenido</label>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={(e) => { setDraft(e.target.value); handleResize(); }}
          rows={3}
          style={{
            width: '100%', resize: 'none',
            background: 'rgba(255,252,245,0.8)',
            border: '1px solid rgba(200,167,93,0.3)',
            borderRadius: 8, padding: '10px 12px',
            fontSize: 13, color: '#1F1A16', fontFamily: 'inherit',
            lineHeight: 1.5, outline: 'none', boxSizing: 'border-box',
            overflow: 'hidden', transition: 'border-color 150ms',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.7)'; handleTextareaFocus(); }}
          onBlur={(e)  => { e.currentTarget.style.borderColor = 'rgba(200,167,93,0.3)'; }}
          placeholder="Escribe aquí…"
        />
      </div>

      {actionButtons}

      {isSaved && !saving && (
        <p style={{ fontSize: 11, color: '#C5A880', textAlign: 'center', marginTop: 2 }}>✓ Guardado</p>
      )}
      {error && !saving && (
        <p style={{ fontSize: 11, color: '#c0392b', textAlign: 'center', marginTop: 2 }}>{error}</p>
      )}
    </div>
  );
}
