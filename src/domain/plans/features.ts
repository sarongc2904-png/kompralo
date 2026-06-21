import type { FeatureOverrides, InvitationFeatures } from '@/domain/plans/types';

export const disabledFeatures: InvitationFeatures = {
  showIntro:         false,
  showHero:          false,
  showCountdown:     false,
  showRSVP:          false,
  showWhatsApp:      false,
  showMaps:          false,
  showQRCode:        false,
  showGallery:       false,
  showMusic:         false,
  showItinerary:     false,
  showDressCode:     false,
  showGiftRegistry:  false,
  showStoryBook:     false,
  showTimeline:      false,
  showParents:       false,
  showPadrinos:      false,
  showAccommodation: false,
  showHashtag:       false,
  showFinalMessage:  false,
  showGuestbook:     false,
  showMessages:      false,
  showVideo:         false,
};

// ─── Basic ────────────────────────────────────────────────────────────────────

export const basicFeatures: InvitationFeatures = {
  ...disabledFeatures,
  showHero:         true,
  showCountdown:    true,
  showRSVP:         true,
  showWhatsApp:     true,
  showMaps:         true,
  showItinerary:    true,
  showDressCode:    true,
  showFinalMessage: true,
};

// ─── Premium ──────────────────────────────────────────────────────────────────

export const premiumFeatures: InvitationFeatures = {
  ...basicFeatures,
  showMusic:   true,
  showGallery: true,
  showVideo:   true,
  showQRCode:  true,
  showParents: true,
};

// ─── Deluxe ───────────────────────────────────────────────────────────────────

export const deluxeFeatures: InvitationFeatures = {
  ...premiumFeatures,
  showStoryBook:     true,
  showTimeline:      true,
  showPadrinos:      true,
  showGiftRegistry:  true,
  showAccommodation: true,
  showHashtag:       true,
  showIntro:         true,
  showGuestbook:     true,
  showMessages:      true,
};

// ─── Legacy aliases ───────────────────────────────────────────────────────────


// ─── Merge helper ─────────────────────────────────────────────────────────────

export function mergePlanFeatures(
  planFeatures: InvitationFeatures,
  overrides?: FeatureOverrides | null,
): InvitationFeatures {
  return {
    ...planFeatures,
    ...(overrides ?? {}),
  };
}
