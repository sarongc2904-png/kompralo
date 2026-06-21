import type {
  AssistantLength,
  AssistantTone,
  DashboardAssistantEventType,
  DashboardAssistantPromptOption,
  InvitationAssistantContext,
} from './types';

// ─── Prompt catalog ───────────────────────────────────────────────────────────

export const ASSISTANT_CATEGORIES = [
  'Portada',
  'Mensaje de bienvenida',
  'Protagonistas',
  'Nuestra historia',
  'Galería',
  'Línea de tiempo',
  'Itinerario',
  'Ubicación',
  'Código de vestimenta',
  'Mesa de regalos',
  'Padrinos',
  'Hospedaje',
  'Redes y Hashtag',
  'RSVP',
  'Mensaje final',
] as const;

export type AssistantCategory = (typeof ASSISTANT_CATEGORIES)[number];

export const DASHBOARD_ASSISTANT_PROMPT_OPTIONS: DashboardAssistantPromptOption[] = [
  // ── Portada ────────────────────────────────────────────────────────────────
  { id: 'hero-elegant',   category: 'Portada', title: 'Frase elegante',       description: 'Sofisticada, memorable y premium.',              defaultTone: 'elegant'   },
  { id: 'hero-romantic',  category: 'Portada', title: 'Frase romántica',       description: 'Cálida, emotiva, ideal para bodas.',             defaultTone: 'romantic'  },
  { id: 'hero-brief',     category: 'Portada', title: 'Frase breve premium',   description: 'Impactante en pocas palabras.',                  defaultTone: 'brief'     },
  { id: 'hero-formal',    category: 'Portada', title: 'Frase formal',          description: 'Clásica y respetuosa.',                          defaultTone: 'formal'    },
  { id: 'hero-fun',       category: 'Portada', title: 'Frase divertida',       description: 'Fresca, moderna y casual.',                      defaultTone: 'fun'       },

  // ── Mensaje de bienvenida ─────────────────────────────────────────────────
  { id: 'welcome-elegant',   category: 'Mensaje de bienvenida', title: 'Bienvenida elegante',  description: 'Tono cálido y premium para abrir la invitación.', defaultTone: 'elegant'   },
  { id: 'welcome-emotional', category: 'Mensaje de bienvenida', title: 'Bienvenida emotiva',   description: 'Sentida, personal y cercana.',                    defaultTone: 'emotional' },
  { id: 'welcome-religious', category: 'Mensaje de bienvenida', title: 'Bienvenida religiosa', description: 'Con referencia espiritual o de fe.',              defaultTone: 'religious' },
  { id: 'welcome-modern',    category: 'Mensaje de bienvenida', title: 'Bienvenida moderna',   description: 'Directa y contemporánea.',                       defaultTone: 'modern'    },
  { id: 'welcome-brief',     category: 'Mensaje de bienvenida', title: 'Bienvenida breve',     description: 'Concisa y efectiva.',                            defaultTone: 'brief'     },

  // ── Protagonistas ─────────────────────────────────────────────────────────
  { id: 'prot-couple',   category: 'Protagonistas', title: 'Presentación de los novios',     description: 'Texto para presentar a la pareja.',          defaultTone: 'elegant'   },
  { id: 'prot-bride',    category: 'Protagonistas', title: 'Texto para la novia',            description: 'Descripción breve y emotiva.',               defaultTone: 'romantic'  },
  { id: 'prot-groom',    category: 'Protagonistas', title: 'Texto para el novio',            description: 'Descripción breve y cálida.',                defaultTone: 'elegant'   },
  { id: 'prot-main',     category: 'Protagonistas', title: 'Protagonista principal',         description: 'Para XV años, cumpleaños o bautizo.',        defaultTone: 'emotional' },
  { id: 'prot-family',   category: 'Protagonistas', title: 'Texto familiar',                 description: 'Apropiado para eventos de familia.',         defaultTone: 'formal'    },

  // ── Nuestra historia ──────────────────────────────────────────────────────
  { id: 'story-romantic',    category: 'Nuestra historia', title: 'Historia romántica completa',  description: 'Emotiva y detallada.',                     defaultTone: 'romantic'  },
  { id: 'story-brief',       category: 'Nuestra historia', title: 'Historia breve',               description: 'Compacta y bien construida.',              defaultTone: 'brief'     },
  { id: 'story-cinematic',   category: 'Nuestra historia', title: 'Historia cinematográfica',     description: 'Narrativa con ritmo y tensión.',           defaultTone: 'modern'    },
  { id: 'story-howwemetold', category: 'Nuestra historia', title: 'Cómo se conocieron',           description: 'Anclada en el primer encuentro.',          defaultTone: 'romantic'  },
  { id: 'story-elegant',     category: 'Nuestra historia', title: 'Historia con tono elegante',   description: 'Sofisticada y literaria.',                 defaultTone: 'elegant'   },
  { id: 'story-fun',         category: 'Nuestra historia', title: 'Historia divertida y natural', description: 'Con humor y autenticidad.',               defaultTone: 'fun'       },

  // ── Galería ───────────────────────────────────────────────────────────────
  { id: 'gallery-intro',     category: 'Galería', title: 'Texto introductorio',   description: 'Presenta la galería de fotos.',       defaultTone: 'elegant'   },
  { id: 'gallery-emotional', category: 'Galería', title: 'Texto emotivo',         description: 'Carga sentimental sobre los recuerdos.', defaultTone: 'emotional' },
  { id: 'gallery-brief',     category: 'Galería', title: 'Texto corto',           description: 'Breve, para no robar protagonismo.',  defaultTone: 'brief'     },
  { id: 'gallery-premium',   category: 'Galería', title: 'Texto premium/editorial', description: 'Estilo editorial y sofisticado.',   defaultTone: 'modern'    },

  // ── Línea de tiempo ───────────────────────────────────────────────────────
  { id: 'timeline-start',    category: 'Línea de tiempo', title: 'Cómo empezó',       description: 'El primer capítulo de la historia.',   defaultTone: 'romantic'  },
  { id: 'timeline-proposal', category: 'Línea de tiempo', title: 'La propuesta',      description: 'Texto para el momento de pedir matrimonio.', defaultTone: 'romantic' },
  { id: 'timeline-bigday',   category: 'Línea de tiempo', title: 'Nuestro gran día',  description: 'El evento principal como hito.',       defaultTone: 'elegant'   },
  { id: 'timeline-moment',   category: 'Línea de tiempo', title: 'Momentos clave',    description: 'Para eventos o fechas importantes.',   defaultTone: 'emotional' },

  // ── Itinerario ────────────────────────────────────────────────────────────
  { id: 'itinerary-formal',    category: 'Itinerario', title: 'Programa formal',          description: 'Para eventos con protocolo.',         defaultTone: 'formal'   },
  { id: 'itinerary-friendly',  category: 'Itinerario', title: 'Itinerario amigable',      description: 'Cálido y cercano.',                   defaultTone: 'modern'   },
  { id: 'itinerary-brief',     category: 'Itinerario', title: 'Horarios breves',          description: 'Directo al punto.',                   defaultTone: 'brief'    },
  { id: 'itinerary-elegant',   category: 'Itinerario', title: 'Texto para recepción',     description: 'Descripción elegante del evento.',    defaultTone: 'elegant'  },

  // ── Ubicación ─────────────────────────────────────────────────────────────
  { id: 'location-invite',     category: 'Ubicación', title: 'Invitar a llegar al lugar', description: 'Cálido y orientador.',                defaultTone: 'elegant'   },
  { id: 'location-formal',     category: 'Ubicación', title: 'Texto formal de ubicación', description: 'Preciso y protocolario.',             defaultTone: 'formal'    },
  { id: 'location-punctual',   category: 'Ubicación', title: 'Recomendación de puntualidad', description: 'Amable pero directa.',            defaultTone: 'modern'    },
  { id: 'location-brief',      category: 'Ubicación', title: 'Texto breve para mapas',    description: 'Para colocar junto a los botones.',   defaultTone: 'brief'     },

  // ── Código de vestimenta ─────────────────────────────────────────────────
  { id: 'dress-formal',      category: 'Código de vestimenta', title: 'Formal',                   description: 'Traje oscuro o vestido largo.',        defaultTone: 'formal'   },
  { id: 'dress-elegant',     category: 'Código de vestimenta', title: 'Elegante',                  description: 'Entre formal e informal.',             defaultTone: 'elegant'  },
  { id: 'dress-etiqueta',    category: 'Código de vestimenta', title: 'Etiqueta',                  description: 'El más estricto y sofisticado.',       defaultTone: 'formal'   },
  { id: 'dress-casual',      category: 'Código de vestimenta', title: 'Casual elegante',           description: 'Cómodo pero con estilo.',             defaultTone: 'modern'   },
  { id: 'dress-color',       category: 'Código de vestimenta', title: 'Color sugerido',            description: 'Guía el color de la paleta.',         defaultTone: 'elegant'  },
  { id: 'dress-reserved',    category: 'Código de vestimenta', title: 'Evitar colores reservados', description: 'Amable pero claro.',                 defaultTone: 'modern'   },

  // ── Mesa de regalos ───────────────────────────────────────────────────────
  { id: 'gift-elegant',     category: 'Mesa de regalos', title: 'Texto elegante',             description: 'Sofisticado y discreto.',               defaultTone: 'elegant'   },
  { id: 'gift-grateful',    category: 'Mesa de regalos', title: 'Texto agradecido',           description: 'Enfocado en el gesto, no en el objeto.', defaultTone: 'emotional' },
  { id: 'gift-discreet',    category: 'Mesa de regalos', title: 'Texto discreto',             description: 'Casi invisible, pero claro.',            defaultTone: 'brief'     },
  { id: 'gift-transfer',    category: 'Mesa de regalos', title: 'Para transferencia bancaria', description: 'Instrucciones sin ser tosco.',          defaultTone: 'modern'    },
  { id: 'gift-physical',    category: 'Mesa de regalos', title: 'Para regalos físicos',       description: 'Guía sobre dónde llevar regalos.',       defaultTone: 'formal'    },

  // ── Padrinos ──────────────────────────────────────────────────────────────
  { id: 'padrinos-present',    category: 'Padrinos', title: 'Presentación de padrinos',  description: 'Menciona su rol en el evento.',              defaultTone: 'formal'    },
  { id: 'padrinos-gratitude',  category: 'Padrinos', title: 'Agradecimiento',             description: 'Reconocimiento emotivo.',                   defaultTone: 'emotional' },
  { id: 'padrinos-formal',     category: 'Padrinos', title: 'Texto formal',               description: 'Protocolo y distinción.',                   defaultTone: 'formal'    },
  { id: 'padrinos-emotional',  category: 'Padrinos', title: 'Texto emotivo',              description: 'Más personal y cercano.',                   defaultTone: 'emotional' },

  // ── Hospedaje ─────────────────────────────────────────────────────────────
  { id: 'hotel-recommend',  category: 'Hospedaje', title: 'Recomendación de hospedaje', description: 'Introduce las opciones de hotel.',             defaultTone: 'elegant'  },
  { id: 'hotel-text',       category: 'Hospedaje', title: 'Texto para hotel sugerido',  description: 'Presenta un hotel con calidez.',               defaultTone: 'modern'   },
  { id: 'hotel-foraneos',   category: 'Hospedaje', title: 'Para invitados foráneos',    description: 'Información útil para quienes viajan.',        defaultTone: 'friendly' as AssistantTone },
  { id: 'hotel-brief',      category: 'Hospedaje', title: 'Instrucciones breves',       description: 'Directo y fácil de leer.',                    defaultTone: 'brief'    },

  // ── Redes y Hashtag ───────────────────────────────────────────────────────
  { id: 'social-share',    category: 'Redes y Hashtag', title: 'Invitar a compartir fotos', description: 'Entusiasta y social.',                    defaultTone: 'modern'   },
  { id: 'social-hashtag',  category: 'Redes y Hashtag', title: 'Texto para hashtag',        description: 'Instrucciones con estilo.',               defaultTone: 'fun'      },
  { id: 'social-modern',   category: 'Redes y Hashtag', title: 'Texto moderno',             description: 'Lenguaje contemporáneo y natural.',       defaultTone: 'modern'   },
  { id: 'social-elegant',  category: 'Redes y Hashtag', title: 'Texto elegante',            description: 'Redes con clase y discreción.',           defaultTone: 'elegant'  },

  // ── RSVP ──────────────────────────────────────────────────────────────────
  { id: 'rsvp-kind',       category: 'RSVP', title: 'Texto amable',                  description: 'Cálido y sin presión.',                         defaultTone: 'elegant'  },
  { id: 'rsvp-formal',     category: 'RSVP', title: 'Texto formal',                  description: 'Protocolo y claridad.',                         defaultTone: 'formal'   },
  { id: 'rsvp-urgent',     category: 'RSVP', title: 'Con fecha límite',              description: 'Pide confirmación con urgencia amable.',        defaultTone: 'modern'   },
  { id: 'rsvp-qr',         category: 'RSVP', title: 'Texto para pase QR',            description: 'Explica cómo usar el pase digital.',            defaultTone: 'modern'   },
  { id: 'rsvp-companions', category: 'RSVP', title: 'Confirmar acompañantes',        description: 'Pide indicar número de acompañantes.',          defaultTone: 'brief'    },

  // ── Mensaje final ─────────────────────────────────────────────────────────
  { id: 'final-elegant',   category: 'Mensaje final', title: 'Cierre elegante',      description: 'Sofisticado y memorable.',                      defaultTone: 'elegant'   },
  { id: 'final-emotional', category: 'Mensaje final', title: 'Cierre emotivo',       description: 'Sentido y cercano.',                            defaultTone: 'emotional' },
  { id: 'final-religious', category: 'Mensaje final', title: 'Cierre religioso',     description: 'Con bendición o referencia espiritual.',        defaultTone: 'religious' },
  { id: 'final-brief',     category: 'Mensaje final', title: 'Cierre breve',         description: 'Minimalista y efectivo.',                       defaultTone: 'brief'     },
  { id: 'final-gratitude', category: 'Mensaje final', title: 'Agradecimiento final', description: 'Cierra agradeciendo la presencia.',             defaultTone: 'emotional' },
  { id: 'final-whatsapp',  category: 'Mensaje final', title: 'Para WhatsApp',        description: 'Listo para enviar por mensaje directo.',        defaultTone: 'modern'    },
];

