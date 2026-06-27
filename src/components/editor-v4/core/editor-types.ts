// ─── Core types for Editor V4 object registry ────────────────────────────────

export type EditorObjectType = 'text' | 'intro' | 'datetime' | 'hero';

/** Canonical element shape — shared between postMessage events and inspector props */
export interface EditorElement {
  elementType: EditorObjectType;
  fieldPath: string;
  label?: string;
  value?: string;
  meta?: Record<string, string>;
}

/** Unified props every registered inspector component must accept */
export interface InspectorProps {
  element: EditorElement;
  invitationId: string;
  isMobileSheet: boolean;
  onCancel: () => void;
  onSaved: () => void;
}

/** Invitation data passed at page-load so section inspectors can prefill fields */
export interface InvitationSnapshot {
  eventDate?: string;
  eventTime?: string;
  protagonist1Name?: string;
  protagonist2Name?: string;
  venueName?: string;
  emotionalPhrase?: string;
}
