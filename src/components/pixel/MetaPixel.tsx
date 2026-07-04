'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import {
  META_PIXEL_ID,
  isPixelEnabled,
  trackPageView,
  trackViewContent,
  trackClickDemo,
  trackClickPricing,
} from '@/lib/pixel';

/**
 * Rutas del sitio público de venta donde SÍ medimos. Allowlist (no denylist):
 * el root layout envuelve todo — incluidos /i/[slug], /admin, el Editor V4 en
 * /dashboard y el catch-all /[slug] — así que enumeramos solo el funnel de venta.
 */
function isSalesRoute(pathname: string): boolean {
  if (pathname === '/') return true;
  if (pathname === '/invitaciones' || pathname.startsWith('/invitaciones/')) return true;
  if (pathname === '/checkout/success' || pathname === '/checkout/cancel') return true;
  return false;
}

/** Mapea el valor de data-event a su evento de pixel (o null si no se mide). */
function eventForDataAttr(value: string): 'demo' | 'pricing' | null {
  const v = value.toLowerCase();
  if (v.includes('demo')) return 'demo';
  // Intención de compra: CTAs a planes/precios + el CTA final de la landing.
  if (v.includes('planes') || v.includes('pricing') || v === 'click-cta-final') return 'pricing';
  return null;
}

export default function MetaPixel() {
  const pathname = usePathname();
  const enabled = isPixelEnabled();
  const onSalesRoute = isSalesRoute(pathname);
  const firstRun = useRef(true);

  // PageView en cada cambio de ruta (App Router). El snippet base ya dispara el
  // PageView inicial, por eso saltamos la primera ejecución del efecto.
  // ViewContent('precios') sí corre siempre que estemos en /invitaciones/precios.
  useEffect(() => {
    if (!enabled || !onSalesRoute) return;

    if (firstRun.current) {
      firstRun.current = false;
    } else {
      trackPageView();
    }

    if (pathname === '/invitaciones/precios') {
      trackViewContent('precios');
    }
  }, [pathname, enabled, onSalesRoute]);

  // Delegación global: un solo listener lee el data-event del elemento clicado.
  // No toca el JSX existente ni depende de onClick por componente.
  useEffect(() => {
    if (!enabled) return;
    function onClick(e: MouseEvent) {
      const target = e.target as HTMLElement | null;
      const el = target?.closest?.('[data-event]');
      if (!el) return;
      const mapped = eventForDataAttr(el.getAttribute('data-event') ?? '');
      if (mapped === 'demo') trackClickDemo();
      else if (mapped === 'pricing') trackClickPricing();
    }
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, [enabled]);

  // El script base solo se inyecta en producción real y en rutas de venta.
  if (!enabled || !onSalesRoute) return null;

  return (
    <Script id="meta-pixel-base" strategy="afterInteractive">
      {`
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window,document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${META_PIXEL_ID}');
        fbq('track', 'PageView');
      `}
    </Script>
  );
}