// ─── Event labels ─────────────────────────────────────────────────────────────

const EVENT_LABELS: Record<DashboardAssistantEventType, string> = {
  wedding:     'boda',
  xv:          'XV años',
  baptism:     'bautizo',
  baby_shower: 'baby shower',
  birthday:    'cumpleaños',
  unknown:     'evento familiar',
};

function eventLabel(eventType: DashboardAssistantEventType = 'wedding'): string {
  return EVENT_LABELS[eventType] ?? EVENT_LABELS.wedding;
}

const TONE_LABELS: Record<AssistantTone, string> = {
  elegant:   'elegante y sofisticado',
  romantic:  'romántico y emotivo',
  formal:    'formal y protocolario',
  emotional: 'emotivo y personal',
  modern:    'moderno y contemporáneo',
  religious: 'con tono espiritual o religioso',
  fun:       'divertido y natural',
  brief:     'muy breve y directo',
};

const LENGTH_INSTRUCTIONS: Record<AssistantLength, string> = {
  short:  'Máximo 2 oraciones.',
  medium: 'Entre 3 y 5 oraciones.',
  long:   'Hasta 7 oraciones, con riqueza narrativa.',
};

// ─── Context builder ──────────────────────────────────────────────────────────

function buildContextBlock(ctx: InvitationAssistantContext): string {
  const parts: string[] = [];
  const event = eventLabel(ctx.eventType);
  parts.push(`Tipo de evento: ${event}.`);

  if (ctx.title) parts.push(`Título del evento: ${ctx.title}.`);

  if (ctx.protagonists && ctx.protagonists.length > 0) {
    const names = ctx.protagonists.map((p) => (p.name ? (p.role ? `${p.name} (${p.role})` : p.name) : null)).filter(Boolean);
    if (names.length > 0) parts.push(`Protagonistas: ${names.join(' y ')}.`);
  }

  if (ctx.eventDate) parts.push(`Fecha: ${ctx.eventDate}.`);
  if (ctx.eventTime) parts.push(`Hora: ${ctx.eventTime}.`);
  if (ctx.venueName) parts.push(`Lugar: ${ctx.venueName}.`);
  if (ctx.address)   parts.push(`Dirección: ${ctx.address}.`);
  if (ctx.hashtag)   parts.push(`Hashtag oficial: ${ctx.hashtag}.`);
  if (ctx.dressCodeType) {
    const dc = ctx.dressCodeDescription ? `${ctx.dressCodeType} — ${ctx.dressCodeDescription}` : ctx.dressCodeType;
    parts.push(`Dress code: ${dc}.`);
  }

  return parts.join(' ');
}

