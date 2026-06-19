export type PlanId = 'basic' | 'gold' | 'platinum';

export type InvitationFeatureKey =
  | 'showIntro'
  | 'showHero'
  | 'showCountdown'
  | 'showRSVP'
  | 'showWhatsApp'
  | 'showMaps'
  | 'showQRCode'
  | 'showGallery'
  | 'showMusic'
  | 'showItinerary'
  | 'showDressCode'
  | 'showGiftRegistry'
  | 'showStoryBook'
  | 'showTimeline'
  | 'showParents'
  | 'showPadrinos'
  | 'showAccommodation'
  | 'showHashtag'
  | 'showFinalMessage'
  | 'showGuestbook'
  | 'showMessages';

export type InvitationFeatures = Record<InvitationFeatureKey, boolean>;

export type FeatureOverrides = Partial<InvitationFeatures>;

export interface InvitationPlan {
  id: PlanId;
  name: string;
  description: string;
  features: InvitationFeatures;
}
