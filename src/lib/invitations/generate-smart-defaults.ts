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

export interface GeneratedDefaults {
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
  giftRegistry: {
    items: Array<{ id: string; store: string; name: string; url: string; note: string }>;
  };
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

  const {
    ceremonyType, civilAlreadyDone,
    ceremonyLocation, ceremonyTime,
    receptionLocation, receptionTime,
  } = input;

  if (ceremonyType === 'civil_e_iglesia') {
    items.push({
      id: uid(),
      time: ceremonyTime,
      title: 'Boda Civil',
      location: ceremonyLocation || 'Por confirmar',
      icon: 'rings' as ItineraryIcon,
    });
    // Religious ceremony 1h30 after civil (rough default)
    const [h, m] = ceremonyTime.split(':').map(Number);
    const religiousH = String(h + 1).padStart(2, '0');
    const religiousM = String(m + 30).padStart(2, '0');
    const religiousTime = `${religiousH}:${religiousM}`;
    items.push({
      id: uid(),
      time: religiousTime,
      title: 'Ceremonia Religiosa',
      location: 'Por confirmar',
      icon: 'church' as ItineraryIcon,
    });
  } else if (ceremonyType === 'solo_civil') {
    items.push({
      id: uid(),
      time: ceremonyTime,
      title: 'Boda Civil',
      location: ceremonyLocation || 'Por confirmar',
      icon: 'rings' as ItineraryIcon,
    });
  } else {
    // solo_religiosa
    if (!civilAlreadyDone) {
      items.push({
        id: uid(),
        time: ceremonyTime,
        title: 'Ceremonia Religiosa',
        location: ceremonyLocation || 'Por confirmar',
        icon: 'church' as ItineraryIcon,
      });
    } else {
      items.push({
        id: uid(),
        time: ceremonyTime,
        title: 'Ceremonia Religiosa',
        location: ceremonyLocation || 'Por confirmar',
        icon: 'church' as ItineraryIcon,
        description: 'Previamente unidos en matrimonio civil.',
      });
    }
  }

  items.push({
    id: uid(),
    time: receptionTime,
    title: 'Recepción',
    location: receptionLocation || 'Por confirmar',
    icon: 'glass' as ItineraryIcon,
  });

  return items;
}

function buildGiftRegistry(type: WizardMinimalInput['mesaRegalosType']): GeneratedDefaults['giftRegistry'] {
  if (type === 'ninguna') return { items: [] };

  const notes: Record<string, string> = {
    sobres:       'Tu presencia es el mejor regalo. Si deseas hacernos un obsequio, los sobres son bienvenidos.',
    transferencia:'Podemos compartirte los datos de transferencia en el evento.',
    link:         'Próximamente compartiremos el link de nuestra mesa de regalos.',
  };

  return {
    items: [{
      id:    uid(),
      store: type === 'sobres' ? 'Sobres' : type === 'transferencia' ? 'Transferencia' : 'Mesa de regalos',
      name:  type === 'sobres' ? 'Aportación' : type === 'transferencia' ? 'Datos bancarios' : 'Lista de deseos',
      url:   '',
      note:  notes[type] ?? '',
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

  const heroPhrase =
    ceremonyType === 'solo_civil'
      ? `${noviaName} & ${novioName} — Dos almas, un futuro`
      : `${noviaName} & ${novioName} — Dos almas, un destino`;

  const signature = `Con amor, ${noviaName} & ${novioName}`;

  let finalNote = '¡Nos alegra mucho que estés aquí y quieras compartir este momento especial con nosotros!';
  if (notasNinos === 'adultos') finalNote += '\n\nEste es un evento solo para adultos. Agradecemos tu comprensión.';
  if (civilAlreadyDone && ceremonyType === 'solo_religiosa') {
    finalNote = 'Después de unir nuestras vidas legalmente, llegó el momento de celebrar con quienes amamos. ' + finalNote;
  }

  return {
    protagonists,
    eventTime: input.ceremonyTime,
    location: {
      venueName:     input.receptionLocation || 'Por confirmar',
      address:       '',
      googleMapsLink:'',
      wazeLink:      '',
    },
    hero: {
      emotionalPhrase: heroPhrase,
      imageUrl: '',
      videoUrl: '',
      youtubeUrl: '',
      eventLabel: 'Boda',
    },
    itinerary: buildItinerary(input),
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
      quote:    'Y así, entre promesas y sueños, escribimos nuestro para siempre.',
      imageUrl: '',
      signature,
    },
    giftRegistry: buildGiftRegistry(input.mesaRegalosType),
    dressCode: {
      type:           'Formal',
      description:    'Formal / Cocktail',
      suggestions:    '',
      title:          'Código de vestimenta',
      observations:   notasNinos === 'adultos' ? 'Evento exclusivo para adultos.' : '',
      primaryColor:   colors.primary,
      secondaryColor: colors.secondary,
      suggestionsList:[],
      colors:         [colors.primary, colors.secondary],
    },
    themeId: STYLE_THEME[style],
  };
}

/**
 * Merges generated defaults with existing content.
 * Existing values are NEVER overwritten — only empty/null/undefined slots are filled.
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
