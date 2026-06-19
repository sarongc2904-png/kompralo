import type { AssistantPageContext, AssistantResponse } from './types';
import { EVENT_INVITATION_TEXTS } from './assistantKnowledgeBase';

// ─── Normalization ────────────────────────────────────────────────────────────

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip combining diacritical marks (U+0300-U+036F)
    .trim();
}

function has(text: string, ...keywords: string[]): boolean {
  // All keywords must already be normalized (no accents, lowercase).
  return keywords.some((k) => text.includes(k));
}

// ─── Common action sets ───────────────────────────────────────────────────────

const ACTION_VER_PRECIOS = { label: 'Ver precios', href: '/invitaciones/precios' } as const;
const ACTION_LOGIN       = { label: 'Iniciar sesión', href: '/login' } as const;
const ACTION_CLIENTE     = { label: 'Ver mis invitaciones', href: '/cliente' } as const;
const ACTION_RECOMMEND   = { label: '¿Qué plan me conviene?', action: 'recommend_plan' } as const;
const ACTION_HOW         = { label: '¿Cómo funciona?', action: 'how_it_works' } as const;
const ACTION_POST        = { label: 'Ya compré', action: 'post_purchase' } as const;

// ─── Intent resolver ──────────────────────────────────────────────────────────

export function getAssistantResponse(
  message: string,
  pageContext?: AssistantPageContext,
): AssistantResponse {
  void pageContext;
  const t = normalize(message);

  // ── H. Textos básicos ──────────────────────────────────────────────────────
  // Checked BEFORE pricing to avoid false matches with other intents.
  // All keywords below are pre-normalized (no accents, lowercase).
  if (has(t,
    'texto', 'redacta', 'ayudame a escribir', 'escribe', 'frase',
    'mensaje para', 'dame un mensaje', 'bienvenida', 'historia',
  )) {
    if (has(t, 'boda', 'casamiento', 'matrimonio')) {
      return {
        answer: `Claro, aquí tienes un texto elegante para boda:\n\n${EVENT_INVITATION_TEXTS.boda}`,
        suggestedActions: [ACTION_VER_PRECIOS],
      };
    }
    if (has(t, 'xv', 'quince', 'quinceanera', 'quinceanos')) {
      return {
        answer: `Claro, aquí tienes un texto para XV años:\n\n${EVENT_INVITATION_TEXTS.xv}`,
        suggestedActions: [ACTION_VER_PRECIOS],
      };
    }
    if (has(t, 'baby', 'shower', 'bebe', 'esperando')) {
      return {
        answer: `Claro, aquí tienes un texto para baby shower:\n\n${EVENT_INVITATION_TEXTS.babyShower}`,
        suggestedActions: [ACTION_VER_PRECIOS],
      };
    }
    if (has(t, 'bautizo', 'bautismo')) {
      return {
        answer: `Claro, aquí tienes un texto para bautizo:\n\n${EVENT_INVITATION_TEXTS.bautizo}`,
        suggestedActions: [ACTION_VER_PRECIOS],
      };
    }
    if (has(t, 'cumpleanos', 'birthday', 'fiesta')) {
      return {
        answer: `Claro, aquí tienes un texto para cumpleaños:\n\n${EVENT_INVITATION_TEXTS.cumpleanos}`,
        suggestedActions: [ACTION_VER_PRECIOS],
      };
    }
    return {
      answer:
        'Claro, puedo ayudarte a escribirlo. ¿Para qué evento necesitas el texto: boda, XV años, bautizo, baby shower o cumpleaños?',
      suggestedActions: [ACTION_VER_PRECIOS],
    };
  }

  // ── B. Recomendador de plan ────────────────────────────────────────────────
  if (has(t,
    'que plan me conviene', 'cual me recomiendas', 'cual elijo',
    'que paquete', 'recomiendame', 'recomienda', 'cual compro',
  )) {
    return {
      answer:
        'Depende del tipo de experiencia que quieras:\n\n' +
        'Basic — ideal si quieres algo simple, bonito y funcional.\n' +
        'Premium — si quieres más secciones y personalización.\n' +
        'Deluxe — si quieres la experiencia más completa, visual y premium.\n\n' +
        '¿Tu evento es boda, XV años, bautizo, baby shower o cumpleaños? Con eso te doy la mejor recomendación.',
      suggestedActions: [ACTION_VER_PRECIOS],
    };
  }

  // ── A. Precios ─────────────────────────────────────────────────────────────
  if (has(t,
    'precio', 'costo', 'cuanto cuesta', 'cuanta cuesta', 'cuestan',
    'planes', 'paquetes', 'basic', 'premium', 'deluxe', 'cuesta',
    'tarifa', 'valor', 'cuanto es', 'cuanto valen',
  )) {
    return {
      answer:
        'Tenemos 3 planes:\n\n' +
        'Basic — $499 MXN\nSencillo, elegante y completo para empezar.\n\n' +
        'Premium — $899 MXN\nMás secciones y mayor personalización.\n\n' +
        'Deluxe — $1499 MXN\nLa experiencia más visual y completa.\n\n' +
        'Pago único, sin mensualidades. Puedes ver los detalles en la página de precios.',
      suggestedActions: [ACTION_VER_PRECIOS],
    };
  }

  // ── C. Cómo funciona ───────────────────────────────────────────────────────
  if (has(t,
    'como funciona', 'proceso', 'pasos', 'como compro',
    'como se hace', 'que incluye', 'como accedo', 'como se usa',
  )) {
    return {
      answer:
        'Así de fácil:\n\n' +
        '1. Eliges el plan.\n' +
        '2. Pagas en línea con tarjeta.\n' +
        '3. Recibes un correo con tu acceso.\n' +
        '4. Haces clic en el enlace del correo para entrar.\n' +
        '5. Editas tu invitación: nombres, fecha, fotos y más.\n' +
        '6. Compartes el link por WhatsApp con tus invitados.',
      suggestedActions: [ACTION_VER_PRECIOS, ACTION_LOGIN],
    };
  }

  // ── D. Post-compra ─────────────────────────────────────────────────────────
  if (has(t,
    'ya compre', 'pague', 'hice el pago', 'realice el pago',
    'no encuentro mi invitacion', 'no me llego', 'no recibo',
    'donde esta mi invitacion', 'que sigue', 'correo no llego',
    'no llego correo', 'no he recibido',
  )) {
    return {
      answer:
        'Revisa el correo con el que pagaste. Ahí recibes el enlace de acceso.\n\n' +
        'Si no aparece en bandeja principal, revisa spam o la carpeta de promociones.\n\n' +
        'Desde ahí entras directamente a editar tu invitación.',
      suggestedActions: [ACTION_LOGIN, ACTION_CLIENTE],
    };
  }

  // ── E. Edición ─────────────────────────────────────────────────────────────
  if (has(t,
    'editar', 'edito', 'edicion', 'como edito', 'cambiar nombre',
    'cambiar fecha', 'cambiar ubicacion', 'subir foto', 'cambiar foto',
    'modificar invitacion', 'dashboard', 'personalizar', 'actualizar',
  )) {
    return {
      answer:
        'Desde el editor puedes personalizar tu invitación completa:\n\n' +
        'Nombres · Fecha · Lugar · Fotos · Galería · Itinerario\n' +
        'Dress code · Mesa de regalos · Hospedaje · Padrinos · Mensaje final\n\n' +
        'Los cambios se guardan al instante y puedes revisar la vista previa antes de compartir.',
      suggestedActions: [ACTION_LOGIN, ACTION_CLIENTE],
    };
  }

  // ── F. WhatsApp / Compartir ────────────────────────────────────────────────
  if (has(t,
    'whatsapp', 'whats', 'compartir', 'mandar a invitados',
    'enviar a invitados', 'link de la invitacion', 'compartir link',
    'como mando', 'como envio',
  )) {
    return {
      answer:
        'Sí, tu invitación se comparte con un link. Lo copias y lo mandas por WhatsApp — tus invitados lo abren en su celular sin descargar nada.\n\n' +
        'También puedes mandarlo por correo, Instagram o cualquier medio que uses.',
      suggestedActions: [ACTION_VER_PRECIOS],
    };
  }

  // ── G. RSVP / Confirmación ────────────────────────────────────────────────
  if (has(t,
    'rsvp', 'confirmacion', 'confirmar asistencia', 'asistencia',
    'invitados responden', 'quien asiste', 'confirmados', 'confirmen',
  )) {
    return {
      answer:
        'Sí. Tus invitados pueden confirmar su asistencia directamente desde el enlace de la invitación.\n\n' +
        'Ves las respuestas en tu dashboard y tienes control de quién confirmó.',
      suggestedActions: [ACTION_VER_PRECIOS],
    };
  }

  // ── I. Fallback ────────────────────────────────────────────────────────────
  return {
    answer:
      'Hola, soy el asistente de KOMPRALO. Puedo ayudarte con:\n\n' +
      '• Precios y planes\n' +
      '• Cómo funciona\n' +
      '• Dudas después de comprar\n' +
      '• Textos para tu invitación\n\n' +
      '¿Qué necesitas?',
    suggestedActions: [ACTION_VER_PRECIOS, ACTION_RECOMMEND, ACTION_HOW, ACTION_POST],
  };
}

// ─── Action key → display message (used by quick action buttons) ──────────────

export const ACTION_MESSAGES: Record<string, string> = {
  recommend_plan: '¿Qué plan me conviene?',
  how_it_works:   '¿Cómo funciona?',
  post_purchase:  'Ya compré, ¿qué sigue?',
};
