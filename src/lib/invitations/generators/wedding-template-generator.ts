import type { PlanId } from '@/domain/plans/types';
import type {
  InvitationProtagonist,
  InvitationHero,
  InvitationFinalMessage,
  InvitationGallery,
  ItineraryItem,
  InvitationDressCode,
  InvitationLocation,
  TimelineEvent,
  InvitationGiftRegistry,
  ParentCouple,
  Padrino,
  Hotel,
  SocialConfig,
} from '@/domain/invitations/types';
import type { WeddingStyle } from '@/domain/themes-v2/style-to-theme-map';

/**
 * Generated content for invitation_content table.
 * Omits columns not allowed by the plan.
 * Omits theme_id, rsvp_whatsapp_number, feature_overrides (handled separately).
 */
export interface GeneratedWeddingTemplateContent {
  protagonists?: InvitationProtagonist[];
  event_time?: string;
  hero?: InvitationHero;
  final_message?: InvitationFinalMessage;
  gallery?: InvitationGallery;
  itinerary?: ItineraryItem[];
  dress_code?: InvitationDressCode;
  location?: InvitationLocation;
  timeline?: TimelineEvent[];
  gift_registry?: InvitationGiftRegistry;
  parents?: ParentCouple[];
  padrinos?: Padrino[];
  hotels?: Hotel[];
  social?: SocialConfig;
}

export interface GenerateWeddingTemplateParams {
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime?: string;
  receptionTime?: string;
  selectedStyle?: WeddingStyle;
  planId: PlanId;
  existingContent?: Partial<GeneratedWeddingTemplateContent>;
}

// ─── Validation helpers ────────────────────────────────────────────────────────

/**
 * Check if a string is non-empty after trim.
 */
function isRealString(value: unknown): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Check if array has real elements (not just empty/placeholder).
 * For protagonists: check if name fields are filled.
 */
function hasRealProtagonists(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some((p: unknown) => {
    const protagonist = p as Record<string, unknown>;
    return isRealString(protagonist?.name);
  });
}

/**
 * Check if event_time has real content.
 */
function hasRealEventTime(value: unknown): boolean {
  return isRealString(value);
}

/**
 * Check if hero has real emotional phrase or other meaningful content.
 */
function hasRealHero(hero: unknown): boolean {
  if (hero && typeof hero === 'object') {
    const h = hero as Record<string, unknown>;
    return isRealString(h.emotionalPhrase) || isRealString(h.imageUrl);
  }
  return false;
}

/**
 * Check if final_message has real content.
 */
function hasRealFinalMessage(msg: unknown): boolean {
  if (msg && typeof msg === 'object') {
    const m = msg as Record<string, unknown>;
    return isRealString(m.quote) || isRealString(m.message) || isRealString(m.title);
  }
  return false;
}

/**
 * Check if gallery has real images.
 */
function hasRealGallery(gallery: unknown): boolean {
  if (gallery && typeof gallery === 'object') {
    const g = gallery as Record<string, unknown>;
    return Array.isArray(g.images) && g.images.length > 0;
  }
  return false;
}

/**
 * Check if itinerary has real items.
 */
function hasRealItinerary(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some((item: unknown) => {
    const i = item as Record<string, unknown>;
    return isRealString(i?.title) || isRealString(i?.description);
  });
}

/**
 * Check if dress_code has real content.
 */
function hasRealDressCode(dc: unknown): boolean {
  if (dc && typeof dc === 'object') {
    const d = dc as Record<string, unknown>;
    return isRealString(d.type) || isRealString(d.description) || isRealString(d.title);
  }
  return false;
}

/**
 * Check if location has real venue/address.
 */
function hasRealLocation(loc: unknown): boolean {
  if (loc && typeof loc === 'object') {
    const l = loc as Record<string, unknown>;
    return isRealString(l.venueName) || isRealString(l.address);
  }
  return false;
}

/**
 * Check if timeline has real events.
 */
function hasRealTimeline(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some((e: unknown) => {
    const event = e as Record<string, unknown>;
    return isRealString(event?.title) || isRealString(event?.year);
  });
}

/**
 * Check if gift_registry has real items.
 */
function hasRealGiftRegistry(reg: unknown): boolean {
  if (reg && typeof reg === 'object') {
    const r = reg as Record<string, unknown>;
    return Array.isArray(r.items) && r.items.length > 0;
  }
  return false;
}

/**
 * Check if parents array has real entries.
 */
function hasRealParents(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some((p: unknown) => {
    const parent = p as Record<string, unknown>;
    return isRealString(parent?.fatherName) || isRealString(parent?.motherName);
  });
}

/**
 * Check if padrinos array has real entries.
 */
function hasRealPadrinos(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some((p: unknown) => {
    const padrino = p as Record<string, unknown>;
    return (
      isRealString(padrino?.rubro) ||
      (Array.isArray(padrino?.names) && padrino.names.length > 0)
    );
  });
}

/**
 * Check if hotels array has real entries.
 */
