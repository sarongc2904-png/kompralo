import type { FeatureDescriptor } from '@/domain/features/types';
import type { InvitationFeatures, PlanId } from '@/domain/plans/types';
import { getFeaturesForPlan } from '@/domain/plans/registry';

// =============================================================================
// FEATURE REGISTRY
// Central catalog of all features — active, coming soon, and hidden.
// Active features map 1:1 to InvitationFeatureKey via `planFeatureKey`.
// Coming-soon and hidden features are documented here for roadmap visibility.
// =============================================================================

export const featureRegistry: FeatureDescriptor[] = [

  // ── CORE ────────────────────────────────────────────────────────────────────

  {
    id: 'showIntro',
    label: 'Intro Cinemática',
    description: 'Pantalla de apertura con nombre(s) y corazón dorado antes de revelar la invitación.',
    category: 'core',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'sparkles',
    requiresPersistence: false,
    editableByCustomer: false,
    editableByAdmin: true,
    planFeatureKey: 'showIntro',
  },
  {
    id: 'showHero',
    label: 'Hero Principal',
    description: 'Sección de portada con imagen, frase emotiva y fecha del evento.',
    category: 'core',
    status: 'active',
    minimumPlan: 'basic',
    iconName: 'image',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showHero',
  },
  {
    id: 'showCountdown',
    label: 'Cuenta Regresiva',
    description: 'Reloj de cuenta regresiva hasta la fecha del evento. Muestra mensaje especial cuando el evento ha pasado.',
    category: 'core',
    status: 'active',
    minimumPlan: 'basic',
    iconName: 'clock',
    requiresPersistence: false,
    editableByCustomer: false,
    editableByAdmin: true,
    planFeatureKey: 'showCountdown',
  },
  {
    id: 'showFinalMessage',
    label: 'Mensaje Final',
    description: 'Cierre emocional de la invitación con cita personalizada e imagen.',
    category: 'core',
    status: 'active',
    minimumPlan: 'basic',
    iconName: 'heart',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showFinalMessage',
  },

  // ── ENGAGEMENT ───────────────────────────────────────────────────────────────

  {
    id: 'showRSVP',
    label: 'Confirmación de Asistencia (RSVP)',
    description: 'Formulario de confirmación conectado al endpoint /api/rsvp. Guarda asistencia, número de invitados y mensaje.',
    category: 'engagement',
    status: 'active',
    minimumPlan: 'basic',
    iconName: 'check-circle',
    requiresPersistence: true,
    editableByCustomer: false,
    editableByAdmin: true,
    planFeatureKey: 'showRSVP',
  },
  {
    id: 'showWhatsApp',
    label: 'Confirmación por WhatsApp',
    description: 'Botón secundario de confirmación que abre WhatsApp con mensaje pre-llenado.',
    category: 'engagement',
    status: 'active',
    minimumPlan: 'basic',
    iconName: 'message-circle',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showWhatsApp',
  },
  {
    id: 'showGuestbook',
    label: 'Libro de Visitas',
    description: 'Los invitados pueden dejar mensajes y felicitaciones. Visible en la invitación.',
    category: 'engagement',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'book-open',
    requiresPersistence: true,
    editableByCustomer: false,
    editableByAdmin: true,
    planFeatureKey: 'showGuestbook',
  },
  {
    id: 'showMessages',
    label: 'Mensajes Privados',
    description: 'Canal de mensajes privados entre el anfitrión y cada invitado.',
    category: 'engagement',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'inbox',
    requiresPersistence: true,
    editableByCustomer: false,
    editableByAdmin: true,
    planFeatureKey: 'showMessages',
  },
  {
    id: 'guestbook',
    label: 'Libro de Visitas Público',
    description: 'Muro público de mensajes con moderación del anfitrión.',
    category: 'engagement',
    status: 'comingSoon',
    minimumPlan: 'premium',
    iconName: 'users',
    requiresPersistence: true,
    editableByCustomer: false,
    editableByAdmin: true,
  },
  {
    id: 'videoMessage',
    label: 'Video Mensaje de los Anfitriones',
    description: 'Clip de video corto grabado por los anfitriones, embebido en la invitación.',
    category: 'engagement',
    status: 'comingSoon',
    minimumPlan: 'premium',
    iconName: 'video',
    requiresPersistence: true,
    editableByCustomer: true,
    editableByAdmin: true,
  },
  {
    id: 'liveStream',
    label: 'Transmisión en Vivo',
    description: 'Link a transmisión del evento para invitados que no puedan asistir en persona.',
    category: 'engagement',
    status: 'comingSoon',
    minimumPlan: 'deluxe',
    iconName: 'radio',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
  },
  {
    id: 'photoUpload',
    label: 'Subida de Fotos por Invitados',
    description: 'Los invitados pueden subir fotos del evento que se muestran en una galería compartida.',
    category: 'engagement',
    status: 'comingSoon',
    minimumPlan: 'deluxe',
    iconName: 'camera',
    requiresPersistence: true,
    editableByCustomer: false,
    editableByAdmin: true,
  },

  // ── MEDIA ─────────────────────────────────────────────────────────────────────

  {
    id: 'showGallery',
    label: 'Galería de Fotos',
    description: 'Carrusel horizontal de fotos de la pareja o protagonistas.',
    category: 'media',
    status: 'active',
    minimumPlan: 'premium',
    iconName: 'images',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showGallery',
  },
  {
    id: 'showMusic',
    label: 'Música de Fondo',
    description: 'Reproductor de audio con canción personalizada. Se activa al entrar a la invitación.',
    category: 'media',
    status: 'active',
    minimumPlan: 'premium',
    iconName: 'music',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showMusic',
  },
  {
    id: 'showVideo',
    label: 'Video de Portada',
    description: 'Video principal del evento integrado en la portada de la invitación.',
    category: 'media',
    status: 'active',
    minimumPlan: 'premium',
    iconName: 'video',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showVideo',
  },
  {
    id: 'showStoryBook',
    label: 'Historia de la Pareja',
    description: 'Carrusel de slides con la historia de los protagonistas: cómo se conocieron, momentos especiales.',
    category: 'media',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'book',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showStoryBook',
  },
  {
    id: 'spotifyPlaylist',
    label: 'Playlist de Spotify',
    description: 'Embed de una playlist de Spotify directamente en la invitación.',
    category: 'media',
    status: 'comingSoon',
    minimumPlan: 'premium',
    iconName: 'music-2',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
  },
  {
    id: 'youtubeEmbed',
    label: 'Video de YouTube',
    description: 'Embed de un video de YouTube (save the date, teaser, etc.).',
    category: 'media',
    status: 'comingSoon',
    minimumPlan: 'premium',
    iconName: 'play-circle',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
  },

  // ── SOCIAL ────────────────────────────────────────────────────────────────────

  {
    id: 'showHashtag',
    label: 'Hashtag del Evento',
    description: 'Muestra el hashtag personalizado e Instagram handle para que los invitados compartan fotos.',
    category: 'social',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'hash',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showHashtag',
  },

  // ── LOGISTICS ────────────────────────────────────────────────────────────────

  {
    id: 'showMaps',
    label: 'Ubicación y Mapas',
    description: 'Sección de venue con links a Google Maps y Waze.',
    category: 'logistics',
    status: 'active',
    minimumPlan: 'basic',
    iconName: 'map-pin',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showMaps',
  },
  {
    id: 'showQRCode',
    label: 'Código QR',
    description: 'QR de acceso rápido a la invitación. Útil para imprimir en papelería.',
    category: 'logistics',
    status: 'active',
    minimumPlan: 'premium',
    iconName: 'qr-code',
    requiresPersistence: false,
    editableByCustomer: false,
    editableByAdmin: true,
    planFeatureKey: 'showQRCode',
  },
  {
    id: 'showItinerary',
    label: 'Itinerario del Evento',
    description: 'Línea de tiempo con los momentos clave del día (ceremonia, coctel, cena, etc.).',
    category: 'logistics',
    status: 'active',
    minimumPlan: 'basic',
    iconName: 'list-ordered',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showItinerary',
  },
  {
    id: 'showAccommodation',
    label: 'Hospedaje',
    description: 'Lista de hoteles recomendados cercanos al venue con precios y links de reserva.',
    category: 'logistics',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'building',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showAccommodation',
  },
  {
    id: 'multipleLocations',
    label: 'Múltiples Venues',
    description: 'Soporte para eventos en dos ubicaciones (ceremonia + recepción en lugares distintos).',
    category: 'logistics',
    status: 'comingSoon',
    minimumPlan: 'premium',
    iconName: 'map',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
  },

  // ── CONTENT ───────────────────────────────────────────────────────────────────

  {
    id: 'showTimeline',
    label: 'Historia en Línea de Tiempo',
    description: 'Momentos clave de la relación ordenados cronológicamente (año por año).',
    category: 'content',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'git-branch',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showTimeline',
  },
  {
    id: 'showDressCode',
    label: 'Código de Vestimenta',
    description: 'Sección con el dress code del evento y sugerencias de colores.',
    category: 'content',
    status: 'active',
    minimumPlan: 'basic',
    iconName: 'shirt',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showDressCode',
  },
  {
    id: 'showGiftRegistry',
    label: 'Mesa de Regalos',
    description: 'Links a registros en Amazon, Liverpool u otras tiendas, y datos de transferencia bancaria.',
    category: 'content',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'gift',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showGiftRegistry',
  },
  {
    id: 'showParents',
    label: 'Padres de los Protagonistas',
    description: 'Sección con los nombres de los padres de los novios, padres del bebé, etc.',
    category: 'content',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'users',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showParents',
  },
  {
    id: 'showPadrinos',
    label: 'Padrinos',
    description: 'Lista de padrinos con su rubro e ícono (flores, pastel, música, etc.).',
    category: 'content',
    status: 'active',
    minimumPlan: 'deluxe',
    iconName: 'award',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
    planFeatureKey: 'showPadrinos',
  },

  // ── AI ────────────────────────────────────────────────────────────────────────

  {
    id: 'aiStoryGenerator',
    label: 'Generador de Historia con IA',
    description: 'La IA redacta la historia de los protagonistas a partir de preguntas guiadas.',
    category: 'ai',
    status: 'comingSoon',
    minimumPlan: 'deluxe',
    iconName: 'wand-2',
    requiresPersistence: false,
    editableByCustomer: true,
    editableByAdmin: true,
  },
];

