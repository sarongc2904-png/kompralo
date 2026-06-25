import type { ItineraryItem, InvitationProtagonist, ItineraryIcon } from '@/domain/invitations/types';

export type CeremonyType = 'solo_civil' | 'civil_e_iglesia' | 'solo_religiosa';

export type WizardStyle = 'jardin_secreto' | 'cielo_nocturno' | 'arena_y_miel';

export interface WizardMinimalInput {
  novioName: string;
  noviaName: string;
  weddingDate: string; // ISO date YYYY-MM-DD
  style: WizardStyle;
  ceremonyType: CeremonyType;
  civilAlreadyDone: boolean;
  ceremonyLocation: string;
  ceremonyTime: string; // HH:MM
  receptionLocation: string;
  receptionTime: string; // HH:MM
  mesaRegalosType: 'sobres' | 'transferencia' | 'link' | 'ninguna';
  notasNinos: 'adultos' | 'bienvenidos' | null;
}

// Exact format the editor expects (matches GiftRegistryItem in types.ts)
interface GiftRegistryItem {
  id: string;
  provider: string;
  logoType: 'amazon' | 'liverpool' | 'palacio' | 'mercadolibre' | 'paypal' | 'bank' | 'custom';
  link?: string;
  description?: string;
  bankDetails?: { bankName: string; clabe: string; accountOwner: string };
}

interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export interface GeneratedDefaults {
  invitationTitle: string;
  protagonists: InvitationProtagonist[];
  eventTime: string;
  location: {
    venueName: string;
    address: string;
    googleMapsLink: string;
    wazeLink: string;
  };
  hero: {
    emotionalPhrase: string;
    imageUrl: string;
    videoUrl: string;
    youtubeUrl: string;
    eventLabel: string;
  };
  itinerary: ItineraryItem[];
  timeline: TimelineItem[];
  social: {
    hashtag: string;
    instagramHandle: string;
    tiktokHandle: string;
    facebookUrl: string;
    youtubeUrl: string;
    note: string;
  };
  finalMessage: {
    title: string;
    message: string;
    quote: string;
    imageUrl: string;
    signature: string;
  };
  giftRegistry: { items: GiftRegistryItem[] };
  dressCode: {
    type: string;
    description: string;
    suggestions: string;
    title: string;
    observations: string;
    primaryColor: string;
    secondaryColor: string;
    suggestionsList: string[];
    colors: string[];
  };
  themeId: string;
}

// Style → theme mapping
const STYLE_THEME: Record<WizardStyle, string> = {
  jardin_secreto: 'ivory-editorial',
  cielo_nocturno: 'modern-dark',
  arena_y_miel:   'luxury-gold',
};

// Style → dress code colors
const STYLE_COLORS: Record<WizardStyle, { primary: string; secondary: string }> = {
  jardin_secreto: { primary: '#2D5016', secondary: '#C9A84C' },
  cielo_nocturno: { primary: '#0D1B2A', secondary: '#A8B8C8' },
  arena_y_miel:   { primary: '#8B4513', secondary: '#D4AF7A' },
};

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase();
}

function buildHashtag(novioName: string, noviaName: string, date: string): string {
  const year = date.slice(0, 4);
  const n1 = noviaName.split(' ')[0].replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
  const n2 = novioName.split(' ')[0].replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ]/g, '');
  return `#${capitalize(n1)}Y${capitalize(n2)}${year}`;
}

function buildItinerary(input: WizardMinimalInput): ItineraryItem[] {
  const items: ItineraryItem[] = [];
  const { ceremonyType, civilAlreadyDone, ceremonyLocation, ceremonyTime, receptionLocation, receptionTime } = input;

  if (ceremonyType === 'civil_e_iglesia') {
    items.push({
      id: uid(), time: ceremonyTime,
      title: 'Boda Civil', location: ceremonyLocation || 'Por confirmar',
      icon: 'rings' as ItineraryIcon,
    });
    // Religious ceremony ~1h30 after civil as a rough default
    const [h, m] = ceremonyTime.split(':').map(Number);
    const rH = String(h + 1).padStart(2, '0');
    const rM = String(m + 30 < 60 ? m + 30 : (m + 30) - 60).padStart(2, '0');
    items.push({
      id: uid(), time: `${rH}:${rM}`,
      title: 'Ceremonia Religiosa', location: 'Por confirmar',
      icon: 'church' as ItineraryIcon,
    });
  } else if (ceremonyType === 'solo_civil') {
    items.push({
      id: uid(), time: ceremonyTime,
      title: 'Boda Civil', location: ceremonyLocation || 'Por confirmar',
      icon: 'rings' as ItineraryIcon,
    });
  } else {
    // solo_religiosa
    items.push({
      id: uid(), time: ceremonyTime,
      title: 'Ceremonia Religiosa', location: ceremonyLocation || 'Por confirmar',
      icon: 'church' as ItineraryIcon,
      ...(civilAlreadyDone ? { description: 'Previamente unidos en matrimonio civil.' } : {}),
    });
  }

  items.push({
    id: uid(), time: receptionTime,
    title: 'Recepción y Celebración', location: receptionLocation || 'Por confirmar',
    icon: 'glass' as ItineraryIcon,
  });

  return items;
}

