/** Canonical plan IDs. These are the only values that may be persisted. */
export type PlanId = 'basic' | 'premium' | 'deluxe';
export type LegacyPlanId = 'gold' | 'platinum';

/**
 * Maps any legacy or current plan ID to one of the canonical three.
 * gold → premium  (legacy alias)
 * platinum → deluxe  (legacy alias)
 * Anything unknown defaults to premium for read-time UI compatibility.
 * Payment ingestion must use resolvePurchasedPlanId() instead so unknown
 * purchases are logged and recovered safely.
 */
export function parsePlanId(planId?: string | null): PlanId | null {
  const value = planId?.trim().toLowerCase();
  if (value === 'gold' || value === 'premium') return 'premium';
  if (value === 'platinum' || value === 'deluxe') return 'deluxe';
  if (value === 'basic') return 'basic';
  return null;
}

export function normalizePlanId(planId?: string | null): PlanId {
  return parsePlanId(planId) ?? 'premium';
}

export function inferPlanIdFromAmount(amountTotal?: number | null): PlanId | null {
  if (amountTotal === 49900) return 'basic';
  if (amountTotal === 89900) return 'premium';
  if (amountTotal === 149900) return 'deluxe';
  return null;
}

export interface PurchasedPlanResolution {
  planId: PlanId;
  source: 'metadata' | 'amount_total' | 'safe_fallback';
  error: string | null;
}

/**
 * Resolves a canonical plan for a paid Stripe session.
 * Unknown purchases fall back to Basic so the payment is never discarded or
 * granted excessive permissions; the returned error must be logged/alerted.
 */
export function resolvePurchasedPlanId(
  metadataPlanId?: string | null,
  amountTotal?: number | null,
): PurchasedPlanResolution {
  const metadataPlan = parsePlanId(metadataPlanId);
  if (metadataPlan) {
    return { planId: metadataPlan, source: 'metadata', error: null };
  }

  const amountPlan = inferPlanIdFromAmount(amountTotal);
  if (amountPlan) {
    const reason = metadataPlanId
      ? `Unknown Stripe metadata plan "${metadataPlanId}"`
      : 'Stripe metadata plan is missing';
    return {
      planId: amountPlan,
      source: 'amount_total',
      error: `${reason}; inferred ${amountPlan} from amount_total=${amountTotal}.`,
    };
  }

  const metadataDescription = metadataPlanId
    ? `unknown metadata plan "${metadataPlanId}"`
    : 'missing metadata plan';
  return {
    planId: 'basic',
    source: 'safe_fallback',
    error: `Unresolved purchase plan (${metadataDescription}, amount_total=${amountTotal ?? 'null'}); preserving purchase as Basic for manual review.`,
  };
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
