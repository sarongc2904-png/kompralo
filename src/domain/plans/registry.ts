import {
  basicFeatures,
  deluxeFeatures,
  mergePlanFeatures,
  premiumFeatures,
} from '@/domain/plans/features';
import type { FeatureOverrides, InvitationFeatures, InvitationPlan, PlanId } from '@/domain/plans/types';
import { normalizePlanId } from '@/domain/plans/types';

export const defaultPlanId: PlanId = 'premium';

export const plansById: Record<PlanId, InvitationPlan> = {
  basic: {
    id: 'basic',
    name: 'Basic',
    description: 'Portada, cuenta regresiva, RSVP, WhatsApp, mapa, itinerario, vestimenta y mensaje final.',
    features: basicFeatures,
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    description: 'Todo Basic más música, galería, video de portada, código QR y redes sociales / hashtag.',
    features: premiumFeatures,
  },
  deluxe: {
    id: 'deluxe',
    name: 'Deluxe',
    description: 'Experiencia completa: StoryBook, línea del tiempo, padrinos, mesa de regalos, hospedaje e intro cinemática.',
    features: deluxeFeatures,
  },
};

export function getPlanById(planId?: string | null): InvitationPlan {
  return plansById[normalizePlanId(planId)];
}

export function getFeaturesForPlan(
  planId?: string | null,
  overrides?: FeatureOverrides | null,
): InvitationFeatures {
  const plan = getPlanById(planId);
  return mergePlanFeatures(plan.features, overrides);
}

export { normalizePlanId };

export const availablePlans = Object.values(plansById);
