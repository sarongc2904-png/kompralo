import type { PlanId } from '@/domain/plans/types';

export interface WizardStep {
  id: string;
  title: string;
  shortTitle: string;
  plans: PlanId[];
}

export const WIZARD_STEPS: WizardStep[] = [
  { id: 'basics',        title: 'Datos del evento',    shortTitle: 'Datos',      plans: ['basic', 'premium', 'deluxe'] },
  { id: 'media',         title: 'Portada y multimedia', shortTitle: 'Portada',    plans: ['basic', 'premium', 'deluxe'] },
  { id: 'protagonists',  title: 'Protagonistas',        shortTitle: 'Personas',   plans: ['basic', 'premium', 'deluxe'] },
  { id: 'itinerary',     title: 'Itinerario',           shortTitle: 'Itinerario', plans: ['basic', 'premium', 'deluxe'] },
  { id: 'location',      title: 'Ubicación',            shortTitle: 'Ubicación',  plans: ['basic', 'premium', 'deluxe'] },
  { id: 'dresscode',     title: 'Código de vestimenta', shortTitle: 'Vestimenta', plans: ['basic', 'premium', 'deluxe'] },
  { id: 'gallery',       title: 'Galería de fotos',     shortTitle: 'Galería',    plans: ['premium', 'deluxe'] },
  { id: 'story',         title: 'Nuestra historia',     shortTitle: 'Historia',   plans: ['deluxe'] },
  { id: 'timeline',      title: 'Línea de tiempo',      shortTitle: 'Timeline',   plans: ['deluxe'] },
  { id: 'gifts',         title: 'Mesa de regalos',      shortTitle: 'Regalos',    plans: ['deluxe'] },
  { id: 'sponsors',      title: 'Padrinos y padres',    shortTitle: 'Padrinos',   plans: ['deluxe'] },
  { id: 'accommodation', title: 'Hospedaje',            shortTitle: 'Hospedaje',  plans: ['deluxe'] },
  { id: 'social',        title: 'Redes y hashtag',      shortTitle: 'Redes',      plans: ['premium', 'deluxe'] },
  { id: 'final',         title: 'Mensaje final',        shortTitle: 'Mensaje',    plans: ['basic', 'premium', 'deluxe'] },
  { id: 'theme',         title: 'Diseño y tema',        shortTitle: 'Tema',       plans: ['basic', 'premium', 'deluxe'] },
  { id: 'review',        title: 'Revisar y publicar',   shortTitle: 'Publicar',   plans: ['basic', 'premium', 'deluxe'] },
];

export function getStepsForPlan(planId: PlanId): WizardStep[] {
  return WIZARD_STEPS.filter((step) => step.plans.includes(planId));
}
