/**
 * Fuente única de verdad de los datos de contacto de KOMPRALO en frontend.
 * El número oficial también existe como SUPPORT_WHATSAPP_NUMBER en Vercel;
 * buildWhatsAppHref la prefiere cuando está disponible (server components)
 * y cae a la constante publicada en componentes puramente estáticos/cliente.
 */

export const CONTACT = {
  whatsappDisplay: '867 245 3620',
  /** Formato wa.me: 52 + número, solo dígitos. */
  whatsappNumber: '528672453620',
  email: 'soporte@kompralo.com.mx',
  address:
    'Av. Independencia No. 1312, Sector Centro, C.P. 88000, Nuevo Laredo, Tamaulipas, México.',
  schedule: 'Lunes a sábado de 9:00 a.m. a 7:00 p.m.',
  responseTime: '10 minutos dentro de nuestro horario de atención',
} as const;

export const WHATSAPP_DEFAULT_MESSAGE =
  'Hola, quiero información sobre una invitación digital para mi boda.';

export function buildWhatsAppHref(message: string = WHATSAPP_DEFAULT_MESSAGE): string {
  const envNumber =
    typeof process !== 'undefined'
      ? process.env.SUPPORT_WHATSAPP_NUMBER?.replace(/\D/g, '')
      : undefined;
  const number = envNumber || CONTACT.whatsappNumber;
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export const MAILTO_HREF = `mailto:${CONTACT.email}`;
