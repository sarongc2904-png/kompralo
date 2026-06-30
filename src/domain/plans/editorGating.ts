import { WIZARD_STEPS } from '@/app/dashboard/invitations/[id]/edit/wizardSteps';
import { normalizePlanId } from '@/domain/plans/types';
import type { PlanId } from '@/domain/plans/types';

// Maps editor section IDs → wizard step IDs for plan-gated sections only.
// Ungated sections (hero, countdown, itinerary, location, dresscode, message) are not listed here.
const SECTION_TO_WIZARD_STEP: Record<string, string> = {
  parents:  'parents',       // deluxe only
  story:    'story',         // deluxe only
  gallery:  'gallery',       // premium + deluxe
  timeline: 'timeline',      // deluxe only
  gifts:    'gifts',         // deluxe only
  padrinos: 'sponsors',      // deluxe only
  hotels:   'accommodation', // deluxe only
  hashtag:  'social',        // premium + deluxe
};

export function canAccessEditorSection(planId: PlanId, sectionId: string): boolean {
  const wizardStepId = SECTION_TO_WIZARD_STEP[sectionId];
  if (!wizardStepId) return true;
  const step = WIZARD_STEPS.find((s) => s.id === wizardStepId);
  if (!step) return true;
  return step.plans.includes(planId);
}

export function canAccessTemplateSelector(planId: PlanId): boolean {
  return planId === 'deluxe';
}

export function resolvePlanForEditor(planIdStr?: string | null): PlanId {
  return normalizePlanId(planIdStr);
}
