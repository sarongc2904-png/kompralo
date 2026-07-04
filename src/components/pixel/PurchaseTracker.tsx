'use client';

import { useEffect } from 'react';
import { trackPurchase } from '@/lib/pixel';

/**
 * Dispara el evento Purchase UNA vez por sesión de Stripe en /checkout/success.
 *
 * - eventID = stripe_session_id (dedup con la futura Conversions API server-side).
 * - Guard de una sola vez: sessionStorage por session_id, para no re-disparar si
 *   el usuario recarga la página de éxito. Una compra real distinta trae otro
 *   session_id, así que no se pisan.
 * - NO dispara si la orden es de prueba (is_test = true / livemode false).
 */
export function PurchaseTracker({
  sessionId,
  value,
  isTest,
}: {
  sessionId: string;
  /** Total pagado en MXN decimal (no centavos). */
  value: number;
  isTest: boolean;
}) {
  useEffect(() => {
    if (!sessionId || isTest) return;

    const key = `kompralo_fb_purchase_${sessionId}`;
    try {
      if (sessionStorage.getItem(key)) return;
      sessionStorage.setItem(key, '1');
    } catch {
      /* si sessionStorage no está disponible, seguimos y disparamos igual */
    }

    trackPurchase({ value, eventID: sessionId });
  }, [sessionId, value, isTest]);

  return null;
}
