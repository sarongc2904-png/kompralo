export type PlanId = 'basic' | 'gold' | 'platinum' | 'premium' | 'deluxe';

/** Canonical 3-tier IDs used throughout the app. */
export type NormalizedPlanId = 'basic' | 'premium' | 'deluxe';

/**
 * Maps any legacy or current plan ID to one of the canonical three.
 * gold → premium  (legacy alias)
 * platinum → deluxe  (legacy alias)
 * Anything unknown defaults to premium (safe mid-tier).
 */
export function normalizePlanId(planId?: string | null): NormalizedPlanId {
  if (planId === 'gold' || planId === 'premium') return 'premium';
  if (planId === 'platinum' || planId === 'deluxe') return 'deluxe';
  if (planId === 'basic') return 'basic';
  return 'premium';
}

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
  | 'showMessages'
  | 'showVideo';

export type InvitationFeatures = Record<InvitationFeatureKey, boolean>;

export type FeatureOverrides = Partial<InvitationFeatures>;

export interface InvitationPlan {
  id: PlanId;
  name: string;
  description: string;
  features: InvitationFeatures;
}
