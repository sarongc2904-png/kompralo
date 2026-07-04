/**
 * Meta (Facebook) Pixel — helper tipado con gating por entorno.
 *
 * Reglas:
 * - Solo activo si NEXT_PUBLIC_META_PIXEL_ID existe Y NODE_ENV === 'production'.
 *   La var solo se define en Vercel Production, así que preview/dev quedan fuera
 *   (preview: sin var; `next dev`: NODE_ENV !== 'production').
 * - Todo track es fire-and-forget: guard de existencia de window.fbq + try/catch,
 *   para nunca romper el flujo de pago si el pixel está bloqueado (adblocker).
 * - Los eventos estándar usan 'track'; ClickDemo/ClickPricing son custom.
 */

export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/** El pixel se carga y dispara solo en producción real con la var presente. */
export function isPixelEnabled(): boolean {
  return process.env.NODE_ENV === 'production' && !!META_PIXEL_ID;
}

function fire(
  method: 'track' | 'trackCustom',
  event: string,
  params?: Record<string, unknown>,
  options?: { eventID?: string },
): void {
  if (!isPixelEnabled()) return;
  try {
    if (typeof window === 'undefined' || typeof window.fbq !== 'function') return;
    if (options?.eventID) {
      window.fbq(method, event, params ?? {}, { eventID: options.eventID });
    } else {
      window.fbq(method, event, params ?? {});
    }
  } catch {
    /* fire-and-forget: nunca propagar errores del pixel */
  }
}

// ─── Eventos ────────────────────────────────────────────────────────────────

export function trackPageView(): void {
  fire('track', 'PageView');
}

/** ViewContent solo para la página de precios (la demo vive en /i/[slug], sin pixel). */
export function trackViewContent(contentName: 'precios'): void {
  fire('track', 'ViewContent', { content_name: contentName });
}

export function trackClickDemo(): void {
  fire('trackCustom', 'ClickDemo');
}

export function trackClickPricing(): void {
  fire('trackCustom', 'ClickPricing');
}

/** value en MXN decimal (no centavos). */
export function trackInitiateCheckout(args: { value: number; numItems: number }): void {
  fire('track', 'InitiateCheckout', {
    value: args.value,
    currency: 'MXN',
    num_items: args.numItems,
  });
}

/** value en MXN decimal. eventID = stripe_session_id, para deduplicar con la futura CAPI. */
export function trackPurchase(args: { value: number; eventID: string }): void {
  fire('track', 'Purchase', { value: args.value, currency: 'MXN' }, { eventID: args.eventID });
}
