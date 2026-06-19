import { basicFeatures, goldFeatures, mergePlanFeatures, platinumFeatures } from '@/domain/plans/features';
import type { FeatureOverrides, InvitationFeatures, InvitationPlan, PlanId } from '@/domain/plans/types';

export const defaultPlanId: PlanId = 'platinum';

export const plansById: Record<PlanId, InvitationPlan> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'Core invitation with hero, countdown, RSVP, WhatsApp and final message.',
    features: basicFeatures,
  },
  gold: {
    id: 'gold',
    name: 'Gold',
    description: 'Basic invitation plus maps, QR, gallery, music, itinerary and dress code.',
    features: goldFeatures,
  },
  platinum: {
    id: 'platinum',
    name: 'Platinum',
    description: 'Complete premium invitation experience.',
    features: platinumFeatures,
  },
};

export function getPlanById(planId?: string | null): InvitationPlan {
  if (!planId) return plansById[defaultPlanId];
  return plansById[planId as PlanId] ?? plansById[defaultPlanId];
}

export function getFeaturesForPlan(
  planId?: string | null,
  overrides?: FeatureOverrides | null,
): InvitationFeatures {
  const plan = getPlanById(planId);
  return mergePlanFeatures(plan.features, overrides);
}

export const availablePlans = Object.values(plansById);
