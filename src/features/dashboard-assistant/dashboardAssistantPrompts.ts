import type {
  DashboardAssistantEventType,
  DashboardAssistantPromptOption,
  DashboardAssistantPromptType,
} from './types';

export const DASHBOARD_ASSISTANT_PROMPT_OPTIONS: DashboardAssistantPromptOption[] = [
  {
    type: 'welcome_message',
    label: 'Mensaje de bienvenida',
    description: 'Un inicio elegante y cálido para abrir la invitación.',
  },
  {
    type: 'hero_phrase',
    label: 'Frase de portada',
    description: 'Frases breves, memorables y con tono premium.',
  },
  {
    type: 'love_story',
    label: 'Historia de amor',
    description: 'Un texto emotivo para StoryBook o historia principal.',
  },
  {
    type: 'final_message',
    label: 'Mensaje final',
    description: 'Cierre breve para agradecer a tus invitados.',
  },
  {
    type: 'rsvp_text',
    label: 'Confirmación de asistencia',
    description: 'Texto amable para pedir respuesta de asistencia.',
  },
  {
    type: 'dress_code',
    label: 'Dress Code',
    description: 'Copy claro y sofisticado para la etiqueta del evento.',
  },
  {
    type: 'gift_registry',
    label: 'Mesa de regalos',
    description: 'Mensaje discreto y agradecido para regalos.',
  },
  {
    type: 'parents_message',
    label: 'Padres',
    description: 'Texto formal para presentar a los padres.',
  },
  {
    type: 'padrinos_message',
    label: 'Padrinos',
    description: 'Texto respetuoso para presentar padrinos o testigos.',
  },
  {
    type: 'itinerary_text',
    label: 'Itinerario',
    description: 'Texto breve para explicar el programa del evento.',
  },
  {
    type: 'hotel_info',
    label: 'Hospedaje',
    description: 'Copy útil para hoteles o recomendaciones de estancia.',
  },
  {
    type: 'social_message',
    label: 'Redes sociales',
    description: 'Texto para invitar a compartir fotos o usar hashtag.',
  },
];

const EVENT_LABELS: Record<DashboardAssistantEventType, string> = {
  wedding: 'boda',
  xv: 'XV años',
  baptism: 'bautizo',
  baby_shower: 'baby shower',
  birthday: 'cumpleaños',
  unknown: 'evento familiar',
};

function eventLabel(eventType: DashboardAssistantEventType = 'wedding'): string {
  return EVENT_LABELS[eventType] ?? EVENT_LABELS.wedding;
}

export function buildDashboardAssistantPrompt(params: {
  promptType: DashboardAssistantPromptType;
  eventType?: DashboardAssistantEventType;
}): string {
  const event = eventLabel(params.eventType);
  const base =
    `Redacta para una invitación digital de ${event}. ` +
    'Usa español mexicano, tono elegante, sofisticado, cálido y fácil de copiar. ' +
    'No uses emojis. No pidas datos sensibles. No menciones herramientas internas.';

  switch (params.promptType) {
    case 'welcome_message':
      return `${base} Crea un mensaje de bienvenida breve para abrir la invitación.`;
    case 'hero_phrase':
      return `${base} Dame 3 frases cortas para la portada. Deben sonar memorables, sofisticadas y naturales.`;
    case 'love_story':
      return `${base} Escribe una historia breve y emotiva para la sección de historia. Que suene natural, romántica y no exagerada.`;
    case 'final_message':
      return `${base} Redacta un mensaje final para cerrar la invitación, agradeciendo la presencia de los invitados.`;
    case 'rsvp_text':
      return `${base} Redacta un texto claro y amable para pedir respuesta de asistencia. Debe sonar directo, elegante y fácil de entender.`;
    case 'dress_code':
      return `${base} Redacta un texto breve para explicar un dress code formal. Debe sonar claro y sofisticado.`;
    case 'gift_registry':
      return `${base} Redacta un texto discreto para la sección de mesa de regalos. Debe sonar agradecido, nunca exigente.`;
    case 'parents_message':
      return `${base} Redacta un texto formal y emotivo para presentar a los padres en la invitación.`;
    case 'padrinos_message':
      return `${base} Redacta un texto formal y respetuoso para presentar a padrinos, madrinas o testigos.`;
    case 'itinerary_text':
      return `${base} Redacta un texto introductorio breve para la sección de itinerario del evento.`;
    case 'hotel_info':
      return `${base} Redacta un texto útil y elegante para presentar opciones de hospedaje a los invitados.`;
    case 'social_message':
      return `${base} Redacta un texto breve para invitar a compartir fotos o usar el hashtag del evento en redes sociales.`;
    default:
      return `${base} Redacta un texto breve y elegante para la invitación.`;
  }
}
