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
};

export const basicFeatures: InvitationFeatures = {
  ...disabledFeatures,
  showHero: true,
  showCountdown: true,
  showRSVP: true,
  showWhatsApp: true,
  showFinalMessage: true,
};

export const goldFeatures: InvitationFeatures = {
  ...basicFeatures,
  showMaps: true,
  showQRCode: true,
  showGallery: true,
  showMusic: true,
  showItinerary: true,
  showDressCode: true,
  showTimeline: true,
};

export const platinumFeatures: InvitationFeatures = {
  ...goldFeatures,
  showIntro: true,
  showStoryBook: true,
  showTimeline: true,
  showGiftRegistry: true,
  showParents: true,
  showPadrinos: true,
  showAccommodation: true,
  showHashtag: true,
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
