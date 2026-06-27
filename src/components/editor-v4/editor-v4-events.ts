// ─── Editor V4 event types ────────────────────────────────────────────────────
// All messages flow from iframe → parent via window.parent.postMessage

export const EDITOR_V4_ELEMENT_SELECTED = 'EDITOR_V4_ELEMENT_SELECTED' as const;
export const EDITOR_V4_ELEMENT_DESELECTED = 'EDITOR_V4_ELEMENT_DESELECTED' as const;

export interface EditorV4ElementSelectedEvent {
  type: typeof EDITOR_V4_ELEMENT_SELECTED;
  elementType: 'text' | 'intro';
  fieldPath: string;
  label?: string;
  value?: string;
}

export interface EditorV4ElementDeselectedEvent {
  type: typeof EDITOR_V4_ELEMENT_DESELECTED;
}

export type EditorV4InboundEvent =
  | EditorV4ElementSelectedEvent
  | EditorV4ElementDeselectedEvent;

export function isEditorV4Event(data: unknown): data is EditorV4InboundEvent {
  return (
    typeof data === 'object' &&
    data !== null &&
    'type' in data &&
    (
      (data as { type: string }).type === EDITOR_V4_ELEMENT_SELECTED ||
      (data as { type: string }).type === EDITOR_V4_ELEMENT_DESELECTED
    )
  );
}

// Sections shown in the layers panel — order matches InvitationRenderer render order
export const INVITATION_SECTIONS = [
  { id: 'intro',        label: 'Intro Cinematográfico', icon: '🎬' },
  { id: 'hero',         label: 'Portada',           icon: '🖼' },
  { id: 'countdown',   label: 'Cuenta Regresiva',   icon: '⏳' },
  { id: 'parents',     label: 'Familias',            icon: '👨‍👩‍👧' },
  { id: 'story',       label: 'Historia',            icon: '📖' },
  { id: 'gallery',     label: 'Galería',             icon: '🖼' },
  { id: 'timeline',    label: 'Línea del Tiempo',    icon: '📅' },
  { id: 'itinerary',   label: 'Itinerario',          icon: '📋' },
  { id: 'location',    label: 'Ubicación',           icon: '📍' },
  { id: 'dresscode',   label: 'Código de Vestimenta',icon: '👔' },
  { id: 'gifts',       label: 'Mesa de Regalos',     icon: '🎁' },
  { id: 'padrinos',    label: 'Padrinos',            icon: '🌟' },
  { id: 'hotels',      label: 'Hospedaje',           icon: '🏨' },
  { id: 'hashtag',     label: 'Hashtag / Social',    icon: '#' },
  { id: 'message',     label: 'Mensaje Final',       icon: '💌' },
] as const;
