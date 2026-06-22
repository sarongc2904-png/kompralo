import type { InvitationContent } from '@/domain/invitations/types';
import type { PlanId } from '@/domain/plans/types';

export interface CompletionScoreResult {
  /** Completion percentage 0–100 */
  percentage: number;
  /** True if missing critical data (show wizard) */
  isIncomplete: boolean;
  /** True if essentially empty (brand new) */
  isEmpty: boolean;
  /** List of missing critical fields */
  missing: string[];
}

/**
 * Check if a string is non-empty and meaningful.
 */
function isRealString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if array has meaningful content.
 */
function isRealArray(arr: unknown): boolean {
  return Array.isArray(arr) && arr.length > 0;
}

/**
 * Evaluate wedding invitation completion.
 * Focuses on critical fields required for a usable wedding invitation.
 *
 * Scoring:
 * - isIncomplete: true if any critical field missing
 * - isEmpty: true if < 20% filled
 * - percentage: completion based on filled critical + nice-to-have fields
 *
 * @param content — invitation content
 * @param planId — plan tier (determines which fields count)
 * @returns completion score result
 */
export function evaluateWeddingCompletion(
  content: Partial<InvitationContent>,
  planId: PlanId,
): CompletionScoreResult {
  const missing: string[] = [];
  let filledCount = 0;
  let totalCount = 0;

  // ─── Critical fields (all plans) ────────────────────────────────────────────

  // protagonists (novia + novio)
  totalCount++;
  const hasRealProtagonists =
    Array.isArray(content.protagonists) &&
    content.protagonists.length >= 2 &&
    isRealString(content.protagonists[0]?.name) &&
    isRealString(content.protagonists[1]?.name);
  if (hasRealProtagonists) {
    filledCount++;
  } else {
    missing.push('protagonists (names of bride & groom)');
  }

  // event_time
  totalCount++;
  if (isRealString(content.eventTime)) {
    filledCount++;
  } else {
    missing.push('event_time (wedding time)');
  }

  // hero (emotionalPhrase)
  totalCount++;
  const hasRealHeroPhrase = isRealString(content.hero?.emotionalPhrase);
  if (hasRealHeroPhrase) {
    filledCount++;
  } else {
    missing.push('hero.emotionalPhrase');
  }

  // final_message (quote or message)
  totalCount++;
  const hasRealFinalMsg =
    isRealString(content.finalMessage?.quote) ||
    isRealString(content.finalMessage?.message);
  if (hasRealFinalMsg) {
    filledCount++;
  } else {
    missing.push('final_message (quote or message)');
  }

  // ─── Nice-to-have fields (all plans) ────────────────────────────────────────

  // location (venue + address)
  totalCount++;
  const hasRealLocation =
    isRealString(content.location?.venueName) ||
    isRealString(content.location?.address);
  if (hasRealLocation) {
    filledCount++;
  } else {
    missing.push('location (venue name or address)');
  }

  // ─── Premium-specific fields ───────────────────────────────────────────────

  if (planId === 'premium' || planId === 'deluxe') {
    // gallery
    totalCount++;
    if (isRealArray(content.gallery?.images)) {
      filledCount++;
    } else {
      missing.push('gallery.images');
    }

    // itinerary
    totalCount++;
    if (
      isRealArray(content.itinerary) &&
      (content.itinerary || []).some((item) => isRealString(item?.title))
    ) {
      filledCount++;
    } else {
      missing.push('itinerary');
    }

    // dress_code
    totalCount++;
    const hasDressCode =
      isRealString(content.dressCode?.type) ||
      isRealString(content.dressCode?.description);
    if (hasDressCode) {
      filledCount++;
    } else {
      missing.push('dress_code');
    }
  }

  // ─── Deluxe-specific fields ────────────────────────────────────────────────

  if (planId === 'deluxe') {
    // timeline
    totalCount++;
    if (
      isRealArray(content.timeline) &&
      (content.timeline || []).some((e) => isRealString(e?.title))
    ) {
      filledCount++;
    } else {
      missing.push('timeline');
    }

    // gift_registry
    totalCount++;
    if (isRealArray(content.giftRegistry?.items)) {
      filledCount++;
    } else {
      missing.push('gift_registry.items');
    }

    // parents
    totalCount++;
    if (
      isRealArray(content.parents) &&
      (content.parents || []).some((p) => isRealString(p?.fatherName))
    ) {
      filledCount++;
    } else {
      missing.push('parents');
    }

    // padrinos
    totalCount++;
    if (
      isRealArray(content.padrinos) &&
      (content.padrinos || []).some((p) => isRealString(p?.rubro))
    ) {
      filledCount++;
    } else {
      missing.push('padrinos');
    }

    // hotels
    totalCount++;
    if (
      isRealArray(content.hotels) &&
      (content.hotels || []).some((h) => isRealString(h?.name))
    ) {
      filledCount++;
    } else {
      missing.push('hotels');
    }

    // social
    totalCount++;
    if (isRealString(content.social?.hashtag)) {
      filledCount++;
    } else {
      missing.push('social.hashtag');
    }
  }

  // ─── Calculate percentage and flags ────────────────────────────────────────

  const percentage = totalCount > 0 ? Math.round((filledCount / totalCount) * 100) : 0;

  // isIncomplete: true if any critical field is missing
  const isIncomplete = missing.length > 0;

  // isEmpty: true if < 20% filled
  const isEmpty = percentage < 20;

  return {
    percentage,
    isIncomplete,
    isEmpty,
    missing,
  };
}

/**
 * Convenience function to check if a wedding invitation should show the wizard.
 * Show wizard if: incomplete OR empty OR critical fields missing.
 *
 * @param content — invitation content
 * @param planId — plan tier
 * @returns true if wizard should be shown
 */
export function shouldShowWeddingWizard(
  content: Partial<InvitationContent>,
  planId: PlanId,
): boolean {
  const score = evaluateWeddingCompletion(content, planId);
  return score.isIncomplete || score.isEmpty;
}
