// ─── Core types for Editor V4 object registry ────────────────────────────────

export type EditorObjectType =
  | 'text' | 'intro' | 'datetime' | 'hero'
  | 'countdown' | 'parents' | 'story' | 'gallery'
  | 'timeline' | 'itinerary' | 'location' | 'dresscode'
  | 'gifts' | 'padrinos' | 'hotels' | 'hashtag' | 'message';

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
  /**
   * Called after a successful save.
   * - Text fields: pass (fieldPath, value) so the shell can push the change
   *   directly into the iframe without a full reload.
   * - Structural fields (datetime, hero images, …): call with no args to
   *   signal that the shell should do a full iframe refresh.
   */
  onSaved: (fieldPath?: string, value?: string) => void;
}

/** Invitation data passed at page-load so section inspectors can prefill fields */
export interface InvitationSnapshot {
  eventDate?: string;
  eventTime?: string;
  protagonist1Name?: string;
  protagonist2Name?: string;
  venueName?: string;
  emotionalPhrase?: string;
  // Media fields — needed so HeroInspector can preserve other media when saving one field
  slug?: string;
  imageUrl?: string;
  videoUrl?: string;
  youtubeUrl?: string;
  musicUrl?: string;
  musicTitle?: string;
  googleMapsLink?: string;
  wazeLink?: string;
  // Additional hero text
  eventLabel?: string;
  connectorText?: string;
  // Plan and media selection state
  planId?: string;
  selectedVideoId?: string;
  storySectionTitle?: string;
  storySectionEyebrow?: string;
  storySlidesJson?: string;
  galleryImages?: string[];
  dressCodeJson?: string;
  finalMessageJson?: string;
  parentsJson?: string;
  padrinosJson?: string;
  hotelsJson?: string;
  itineraryJson?: string;
  timelineJson?: string;
  giftRegistryJson?: string;
  hiddenSections?: string[];
}