function hasRealHotels(arr: unknown): boolean {
  if (!Array.isArray(arr) || arr.length === 0) return false;
  return arr.some((h: unknown) => {
    const hotel = h as Record<string, unknown>;
    return isRealString(hotel?.name) || isRealString(hotel?.address);
  });
}

/**
 * Check if social has real content.
 */
function hasRealSocial(social: unknown): boolean {
  if (social && typeof social === 'object') {
    const s = social as Record<string, unknown>;
    return isRealString(s.hashtag) || isRealString(s.instagramHandle);
  }
  return false;
}

// ─── Template generators by field ──────────────────────────────────────────────

/**
 * Generate protagonists from bride/groom names.
 * Always creates a 2-person array for wedding.
 */
function generateProtagonists(brideName: string, groomName: string): InvitationProtagonist[] {
  return [
    {
      id: 'bride',
      name: brideName.trim(),
      role: 'Novia',
    },
    {
      id: 'groom',
      name: groomName.trim(),
      role: 'Novio',
    },
  ];
}

/**
 * Clean and normalize event_time string.
 * Accepts "18:00", "6:00 PM", etc. Returns as-is if valid, empty string otherwise.
 */
function generateEventTime(weddingTime?: string): string {
  if (weddingTime && typeof weddingTime === 'string') {
    return weddingTime.trim();
  }
  return '';
}

/**
 * Generate hero section with emotional phrase and event label.
 */
function generateHero(): InvitationHero {
  return {
    emotionalPhrase:
      'Con mucha ilusión queremos compartir este día tan especial contigo.',
    imageUrl: '',
    eventLabel: 'Nos casamos',
  };
}

/**
 * Generate final message with title, quote, and signature.
 */
function generateFinalMessage(brideName: string, groomName: string): InvitationFinalMessage {
  return {
    title: 'Gracias por acompañarnos',
    quote:
      'Gracias por formar parte de nuestra historia. Nos hará muy felices compartir este día contigo.',
    signature: `${brideName.trim()} & ${groomName.trim()}`,
  };
}

/**
 * Generate gallery (empty for now — user will upload).
 */
function generateGallery(): InvitationGallery {
  return {
    images: [],
    captions: [],
  };
}

/**
 * Add hours to an HH:MM time string. Returns '' if no base time.
 */
function addHoursToTime(base: string, hours: number): string {
  if (!base) return '';
  const [h, m] = base.split(':').map(Number);
  const totalMinutes = (h || 0) * 60 + (m || 0) + hours * 60;
  const newH = Math.floor(totalMinutes / 60) % 24;
  const newM = totalMinutes % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
}

/**
 * Generate itinerary template with ceremony, reception, dinner, dance.
 * Uses provided times to populate each event.
 */
function generateItinerary(ceremonyTime?: string, receptionTime?: string): ItineraryItem[] {
  const recep = receptionTime || (ceremonyTime ? addHoursToTime(ceremonyTime, 2) : '');
  const dinner = ceremonyTime ? addHoursToTime(ceremonyTime, 3) : '';
  const dance = ceremonyTime ? addHoursToTime(ceremonyTime, 4) : '';

  return [
    {
      id: 'ceremony',
      time: ceremonyTime || '',
      title: 'Ceremonia',
      location: '',
      icon: 'church',
      description:
        'El momento especial donde nos uniremos frente a nuestros seres queridos.',
    },
    {
      id: 'reception',
      time: recep,
      title: 'Recepción',
      location: '',
      icon: 'glass',
      description:
        'Celebraremos este momento con las personas que más queremos.',
    },
    {
      id: 'dinner',
      time: dinner,
      title: 'Cena',
      location: '',
      icon: 'utensils',
      description:
        'Compartiremos una cena especial para celebrar juntos.',
    },
    {
      id: 'dance',
      time: dance,
      title: 'Baile',
      location: '',
      icon: 'music',
      description:
        'Después del brindis, comenzará la celebración.',
    },
  ];
}

/**
 * Generate dress code template.
 */
function generateDressCode(): InvitationDressCode {
  return {
    title: 'Código de vestimenta',
    type: 'Formal',
    description:
      'Te sugerimos asistir con atuendo formal para acompañarnos en esta celebración.',
    suggestions:
      'Elige colores y prendas que te hagan sentir cómodo y elegante.',
    suggestionsList: [],
  };
}

/**
 * Generate location template (empty venue/address).
 */
function generateLocation(): InvitationLocation {
  return {
    venueName: '',
    address: '',
    googleMapsLink: '',
    wazeLink: '',
  };
}

/**
 * Generate timeline (empty for deluxe).
 */
function generateTimeline(): TimelineEvent[] {
  return [];
}

/**
 * Generate gift registry (empty for deluxe).
 */
function generateGiftRegistry(): InvitationGiftRegistry {
  return {
    items: [],
  };
}

/**
 * Generate parents array (empty for deluxe).
 */
function generateParents(): ParentCouple[] {
  return [];
}

