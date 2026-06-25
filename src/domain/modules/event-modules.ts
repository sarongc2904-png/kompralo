import type { PlanId } from '@/domain/plans/types';
import { normalizePlanId } from '@/domain/plans/types';

export type EventModuleId =
  | 'cover'
  | 'event_details'
  | 'location'
  | 'gallery'
  | 'story'
  | 'music'
  | 'dress_code'
  | 'itinerary'
  | 'gift_registry'
  | 'accommodation'
  | 'parents'
  | 'sponsors'
  | 'guests'
  | 'advanced_guests'
  | 'rsvp'
  | 'whatsapp'
  | 'qr'
  | 'check_in'
  | 'seating'
  | 'final_message'
  | 'advanced_customization'
  | 'settings';

export interface EventModuleDefinition {
  id: EventModuleId;
  title: string;
  icon: string;
  plans: PlanId[];
}

const ALL_PLANS: PlanId[] = ['basic', 'premium', 'deluxe'];
const PREMIUM_PLUS: PlanId[] = ['premium', 'deluxe'];
const DELUXE_ONLY: PlanId[] = ['deluxe'];

export const eventModules: EventModuleDefinition[] = [
  { id: 'cover',          title: 'Portada',          icon: '🖼️', plans: ALL_PLANS },
  { id: 'event_details',  title: 'Datos del evento', icon: '📝', plans: ALL_PLANS },
  { id: 'location',       title: 'Ubicación',        icon: '📍', plans: ALL_PLANS },
  { id: 'dress_code',     title: 'Dress Code',       icon: '👗', plans: ALL_PLANS },
  { id: 'itinerary',      title: 'Programa',         icon: '🗓️', plans: ALL_PLANS },
  { id: 'rsvp',           title: 'RSVP básico',      icon: '✉️', plans: ALL_PLANS },
  { id: 'whatsapp',       title: 'WhatsApp',         icon: '💬', plans: ALL_PLANS },
  { id: 'final_message',  title: 'Mensaje final',    icon: '💌', plans: ALL_PLANS },
  { id: 'settings',       title: 'Configuración',    icon: '⚙️', plans: ALL_PLANS },

  { id: 'gallery',        title: 'Galería',          icon: '📷', plans: PREMIUM_PLUS },
  { id: 'music',          title: 'Música',           icon: '🎵', plans: PREMIUM_PLUS },
  { id: 'story',          title: 'Historia',         icon: '📖', plans: PREMIUM_PLUS },
  { id: 'gift_registry',  title: 'Mesa de regalos',  icon: '🎁', plans: PREMIUM_PLUS },
  { id: 'advanced_customization', title: 'Personalización avanzada', icon: '✨', plans: PREMIUM_PLUS },

  { id: 'parents',        title: 'Padres',           icon: '👪', plans: DELUXE_ONLY },
  { id: 'sponsors',       title: 'Padrinos',         icon: '🤝', plans: DELUXE_ONLY },
  { id: 'accommodation',  title: 'Hospedaje',        icon: '🏨', plans: DELUXE_ONLY },
  { id: 'advanced_guests', title: 'Gestión avanzada de invitados', icon: '👥', plans: DELUXE_ONLY },
  { id: 'qr',             title: 'Pases QR',         icon: '▦',  plans: DELUXE_ONLY },
  { id: 'check_in',       title: 'Check-in',         icon: '✅', plans: DELUXE_ONLY },
  { id: 'seating',        title: 'Seating',          icon: '🪑', plans: DELUXE_ONLY },
];

export function getAvailableModules(planId?: string | null): EventModuleDefinition[] {
  const plan = normalizePlanId(planId);
  return eventModules.filter((module) => module.plans.includes(plan));
}

export function isModuleAvailable(moduleId: EventModuleId, planId?: string | null): boolean {
  return getAvailableModules(planId).some((module) => module.id === moduleId);
}
