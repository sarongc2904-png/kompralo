import type { FeatureOverrides, InvitationFeatures } from '@/domain/plans/types';

export const disabledFeatures: InvitationFeatures = {
  showIntro: false,
  showHero: false,
  showCountdown: false,
  showRSVP: false,
  showWhatsApp: false,
  showMaps: false,
  showQRCode: false,
  showGallery: false,
  showMusic: false,
  showItinerary: false,
  showDressCode: false,
  showGiftRegistry: false,
  showStoryBook: false,
  showTimeline: false,
  showParents: false,
  showPadrinos: false,
  showAccommodation: false,
  showHashtag: false,
  showFinalMessage: false,
  showGuestbook: false,
  showMessages: false,
  showVideo: false,
};

export const basicFeatures: InvitationFeatures = {
  ...disabledFeatures,
  showHero:         true,
  showCountdown:    true,
  showRSVP:         true,
  showWhatsApp:     true,
  showMaps:         true,   // location / Google Maps link
  showItinerary:    true,   // basic event schedule
  showDressCode:    true,   // dress code / attire guide
  showFinalMessage: true,
};

export const goldFeatures: InvitationFeatures = {
  ...basicFeatures,
  // Core Gold
  showMaps: true,
  showQRCode: true,
  showGallery: true,
  showMusic: true,
  showVideo: true,
  showItinerary: true,
  showDressCode: true,
  // Advanced — all editor-visible sections render for Gold
  showTimeline: true,
  showStoryBook: true,
  showGiftRegistry: true,
  showParents: true,
  showPadrinos: true,
  showAccommodation: true,
  showHashtag: true,
};

export const platinumFeatures: InvitationFeatures = {
  ...goldFeatures,
  // Platinum-exclusive: cinematic intro, guestbook, messages
  showIntro: true,
  showGuestbook: true,
  showMessages: true,
};

export function mergePlanFeatures(
  planFeatures: InvitationFeatures,
  overrides?: FeatureOverrides | null,
): InvitationFeatures {
  return {
    ...planFeatures,
    ...(overrides ?? {}),
  };
}