/**
 * Generate padrinos array (empty for deluxe).
 */
function generatePadrinos(): Padrino[] {
  return [];
}

/**
 * Generate hotels array (empty for deluxe).
 */
function generateHotels(): Hotel[] {
  return [];
}

/**
 * Normalize a name for hashtag: remove accents, spaces, special chars.
 */
function normalizeForHashtag(name: string): string {
  return name
    .trim()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '');
}

/**
 * Generate social config with hashtag from bride & groom names.
 */
function generateSocial(brideName?: string, groomName?: string): SocialConfig {
  const b = brideName ? normalizeForHashtag(brideName) : '';
  const g = groomName ? normalizeForHashtag(groomName) : '';
  const hashtag = b && g ? `#${b}Y${g}` : '';
  return { hashtag };
}

// ─── Main generator ────────────────────────────────────────────────────────────

/**
 * Generate wedding template content based on plan and existing content.
 *
 * Rules:
 * - If existingContent has real data in a field, preserve it
 * - If existingContent field is empty/[], generate template
 * - Only include fields allowed by planId
 * - Never include theme_id, rsvp_whatsapp_number, feature_overrides, music
 *
 * @param params — generation parameters
 * @returns generated content ready for invitation_content table
 */
export function generateWeddingTemplate(
  params: GenerateWeddingTemplateParams,
): GeneratedWeddingTemplateContent {
  const {
    brideName,
    groomName,
    weddingTime,
    receptionTime,
    planId,
    existingContent = {},
  } = params;

  const result: GeneratedWeddingTemplateContent = {};

  // ─── Core fields (available in all plans) ──────────────────────────────────

  // protagonists — basic
  if (
    hasRealProtagonists(existingContent.protagonists)
  ) {
    result.protagonists = existingContent.protagonists as InvitationProtagonist[];
  } else {
    result.protagonists = generateProtagonists(brideName, groomName);
  }

  // event_time — basic
  if (hasRealEventTime(existingContent.event_time)) {
    result.event_time = existingContent.event_time as string;
  } else {
    result.event_time = generateEventTime(weddingTime);
  }

  // hero — basic
  if (hasRealHero(existingContent.hero)) {
    result.hero = existingContent.hero as InvitationHero;
  } else {
    result.hero = generateHero();
  }

  // final_message — basic
  if (hasRealFinalMessage(existingContent.final_message)) {
    result.final_message = existingContent.final_message as InvitationFinalMessage;
  } else {
    result.final_message = generateFinalMessage(brideName, groomName);
  }

  // ─── Premium fields ────────────────────────────────────────────────────────

  if (planId === 'premium' || planId === 'deluxe') {
    // gallery — premium
    if (hasRealGallery(existingContent.gallery)) {
      result.gallery = existingContent.gallery as InvitationGallery;
    } else {
      result.gallery = generateGallery();
    }

    // itinerary — premium
    if (hasRealItinerary(existingContent.itinerary)) {
      result.itinerary = existingContent.itinerary as ItineraryItem[];
    } else {
      result.itinerary = generateItinerary(weddingTime, receptionTime);
    }

    // dress_code — premium
    if (hasRealDressCode(existingContent.dress_code)) {
      result.dress_code = existingContent.dress_code as InvitationDressCode;
    } else {
      result.dress_code = generateDressCode();
    }

    // location — premium
    if (hasRealLocation(existingContent.location)) {
      result.location = existingContent.location as InvitationLocation;
    } else {
      result.location = generateLocation();
    }
  }

  // ─── Deluxe fields ────────────────────────────────────────────────────────

  if (planId === 'deluxe') {
    // timeline — deluxe
    if (hasRealTimeline(existingContent.timeline)) {
      result.timeline = existingContent.timeline as TimelineEvent[];
    } else {
      result.timeline = generateTimeline();
    }

    // gift_registry — deluxe
    if (hasRealGiftRegistry(existingContent.gift_registry)) {
      result.gift_registry = existingContent.gift_registry as InvitationGiftRegistry;
    } else {
      result.gift_registry = generateGiftRegistry();
    }

    // parents — deluxe
    if (hasRealParents(existingContent.parents)) {
      result.parents = existingContent.parents as ParentCouple[];
    } else {
      result.parents = generateParents();
    }

    // padrinos — deluxe
    if (hasRealPadrinos(existingContent.padrinos)) {
      result.padrinos = existingContent.padrinos as Padrino[];
    } else {
      result.padrinos = generatePadrinos();
    }

    // hotels — deluxe
    if (hasRealHotels(existingContent.hotels)) {
      result.hotels = existingContent.hotels as Hotel[];
    } else {
      result.hotels = generateHotels();
    }
  }

  // social — premium+ (hashtag auto from names)
  if (planId === 'premium' || planId === 'deluxe') {
    if (hasRealSocial(existingContent.social)) {
      result.social = existingContent.social as SocialConfig;
    } else {
      result.social = generateSocial(brideName, groomName);
    }
  }

  return result;
}