// =============================================================================
// Lookups
// =============================================================================

export const featureRegistryById: Record<string, FeatureDescriptor> = Object.fromEntries(
  featureRegistry.map((f) => [f.id, f]),
);

export const activeFeatures = featureRegistry.filter((f) => f.status === 'active');
export const comingSoonFeatures = featureRegistry.filter((f) => f.status === 'comingSoon');

// =============================================================================
// getFeaturesForPlanFromRegistry
//
// Returns the same InvitationFeatures boolean map as the existing plans system,
// but derived from the registry's minimumPlan field + planFeatureKey.
// Behaviour is identical to getFeaturesForPlan() — this is additive, not a
// replacement. The existing plans system remains the source of truth.
// =============================================================================

const PLAN_RANK: Record<PlanId, number> = { basic: 1, premium: 2, deluxe: 3 };

function planIncludes(planId: PlanId, minimumPlan: PlanId): boolean {
  return (PLAN_RANK[planId] ?? 0) >= (PLAN_RANK[minimumPlan] ?? 99);
}

export function getFeaturesForPlanFromRegistry(planId: PlanId): InvitationFeatures {
  // Delegate to the existing system for the canonical result.
  // This function adds transparency: you can see *why* each flag is set.
  return getFeaturesForPlan(planId);
}

/**
 * Returns active features available on a given plan, enriched with registry metadata.
 * Useful for UI: feature catalog page, editor feature toggles, etc.
 */
export function getActiveFeaturesForPlan(planId: PlanId): FeatureDescriptor[] {
  return activeFeatures.filter(
    (f) => f.minimumPlan !== null && planIncludes(planId, f.minimumPlan),
  );
}

/**
 * Returns all coming-soon features regardless of plan (for roadmap display).
 */
export function getComingSoonFeatures(): FeatureDescriptor[] {
  return comingSoonFeatures;
}
