'use client';

import Image from 'next/image';
import { Check } from 'lucide-react';
import { FadeIn } from '@/components/public/FadeIn';
import { SiteButton } from '@/components/public/Button';

const heroBullets = [
  'Pago único',
  'Sin mensualidades',
  'Vista previa en tiempo real',
  'Confirmación de asistencia',
];

export default function Hero3D() {
  return (
    <section className="relative isolate flex min-h-[86svh] w-full items-center overflow-hidden bg-site-crema px-0 py-16 md:min-h-[90svh] md:py-24">
      <Image
        src="/images/invitaciones/landing/wedding_clean_dark_bg.png"
        alt="Mesa elegante de boda para invitaciones digitales"
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover opacity-35"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,var(--site-color-crema)_0%,rgba(250,243,238,0.92)_34%,rgba(250,243,238,0.62)_62%,rgba(250,243,238,0.18)_100%)]" />
      <div className="absolute inset-x-0 bottom-0 -z-10 h-32 bg-gradient-to-t from-site-crema to-transparent" />

      <div className="mx-auto grid w-[min(1200px,calc(100%-40px))] grid-cols-1 items-center gap-12 lg:grid-cols-[1.04fr_0.96fr] lg:gap-16">
        <FadeIn className="max-w-3xl">
          <p className="site-eyebrow">Invitaciones digitales de boda</p>
          <h1 className="site-h1">
            Tu boda merece más que una imagen en WhatsApp
          </h1>
          <p className="mt-6 max-w-2xl font-site-sans text-lg leading-8 text-site-marron/78 md:text-xl">
            Crea tu invitación digital interactiva con mapa, confirmación de asistencia y mesa de regalos. La personalizas en minutos y la compartes con un solo link.
          </p>

          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {heroBullets.map((bullet) => (
              <div key={bullet} className="flex items-center gap-3 font-site-sans text-sm font-semibold text-site-marron/80">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-site-blanco text-site-rosa-antiguo shadow-sm">
                  <Check size={14} strokeWidth={2} />
                </span>
                {bullet}
              </div>
            ))}
          </div>

          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <SiteButton href="/i/nuestrabodaarletteymayorga" data-cta="hero-primary" data-event="click-hero-primary">
              Ver demos
            </SiteButton>
            <SiteButton href="#planes" variant="secondary" data-cta="hero-pricing" data-event="click-hero-pricing">
              Ver planes y precios
            </SiteButton>
          </div>

          <p className="mt-5 font-site-sans text-xs font-semibold uppercase tracking-[0.15em] text-site-marron/55">
            Desde $499 MXN · Pago único · Vista previa en tiempo real
          </p>
        </FadeIn>

        <FadeIn className="relative min-h-[420px] md:min-h-[560px]" style={{ transitionDelay: '120ms' }}>
          <div className="relative mx-auto aspect-[905/1737] w-[min(78vw,330px)] md:w-[min(38vw,390px)]">
            <Image
              src="/images/invitaciones/landing/wedding-premium-phone-mockup.png"
              alt="Mockup de invitación digital de boda en celular"
              fill
              priority
              sizes="(max-width: 768px) 78vw, (max-width: 1024px) 38vw, 390px"
              className="object-contain drop-shadow-2xl"
            />
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
