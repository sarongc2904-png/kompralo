'use client';

import { useCallback, useRef, useState } from 'react';
import type { SelectedElement } from './useEditorV4Selection';
import { TextInspector } from './inspectors/TextInspector';
import { IntroInspector } from './inspectors/IntroInspector';
import { updateInlineEditableText } from '@/app/dashboard/invitations/[id]/edit/actions';

interface EditorV4InspectorProps {
  selectedElement: SelectedElement;
  onClear: () => void;
  invitationId: string;
  /** Called after a successful save so caller can refresh iframe */
  onSaved?: () => void;
  /** True when rendered inside the mobile bottom sheet */
  isMobileSheet?: boolean;
}

export function EditorV4Inspector({
  selectedElement,
  onClear,
  invitationId,
  onSaved,
  isMobileSheet = false,
}: EditorV4InspectorProps) {
  const [saving, setSaving] = useState(false);
  const [savedField, setSavedField] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Clear status badges when a different element is selected
  const prevFieldPath = useRef<string | null>(null);
  if (selectedElement?.fieldPath !== prevFieldPath.current) {
    prevFieldPath.current = selectedElement?.fieldPath ?? null;
    if (savedField !== null) setSavedField(null);
    if (saveError !== null) setSaveError(null);
  }

  const handleSave = useCallback(async (fieldPath: string, value: string) => {
    setSaving(true);
    setSavedField(null);
    setSaveError(null);
    try {
      // Call the Server Action directly — the same one VisualEditorMobileEntry uses.
      // Posting to the iframe (child) is wrong: the listener lives in the parent window.
      const result = await updateInlineEditableText({ id: invitationId, fieldPath, value });
      if (result.success) {
        setSavedField(fieldPath);
        onSaved?.();
      } else {
        setSaveError(result.error ?? 'Error al guardar');
      }
    } catch {
      setSaveError('Error de red al guardar');
    } finally {
      setSaving(false);
    }
  }, [invitationId, onSaved]);

  const panelStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    overflowY: 'auto',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 16px',
    borderBottom: '1px solid rgba(200,167,93,0.15)',
    flexShrink: 0,
  };

  return (
    <div style={panelStyle}>
      {/* Header */}
      <div style={headerStyle}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#5C4A3E' }}>
          Inspector
        </span>
        {selectedElement && (
          <button
            type="button"
            onClick={onClear}
            style={{ fontSize: 16, background: 'none', border: 'none', color: '#9B8878', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
            title="Deseleccionar"
          >
            ×
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 16, flex: 1 }}>
        {!selectedElement ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 32, opacity: 0.35 }}>✦</div>
            <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.6, maxWidth: 180 }}>
              Haz clic sobre cualquier texto de la invitación para editarlo
            </p>
          </div>
        ) : selectedElement.elementType === 'intro' ? (
          <IntroInspector
            onSave={handleSave}
            saving={saving}
            stickyActions={isMobileSheet}
          />
        ) : selectedElement.elementType === 'text' ? (
          <>
            <TextInspector
              element={selectedElement}
              onSave={handleSave}
              onCancel={onClear}
              saving={saving}
              stickyActions={isMobileSheet}
            />
            {savedField === selectedElement.fieldPath && !saving && (
              <p style={{ fontSize: 11, color: '#C5A880', textAlign: 'center', marginTop: 10 }}>
                ✓ Guardado
              </p>
            )}
            {saveError && !saving && (
              <p style={{ fontSize: 11, color: '#c0392b', textAlign: 'center', marginTop: 10 }}>
                {saveError}
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
