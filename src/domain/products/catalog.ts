import type { Product, ProductId } from './types';
import { parsePlanId } from '@/domain/plans/types';

export const productsById: Record<ProductId, Product> = {
  basic: {
    id:          'basic',
    name:        'Basic',
    description: 'Para quien quiere una invitación elegante, clara y fácil de compartir.',
    price:       49900, // $499.00 MXN in centavos
    currency:    'mxn',
    planId:      'basic',
    features: [
      'Portada con foto',
      'Cuenta regresiva',
      'RSVP integrado',
      'Botón WhatsApp',
      'Mapa y ubicación',
      'Itinerario del evento',
      'Código de vestimenta',
      'Mensaje final',
    ],
  },
  gold: {
    id:          'gold',
    name:        'Premium',
    description: 'Para quien quiere organizar mejor su evento con galería, música e historia.',
    price:       89900, // $899.00 MXN in centavos
    currency:    'mxn',
    planId:      'gold',
    features: [
      'Todo lo de Basic',
      'Galería de fotos',
      'Música de fondo',
      'Video de portada',
      'Código QR',
    ],
  },
  deluxe: {
    id:          'deluxe',
    name:        'Deluxe',
    description: 'Para eventos formales que necesitan una experiencia más completa y premium.',
    price:       149900, // $1,499.00 MXN in centavos
    currency:    'mxn',
    planId:      'deluxe',
    features: [
      'Todo lo de Premium',
      'StoryBook animado',
      'Línea del tiempo',
      'Padrinos',
      'Mesa de regalos',
      'Hospedaje',
      'Intro cinemática',
    ],
  },
};

export const availableProducts = Object.values(productsById);

export function getProductById(id: string): Product | null {
  const canonicalId = parsePlanId(id);
  return canonicalId ? productsById[canonicalId] : null;
}