function buildTimeline(weddingDate: string): TimelineItem[] {
  const weddingYear = Number(weddingDate.slice(0, 4)) || new Date().getFullYear();
  return [
    {
      id: uid(),
      year: String(weddingYear - 3),
      title: 'Nuestro primer encuentro',
      description: 'El día que el destino nos puso en el mismo camino y nuestra historia comenzó.',
    },
    {
      id: uid(),
      year: String(weddingYear - 2),
      title: 'Primer viaje juntos',
      description: 'Exploramos el mundo juntos y supimos que éramos el equipo perfecto.',
    },
    {
      id: uid(),
      year: String(weddingYear - 1),
      title: 'La propuesta',
      description: 'Un momento mágico e inolvidable donde decidimos unir nuestras vidas para siempre.',
    },
    {
      id: uid(),
      year: String(weddingYear),
      title: 'Nuestro gran día',
      description: '¡Hoy celebramos el inicio de nuestra nueva historia juntos!',
    },
  ];
}

function buildGiftRegistry(
  type: WizardMinimalInput['mesaRegalosType'],
  noviaName: string,
  novioName: string,
): GeneratedDefaults['giftRegistry'] {
  if (type === 'ninguna') return { items: [] };

  if (type === 'sobres') {
    return {
      items: [{
        id: uid(),
        provider: 'Sobre de regalo',
        logoType: 'custom',
        description: 'Tu presencia es el mejor regalo. Si deseas hacernos un obsequio, los sobres son bienvenidos durante la recepción.',
      }],
    };
  }

  if (type === 'transferencia') {
    return {
      items: [{
        id: uid(),
        provider: 'Transferencia bancaria',
        logoType: 'bank',
        description: 'Si deseas hacernos un regalo, con gusto compartimos nuestros datos en el evento.',
        bankDetails: {
          bankName:     '',
          clabe:        '',
          accountOwner: `${noviaName} & ${novioName}`,
        },
      }],
    };
  }

  // link
  return {
    items: [{
      id: uid(),
      provider: 'Mesa de regalos en línea',
      logoType: 'custom',
      link: '',
      description: 'Próximamente compartiremos el link de nuestra mesa de regalos.',
    }],
  };
}

export function generateSmartDefaults(input: WizardMinimalInput): GeneratedDefaults {
  const { novioName, noviaName, weddingDate, style, notasNinos, ceremonyType, civilAlreadyDone } = input;
  const colors = STYLE_COLORS[style];

  const protagonists: InvitationProtagonist[] = [
    { id: uid(), name: noviaName, role: 'Novia' },
    { id: uid(), name: novioName, role: 'Novio' },
  ];

  const heroPhrase = ceremonyType === 'solo_civil'
    ? 'Dos almas, un futuro'
    : 'Dos almas, un destino';

  const signature = `Con amor, ${noviaName} & ${novioName}`;

  let finalNote = '¡Nos alegra mucho que estés aquí y quieras compartir este momento especial con nosotros!';
  if (notasNinos === 'adultos') {
    finalNote += '\n\nEste es un evento solo para adultos. Agradecemos tu comprensión.';
  } else if (notasNinos === 'bienvenidos') {
    finalNote += '\n\n¡Los niños son bienvenidos a compartir este día especial con nosotros!';
  }
  if (civilAlreadyDone && ceremonyType === 'solo_religiosa') {
    finalNote = 'Después de unir nuestras vidas legalmente, llegó el momento de celebrar con quienes amamos. ' + finalNote;
  }

  const dressCodeObs = notasNinos === 'adultos' ? 'Evento exclusivo para adultos.' : '';

  return {
    invitationTitle: `Boda de ${noviaName} & ${novioName}`,
    protagonists,
    eventTime: input.ceremonyTime,
    location: {
      venueName:      input.receptionLocation || 'Por confirmar',
      address:        '',
      googleMapsLink: '',
      wazeLink:       '',
    },
    hero: {
      emotionalPhrase: heroPhrase,
      imageUrl:        '',
      videoUrl:        '',
      youtubeUrl:      '',
      eventLabel:      'Boda',
    },
    itinerary: buildItinerary(input),
    timeline:  buildTimeline(weddingDate),
    social: {
      hashtag:         buildHashtag(novioName, noviaName, weddingDate),
      instagramHandle: '',
      tiktokHandle:    '',
      facebookUrl:     '',
      youtubeUrl:      '',
      note:            '',
    },
    finalMessage: {
      title:    '¡Nos vemos pronto!',
      message:  finalNote,
      quote:    'Sin ti este día no estaría completo. Te esperamos con los brazos abiertos para celebrar el amor.',
      imageUrl: '',
      signature,
    },
    giftRegistry: buildGiftRegistry(input.mesaRegalosType, noviaName, novioName),
    dressCode: {
      type:            'Formal',
      description:     'Formal / Cocktail',
      suggestions:     'Agradecemos evitar tonos blancos e ivori.',
      title:           'Código de vestimenta',
      observations:    dressCodeObs,
      primaryColor:    colors.primary,
      secondaryColor:  colors.secondary,
      suggestionsList: ['Evitar tonos blancos e ivori'],
      colors:          [colors.primary, colors.secondary],
    },
    themeId: STYLE_THEME[style],
  };
}

/**
 * Merges generated defaults with existing content.
 * Existing values are NEVER overwritten — only empty/null/undefined slots are filled.
 * NOTE: only used for JSONB sub-objects, not for top-level invitation_content columns.
 */
export function mergeWithExisting<T extends Record<string, unknown>>(
  existing: T | null | undefined,
  generated: T,
): T {
  if (!existing) return generated;
  const result: Record<string, unknown> = { ...generated };
  for (const key of Object.keys(existing)) {
    const val = existing[key];
    if (val !== null && val !== undefined && val !== '' &&
        !(Array.isArray(val) && val.length === 0)) {
      result[key] = val;
    }
  }
  return result as T;
}
