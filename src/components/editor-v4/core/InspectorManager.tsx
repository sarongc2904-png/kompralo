'use client';

import type { EditorElement, EditorObjectType } from './editor-types';
import { resolveInspector } from './EditorRegistry';

const TYPE_LABELS: Record<EditorObjectType, string> = {
  text:      'Editar texto',
  intro:     'Intro cinematográfico',
  datetime:  'Fecha del evento',
  hero:      'Portada',
  countdown: 'Cuenta Regresiva',
  parents:   'Familias',
  story:     'Historia',
  gallery:   'Galería',
  timeline:  'Línea del Tiempo',
  itinerary: 'Itinerario',
  location:  'Ubicación',
  dresscode: 'Código de Vestimenta',
  gifts:     'Mesa de Regalos',
  padrinos:  'Padrinos',
  hotels:    'Hospedaje',
  hashtag:   'Hashtag / Social',
  message:   'Mensaje Final',
  colors:    'Color de textos',
};

function humanLabel(element: EditorElement): string {
  const { label, fieldPath, elementType } = element;
  // EditableText sets label = fieldPath — both are technical dot-paths, not human text.
  if (!label || label === fieldPath || /^[\w.[\]]+$/.test(label)) {
    return TYPE_LABELS[elementType] ?? 'Inspector';
  }
  return label;
}

interface InspectorManagerProps {
  selectedElement: EditorElement | null;
  invitationId: string;
  isMobileSheet?: boolean;
  onClear: () => void;
  onSaved?: (fieldPath?: string, value?: string) => void;
}

export function InspectorManager({
  selectedElement,
  invitationId,
  isMobileSheet = false,
  onClear,
  onSaved,
}: InspectorManagerProps) {
  const Inspector = selectedElement
    ? resolveInspector(selectedElement.elementType)
    : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 16px',
        borderBottom: '1px solid rgba(200,167,93,0.15)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#5C4A3E' }}>
          {selectedElement ? humanLabel(selectedElement) : 'Inspector'}
        </span>
        {selectedElement && (
          <button
            type="button"
            onClick={onClear}
            style={{ fontSize: 16, background: 'none', border: 'none', color: '#9B8878', cursor: 'pointer', padding: '0 4px', lineHeight: 1 }}
            title="Cerrar"
          >
            ×
          </button>
        )}
      </div>

      {/* Body */}
      <div style={{ padding: 16, flex: 1, overflowY: 'visible' }}>
        {!selectedElement ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, paddingTop: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 32, opacity: 0.35 }}>✦</div>
            <p style={{ fontSize: 12, color: '#9B8878', lineHeight: 1.6, maxWidth: 180 }}>
              Haz clic sobre cualquier texto de la invitación para editarlo
            </p>
          </div>
        ) : Inspector ? (
          <Inspector
            element={selectedElement}
            invitationId={invitationId}
            isMobileSheet={isMobileSheet}
            onCancel={onClear}
            onSaved={onSaved ?? ((_fp, _v) => {})}
          />
        ) : null}
      </div>
    </div>
  );
}
