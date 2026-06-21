import { plansById } from '@/domain/plans/registry';

export type {
  FeatureOverrides,
  InvitationFeatureKey,
  InvitationFeatures as FeatureGates,
  InvitationPlan,
  PlanId as PlanType,
} from '@/domain/plans/types';

export {
  availablePlans,
  defaultPlanId,
  getFeaturesForPlan,
  getPlanById,
  plansById,
} from '@/domain/plans/registry';

export { mergePlanFeatures } from '@/domain/plans/features';

export const planFeatures = {
  basic: plansById.basic.features,
  premium: plansById.premium.features,
  deluxe: plansById.deluxe.features,
};
