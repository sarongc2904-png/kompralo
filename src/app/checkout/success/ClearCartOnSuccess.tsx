'use client';

import { useEffect } from 'react';
import { useKompraloCart } from '@/components/cart/useKompraloCart';

// El carrito se conserva durante todo el checkout (por si el usuario cancela
// en Stripe y regresa). Solo se vacía aquí, con el pago ya confirmado.
export function ClearCartOnSuccess() {
  const { clear } = useKompraloCart();

  useEffect(() => {
    clear();
  }, [clear]);

  return null;
}
