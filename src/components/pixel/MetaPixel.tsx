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

  // Ref siempre actualizado con el pathname actual, para gatear el listener de
  // clics (que vive fuera del ciclo de render de React).
  const pathnameRef = useRef(pathname);
  pathnameRef.current = pathname;

  // PageView SIEMPRE desde el efecto, gateado contra el allowlist con el pathname
  // vigente — nunca desde el script inline. Así una navegación SPA a /i/[slug] no
  // dispara PageView aunque fbevents.js siga cargado en memoria. Espera a que fbq
  // exista (el script base es afterInteractive) antes de disparar el PageView
  // inicial, para no perderlo por carrera de tiempos.
  useEffect(() => {
    if (!enabled || !onSalesRoute) return;

    let tries = 0;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const fire = () => {
      if (typeof window !== 'undefined' && typeof window.fbq === 'function') {
        trackPageView();
        if (pathname === '/invitaciones/precios') trackViewContent('precios');
      } else if (tries++ < 20) {
        timer = setTimeout(fire, 100);
      }
    };
    fire();

    return () => { if (timer) clearTimeout(timer); };
  }, [pathname, enabled, onSalesRoute]);

  // Delegación global de clics. Gateada contra el allowlist con el pathname
  // vigente: un clic fuera del sitio de venta no dispara ningún evento.
  useEffect(() => {
    if (!enabled) return;
    function onClick(e: MouseEvent) {
      if (!isSalesRoute(pathnameRef.current)) return;
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
  // Hace SOLO init — el PageView lo dispara el efecto de arriba (allowlist-safe).
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
      `}
    </Script>
  );
}
