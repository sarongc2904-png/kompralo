import type { Product, ProductId } from './types';
import { parsePlanId } from '@/domain/plans/types';

export const productsById: Record<ProductId, Product> = {
  basic: {
    id:          'basic',
    name:        'Basic',
    description: 'Ideal si quieres una invitación sencilla, elegante y fácil de compartir.',
    price:       49900, // $499.00 MXN in centavos
    currency:    'mxn',
    planId:      'basic',
    features: [
      'Portada de la invitación',
      'Cuenta regresiva',
      'Ubicación',
      'Código de vestimenta',
      'Mensaje final',
      'Itinerario',
      'Confirmación de asistencia',
      'Compartir por WhatsApp',
    ],
  },
  premium: {
    id:          'premium',
    name:        'Premium',
    description: 'Ideal si quieres una invitación más completa y visual para tu boda.',
    price:       89900, // $899.00 MXN in centavos
    currency:    'mxn',
    planId:      'premium',
    features: [
      'Todo lo de Basic',
      'Historia de la pareja',
      'Galería de fotos',
      'Familias',
      'Mesa de regalos',
      'Hashtag',
    ],
  },
  deluxe: {
    id:          'deluxe',
    name:        'Deluxe',
    description: 'Ideal si quieres una experiencia más completa para una boda formal.',
    price:       149900, // $1,499.00 MXN in centavos
    currency:    'mxn',
    planId:      'deluxe',
    features: [
      'Todo lo de Premium',
      'Padrinos',
      'Línea de tiempo',
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
