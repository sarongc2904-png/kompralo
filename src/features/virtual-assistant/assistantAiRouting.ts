const AI_KEYWORDS = [
  'redacta',
  'redactame',
  'escribe',
  'escribeme',
  'dame un texto',
  'dame una frase',
  'hazlo mas elegante',
  'hazlo más elegante',
  'hazlo mas emotivo',
  'hazlo más emotivo',
  'mejora este texto',
  'historia de amor',
  'votos',
  'mensaje para padres',
  'mensaje final',
  'discurso',
  'copy para invitacion',
  'copy para invitación',
];

const LOCAL_KEYWORDS = [
  'precio',
  'precios',
  'costo',
  'cuanto cuesta',
  'cuánto cuesta',
  'planes',
  'paquetes',
  'basic',
  'premium',
  'deluxe',
  'como funciona',
  'cómo funciona',
  'ya compre',
  'ya compré',
  'pague',
  'pagué',
  'login',
  'iniciar sesion',
  'iniciar sesión',
  'whatsapp',
  'rsvp',
  'confirmar asistencia',
  'donde entro',
  'dónde entro',
];

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

export function shouldUseAssistantAI(message: string): boolean {
  const normalized = normalize(message);

  if (!normalized) return false;
  if (LOCAL_KEYWORDS.some((keyword) => normalized.includes(normalize(keyword)))) {
    return false;
  }

  if (AI_KEYWORDS.some((keyword) => normalized.includes(normalize(keyword)))) {
    return true;
  }

  return normalized.length > 120;
}