// ─── Clean output ─────────────────────────────────────────────────────────────

export function cleanGeneratedText(text: string): string {
  return text
    .replace(/^(claro|por supuesto|con gusto)[,!]?\s*/i, '')
    .replace(/^aquí (tienes|te presento|te comparto)[\s\S]*?:\s*/i, '')
    .replace(/^te (propongo|presento|comparto)[\s\S]*?:\s*/i, '')
    .replace(/^(texto|frase|mensaje|sugerencia|opción)[\s\S]*?:\s*/i, '')
    .replace(/^este texto[\s\S]*?:\s*/i, '')
    .replace(/^["""«»]+|["""«»]+$/g, '')
    .trim();
}

// ─── Prompt builder ───────────────────────────────────────────────────────────

export function buildDashboardAssistantPrompt(params: {
  promptId: string;
  context: InvitationAssistantContext;
  tone?: AssistantTone;
  length?: AssistantLength;
}): string {
  const { promptId, context, tone, length } = params;
  const event = eventLabel(context.eventType);
  const option = DASHBOARD_ASSISTANT_PROMPT_OPTIONS.find((o) => o.id === promptId);
  const activeTone = tone ?? option?.defaultTone ?? 'elegant';
  const activeLength = length ?? 'medium';

  const ctxBlock = buildContextBlock(context);
  const toneInstruction = TONE_LABELS[activeTone] ?? TONE_LABELS.elegant;
  const lengthInstruction = LENGTH_INSTRUCTIONS[activeLength];

  const system =
    `Eres un redactor especialista en invitaciones digitales de ${event} en México. ` +
    `Redacta ÚNICAMENTE el texto final listo para insertar en la invitación. ` +
    `NO incluyas introducciones, explicaciones, encabezados, comillas, bullets ni markdown. ` +
    `NO empieces con "Claro", "Aquí tienes", "Por supuesto", "Te propongo" ni similares. ` +
    `Tono: ${toneInstruction}. ${lengthInstruction} ` +
    `Usa español mexicano natural. No uses emojis.`;

  const contextLine = ctxBlock ? `\n\nDatos del evento: ${ctxBlock}` : '';

  const instructions: Record<string, string> = {
    // Portada
    'hero-elegant':   `Escribe 3 frases cortas y elegantes para la portada de la invitación.${contextLine}`,
    'hero-romantic':  `Escribe 3 frases románticas y emotivas para la portada.${contextLine}`,
    'hero-brief':     `Escribe 1 frase muy breve e impactante para la portada.${contextLine}`,
    'hero-formal':    `Escribe una frase formal y clásica para la portada de la invitación.${contextLine}`,
    'hero-fun':       `Escribe una frase fresca y moderna para la portada.${contextLine}`,

    // Bienvenida
    'welcome-elegant':   `Redacta un mensaje de bienvenida elegante y cálido para abrir la invitación.${contextLine}`,
    'welcome-emotional': `Redacta un mensaje de bienvenida emotivo y personal para abrir la invitación.${contextLine}`,
    'welcome-religious': `Redacta un mensaje de bienvenida con tono espiritual para abrir la invitación.${contextLine}`,
    'welcome-modern':    `Redacta un mensaje de bienvenida moderno y directo para abrir la invitación.${contextLine}`,
    'welcome-brief':     `Redacta un mensaje de bienvenida breve y efectivo para la invitación.${contextLine}`,

    // Protagonistas
    'prot-couple':   `Redacta un texto para presentar a los protagonistas en la invitación.${contextLine}`,
    'prot-bride':    `Redacta un texto breve y emotivo para presentar a la novia.${contextLine}`,
    'prot-groom':    `Redacta un texto breve y cálido para presentar al novio.${contextLine}`,
    'prot-main':     `Redacta un texto para presentar al protagonista principal del evento.${contextLine}`,
    'prot-family':   `Redacta un texto familiar y cálido para presentar a los protagonistas.${contextLine}`,

    // Historia
    'story-romantic':    `Escribe una historia romántica y emotiva para la sección "Nuestra historia".${contextLine}`,
    'story-brief':       `Escribe una historia breve y bien construida para la sección de historia.${contextLine}`,
    'story-cinematic':   `Escribe una historia con ritmo cinematográfico para la sección de historia.${contextLine}`,
    'story-howwemetold': `Escribe una historia enfocada en cómo se conocieron los protagonistas.${contextLine}`,
    'story-elegant':     `Escribe una historia sofisticada y literaria para la sección "Nuestra historia".${contextLine}`,
    'story-fun':         `Escribe una historia divertida y natural para la sección de historia.${contextLine}`,

    // Galería
    'gallery-intro':     `Redacta un texto introductorio breve para la sección de galería de fotos.${contextLine}`,
    'gallery-emotional': `Redacta un texto emotivo para acompañar la galería de fotos.${contextLine}`,
    'gallery-brief':     `Redacta una frase muy breve para colocar antes de la galería.${contextLine}`,
    'gallery-premium':   `Redacta un texto de estilo editorial para la galería de fotos.${contextLine}`,

    // Línea de tiempo
    'timeline-start':    `Redacta un texto para el hito "cómo empezó" en la línea del tiempo.${contextLine}`,
    'timeline-proposal': `Redacta un texto emotivo para el momento de la propuesta de matrimonio.${contextLine}`,
    'timeline-bigday':   `Redacta un texto para presentar "nuestro gran día" en la línea del tiempo.${contextLine}`,
    'timeline-moment':   `Redacta un texto para un momento o fecha clave en la línea del tiempo.${contextLine}`,

    // Itinerario
    'itinerary-formal':   `Redacta un texto introductorio formal para el programa del evento.${contextLine}`,
    'itinerary-friendly': `Redacta un texto amigable y cálido para presentar el itinerario.${contextLine}`,
    'itinerary-brief':    `Redacta una línea breve para introducir el horario del evento.${contextLine}`,
    'itinerary-elegant':  `Redacta un texto elegante para la sección de itinerario o recepción.${contextLine}`,

    // Ubicación
    'location-invite':   `Redacta un texto cálido para invitar a los asistentes a llegar al lugar del evento.${contextLine}`,
    'location-formal':   `Redacta un texto formal y preciso sobre la ubicación del evento.${contextLine}`,
    'location-punctual': `Redacta un texto amable que recomiende llegar con puntualidad.${contextLine}`,
    'location-brief':    `Redacta una frase muy breve para colocar junto a los botones de mapa.${contextLine}`,

    // Dress code
    'dress-formal':   `Redacta un texto para explicar un dress code formal.${contextLine}`,
    'dress-elegant':  `Redacta un texto para explicar un dress code elegante (entre formal e informal).${contextLine}`,
    'dress-etiqueta': `Redacta un texto para un dress code de etiqueta estricta.${contextLine}`,
    'dress-casual':   `Redacta un texto para un dress code casual elegante.${contextLine}`,
    'dress-color':    `Redacta un texto para sugerir una paleta de colores en el vestir.${contextLine}`,
    'dress-reserved': `Redacta un texto amable para pedir no usar colores reservados (como blanco o rojo).${contextLine}`,

    // Mesa de regalos
    'gift-elegant':   `Redacta un texto elegante y discreto para la sección de mesa de regalos.${contextLine}`,
    'gift-grateful':  `Redacta un texto agradecido y emotivo para la sección de regalos.${contextLine}`,
    'gift-discreet':  `Redacta un texto muy discreto para mencionar la mesa de regalos.${contextLine}`,
    'gift-transfer':  `Redacta un texto amable para explicar cómo hacer una transferencia bancaria como regalo.${contextLine}`,
    'gift-physical':  `Redacta un texto breve para indicar cómo llevar regalos físicos al evento.${contextLine}`,

    // Padrinos
    'padrinos-present':   `Redacta un texto formal para presentar a los padrinos del evento.${contextLine}`,
    'padrinos-gratitude': `Redacta un texto emotivo para agradecer a los padrinos.${contextLine}`,
    'padrinos-formal':    `Redacta un texto protocolario para la sección de padrinos.${contextLine}`,
    'padrinos-emotional': `Redacta un texto personal y emotivo sobre los padrinos.${contextLine}`,

    // Hospedaje
    'hotel-recommend': `Redacta un texto elegante para presentar opciones de hospedaje a los invitados.${contextLine}`,
    'hotel-text':      `Redacta un texto cálido para presentar el hotel sugerido para el evento.${contextLine}`,
    'hotel-foraneos':  `Redacta un texto útil para invitados que viajan desde fuera de la ciudad.${contextLine}`,
    'hotel-brief':     `Redacta un texto breve con instrucciones de hospedaje para los invitados.${contextLine}`,

    // Redes
    'social-share':   `Redacta un texto para invitar a compartir fotos del evento en redes sociales.${contextLine}`,
    'social-hashtag': `Redacta un texto para presentar el hashtag oficial del evento.${contextLine}`,
    'social-modern':  `Redacta un texto moderno para la sección de redes sociales.${contextLine}`,
    'social-elegant': `Redacta un texto elegante para invitar a compartir momentos del evento.${contextLine}`,

    // RSVP
    'rsvp-kind':       `Redacta un texto amable para pedir confirmación de asistencia.${contextLine}`,
    'rsvp-formal':     `Redacta un texto formal para pedir confirmación de asistencia.${contextLine}`,
    'rsvp-urgent':     `Redacta un texto amable pero urgente que incluya una fecha límite para confirmar asistencia.${contextLine}`,
    'rsvp-qr':         `Redacta un texto para explicar cómo usar el pase QR digital de la invitación.${contextLine}`,
    'rsvp-companions': `Redacta un texto breve para pedir que los invitados confirmen el número de acompañantes.${contextLine}`,

    // Mensaje final
    'final-elegant':   `Redacta un cierre elegante para finalizar la invitación.${contextLine}`,
    'final-emotional': `Redacta un cierre emotivo y personal para finalizar la invitación.${contextLine}`,
    'final-religious': `Redacta un cierre con referencia espiritual o de bendición para la invitación.${contextLine}`,
    'final-brief':     `Redacta un cierre muy breve y minimalista para la invitación.${contextLine}`,
    'final-gratitude': `Redacta un cierre de agradecimiento por la presencia de los invitados.${contextLine}`,
    'final-whatsapp':  `Redacta un mensaje final breve y cálido, listo para compartir por WhatsApp.${contextLine}`,
  };

  const instruction = instructions[promptId] ?? `Redacta un texto breve para la invitación de ${event}.${contextLine}`;

  return `${system}\n\n${instruction}`;
}
