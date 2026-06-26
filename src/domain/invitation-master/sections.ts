import type { EventModuleId } from '@/domain/modules';
import type { InvitationFeatureKey } from '@/domain/plans/types';

export type InvitationMasterSectionId =
  | 'cinematic_intro'
  | 'background_music'
  | 'hero'
  | 'countdown'
  | 'parents'
  | 'storybook'
  | 'gallery'
  | 'timeline'
  | 'itinerary'
  | 'location'
  | 'qr'
  | 'dress_code'
  | 'gift_registry'
  | 'padrinos'
  | 'accommodation'
  | 'hashtag'
  | 'rsvp'
  | 'whatsapp'
  | 'guestbook'
  | 'messages'
  | 'final_message';

export type InvitationMasterBackgroundGroup =
  | 'intro'
  | 'hero'
  | 'body'
  | 'floating';

export interface InvitationMasterSectionDefinition {
  id: InvitationMasterSectionId;
  featureKey: InvitationFeatureKey;
  moduleId: EventModuleId | null;
  backgroundGroup: InvitationMasterBackgroundGroup;
  editable: boolean;
  order: number;
}

/**
 * Passive registry for the Invitation Master.
 *
 * This documents the current render order in InvitationRenderer without
 * changing runtime behavior. Future phases can make the renderer and visual
 * editor consume this registry directly.
 */
export const invitationMasterSections = [
  {
    id: 'cinematic_intro',
    featureKey: 'showIntro',
    moduleId: null,
    backgroundGroup: 'intro',
    editable: false,
    order: 10,
  },
  {
    id: 'background_music',
    featureKey: 'showMusic',
    moduleId: 'music',
    backgroundGroup: 'floating',
    editable: true,
    order: 20,
  },
  {
    id: 'hero',
    featureKey: 'showHero',
    moduleId: 'cover',
    backgroundGroup: 'hero',
    editable: true,
    order: 30,
  },
  {
    id: 'countdown',
    featureKey: 'showCountdown',
    moduleId: 'event_details',
    backgroundGroup: 'body',
    editable: false,
    order: 40,
  },
  {
    id: 'parents',
    featureKey: 'showParents',
    moduleId: 'parents',
    backgroundGroup: 'body',
    editable: true,
    order: 50,
  },
  {
    id: 'storybook',
    featureKey: 'showStoryBook',
    moduleId: 'story',
    backgroundGroup: 'body',
    editable: true,
    order: 60,
  },
  {
    id: 'gallery',
    featureKey: 'showGallery',
    moduleId: 'gallery',
    backgroundGroup: 'body',
    editable: true,
    order: 70,
  },
  {
    id: 'timeline',
    featureKey: 'showTimeline',
    moduleId: 'story',
    backgroundGroup: 'body',
    editable: true,
    order: 80,
  },
  {
    id: 'itinerary',
    featureKey: 'showItinerary',
    moduleId: 'itinerary',
    backgroundGroup: 'body',
    editable: true,
    order: 90,
  },
  {
    id: 'location',
    featureKey: 'showMaps',
    moduleId: 'location',
    backgroundGroup: 'body',
    editable: true,
    order: 100,
  },
  {
    id: 'qr',
    featureKey: 'showQRCode',
    moduleId: 'qr',
    backgroundGroup: 'body',
    editable: false,
    order: 110,
  },
  {
    id: 'dress_code',
    featureKey: 'showDressCode',
    moduleId: 'dress_code',
    backgroundGroup: 'body',
    editable: true,
    order: 120,
  },
  {
    id: 'gift_registry',
    featureKey: 'showGiftRegistry',
    moduleId: 'gift_registry',
    backgroundGroup: 'body',
    editable: true,
    order: 130,
  },
  {
    id: 'padrinos',
    featureKey: 'showPadrinos',
    moduleId: 'sponsors',
    backgroundGroup: 'body',
    editable: true,
    order: 140,
  },
  {
    id: 'accommodation',
    featureKey: 'showAccommodation',
    moduleId: 'accommodation',
    backgroundGroup: 'body',
    editable: true,
    order: 150,
  },
  {
    id: 'hashtag',
    featureKey: 'showHashtag',
    moduleId: 'advanced_customization',
    backgroundGroup: 'body',
    editable: true,
    order: 160,
  },
  {
    id: 'rsvp',
    featureKey: 'showRSVP',
    moduleId: 'rsvp',
    backgroundGroup: 'body',
    editable: false,
    order: 170,
  },
  {
    id: 'whatsapp',
    featureKey: 'showWhatsApp',
    moduleId: 'whatsapp',
    backgroundGroup: 'body',
    editable: true,
    order: 180,
  },
  {
    id: 'guestbook',
    featureKey: 'showGuestbook',
    moduleId: null,
    backgroundGroup: 'body',
    editable: false,
    order: 190,
  },
  {
    id: 'messages',
    featureKey: 'showMessages',
    moduleId: null,
    backgroundGroup: 'body',
    editable: false,
    order: 200,
  },
  {
    id: 'final_message',
    featureKey: 'showFinalMessage',
    moduleId: 'final_message',
    backgroundGroup: 'body',
    editable: true,
    order: 210,
  },
] as const satisfies readonly InvitationMasterSectionDefinition[];

export function getInvitationMasterSections(): readonly InvitationMasterSectionDefinition[] {
  return invitationMasterSections;
}
