'use client';

import { useCallback, useState } from 'react';
import type { SelectedElement } from './useEditorV4Selection';
import { TextInspector } from './inspectors/TextInspector';

interface EditorV4InspectorProps {
  selectedElement: SelectedElement;
  onClear: () => void;
  invitationId: string;
  /** Called after a successful save so caller can refresh iframe */
  onSaved?: () => void;
}

export function EditorV4Inspector({
  selectedElement,
  onClear,
  invitationId,
  onSaved,
}: EditorV4InspectorProps) {
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);

  const handleSave = useCallback(async (fieldPath: string, value: string) => {
    setSaving(true);
    try {
      // Reuse the existing KOMPRALO_INLINE_EDIT postMessage channel —
      // the preview iframe's own handler already saves via Server Action.
      // We post the message to ALL iframes on the page (there's only one).
      const iframes = document.querySelectorAll('iframe');
      iframes.forEach((iframe) => {
        iframe.contentWindow?.postMessage(
          { type: 'KOMPRALO_INLINE_EDIT', fieldPath, value },
          window.location.origin,
        );
      });
      setLastSaved(fieldPath);
      onSaved?.();
    } finally {
      setSaving(false);
    }
  }, [onSaved]);

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
        ) : selectedElement.elementType === 'text' ? (
          <>
            <TextInspector
              element={selectedElement}
              onSave={handleSave}
              onCancel={onClear}
              saving={saving}
            />
            {lastSaved === selectedElement.fieldPath && !saving && (
              <p style={{ fontSize: 11, color: '#C5A880', textAlign: 'center', marginTop: 10 }}>
                ✓ Guardado
              </p>
            )}
          </>
        ) : null}
      </div>
    </div>
  );
}
