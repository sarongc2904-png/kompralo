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
  showHashtag: true,
};

// ─── Deluxe ───────────────────────────────────────────────────────────────────

export const deluxeFeatures: InvitationFeatures = {
  ...premiumFeatures,
  showStoryBook:     true,
  showTimeline:      true,
  showPadrinos:      true,
  showGiftRegistry:  true,
  showAccommodation: true,
  showParents:       true,
  showIntro:         true,
  showGuestbook:     true,
  showMessages:      true,
};

// ─── Legacy aliases ───────────────────────────────────────────────────────────


// ─── Merge helper ─────────────────────────────────────────────────────────────

// Keys that customers cannot override — only admin toggles via FeaturesForm should
// affect these. Stripping them here prevents stale DB overrides from hiding features.
const ADMIN_ONLY_FEATURE_KEYS: ReadonlySet<keyof InvitationFeatures> = new Set([
  'showIntro',
  'showCountdown',
  'showRSVP',
  'showQRCode',
  'showGuestbook',
  'showMessages',
]);

export function mergePlanFeatures(
  planFeatures: InvitationFeatures,
  overrides?: FeatureOverrides | null,
): InvitationFeatures {
  if (!overrides) return { ...planFeatures };
  const safeOverrides = Object.fromEntries(
    Object.entries(overrides).filter(([k]) => !ADMIN_ONLY_FEATURE_KEYS.has(k as keyof InvitationFeatures)),
  ) as FeatureOverrides;
  return {
    ...planFeatures,
    ...safeOverrides,
  };
}
