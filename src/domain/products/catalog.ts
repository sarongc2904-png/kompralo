import type { Product, ProductId } from './types';

export const productsById: Record<ProductId, Product> = {
  basic: {
    id:          'basic',
    name:        'Basic',
    description: 'Invitación digital esencial: portada, cuenta regresiva, RSVP y WhatsApp.',
    price:       49900, // $499.00 MXN in centavos
    currency:    'mxn',
    planId:      'basic',
    features: [
      'Portada con foto',
      'Cuenta regresiva',
      'RSVP integrado',
      'Botón WhatsApp',
      'Mensaje final',
    ],
  },
  premium: {
    id:          'premium',
    name:        'Premium',
    description: 'Todo Basic más galería, música, itinerario, código QR y mapas.',
    price:       89900, // $899.00 MXN in centavos
    currency:    'mxn',
    planId:      'gold',
    features: [
      'Todo lo de Basic',
      'Galería de fotos',
      'Música de fondo',
      'Itinerario del evento',
      'Código QR',
      'Google Maps + Waze',
    ],
  },
  deluxe: {
    id:          'deluxe',
    name:        'Deluxe',
    description: 'Experiencia completa: StoryBook animado, padrinos, hospedaje y más.',
    price:       149900, // $1,499.00 MXN in centavos
    currency:    'mxn',
    planId:      'platinum',
    features: [
      'Todo lo de Premium',
      'StoryBook animado',
      'Línea del tiempo',
      'Padrinos',
      'Hospedaje',
      'Código de vestimenta',
      'Mesa de regalos',
    ],
  },
};

export const availableProducts = Object.values(productsById);

export function getProductById(id: string): Product | null {
  return productsById[id as ProductId] ?? null;
}
