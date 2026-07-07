'use client';

import Image from 'next/image';
import { ArrowRight, CalendarCheck2, LockKeyhole, QrCode, Send } from 'lucide-react';
import { FadeIn } from '@/components/public/FadeIn';
import { SiteButton } from '@/components/public/Button';

const heroBenefits = [
  { label: 'Envío por WhatsApp', icon: Send },
  { label: 'Confirmaciones en tiempo real', icon: CalendarCheck2 },
  { label: 'Código QR para tu evento', icon: QrCode },
];

export default function Hero3D() {
  return (
    <section className="relative isolate flex min-h-[calc(100svh-73px)] w-full items-center overflow-hidden bg-[#FAF3EE] px-0 py-12 md:min-h-[90svh] md:py-16 lg:py-20">
      <div className="absolute inset-y-0 right-0 -z-30 hidden w-[66%] md:block">
        <Image
          src="/landing/hero-couple-bg.webp"
          alt=""
          fill
          priority
          sizes="66vw"
          className="object-cover object-center"
        />
      </div>
      <div className="absolute inset-x-0 bottom-0 -z-30 h-[48%] md:hidden">
        <Image
          src="/landing/hero-couple-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-20"
        />
      </div>
      <Image
        src="/landing/texture-paper.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover opacity-35 mix-blend-multiply"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(250,243,238,0.99)_0%,rgba(250,243,238,0.96)_38%,rgba(250,243,238,0.62)_61%,rgba(250,243,238,0.18)_100%)]" />
      <div className="absolute left-[48%] top-0 -z-10 hidden h-full w-[28vw] -skew-x-12 bg-white/20 blur-xl lg:block" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-[#FAF3EE] to-transparent" />

      <div className="mx-auto grid w-[min(1220px,calc(100%-32px))] grid-cols-1 items-center gap-3 md:w-[min(1220px,calc(100%-48px))] md:gap-8 lg:grid-cols-[0.96fr_1.04fr] lg:gap-10 xl:gap-14">
        <FadeIn className="relative z-10 max-w-3xl pt-2 text-center md:text-left lg:pt-0">
          <div className="mx-auto mb-5 flex max-w-[440px] items-center justify-center gap-3 md:mx-0 md:justify-start">
            <span className="h-px w-10 bg-[#C9A46A]/45" />
            <p className="m-0 font-site-sans text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-[#9C6B70]">
              Invitaciones digitales de boda
            </p>
            <span className="h-px w-10 bg-[#C9A46A]/45" />
          </div>

          <h1 className="m-0 text-[#9C6B70]">
            <span className="block font-site-serif text-[clamp(3.15rem,7.1vw,6.1rem)] font-normal leading-[0.9] tracking-normal">
              Tu historia,
            </span>
            <span className="mt-2 block font-site-serif text-[clamp(3.25rem,6.9vw,6.2rem)] font-normal italic leading-[0.82] tracking-normal text-[#9C6B70]">
              tu invitación
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[620px] font-site-sans text-base leading-7 text-[#4A3B35]/82 md:mx-0 md:mt-7 md:text-lg md:leading-8">
            Crea una invitación digital de boda elegante, fácil de compartir y lista para organizar a tus invitados sin complicaciones.
          </p>

          <div className="mx-auto mt-6 grid max-w-[620px] grid-cols-3 divide-x divide-[#9C6B70]/18 md:mx-0 md:mt-8">
            {heroBenefits.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex min-h-[76px] flex-col items-center justify-start gap-2.5 px-2 text-center font-site-sans text-[0.72rem] font-semibold leading-4 tracking-normal text-[#4A3B35]/82 sm:text-xs md:min-h-[86px] md:gap-3 md:px-5 md:tracking-[0.04em]"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center text-[#A96F5F]">
                  <Icon size={24} strokeWidth={1.5} />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:mt-9 md:items-start">
            <SiteButton
              href="/i/nuestrabodaarletteymayorga"
              className="w-full border-[#B87378] bg-[#B87378] px-7 text-center text-site-crema shadow-[0_18px_40px_rgba(156,107,112,0.22)] hover:border-[#9C6B70] hover:bg-[#9C6B70] sm:w-auto"
              data-cta="hero-primary"
              data-event="click-hero-primary"
            >
              Crear mi invitación
            </SiteButton>
            <SiteButton
              href="#planes"
              variant="secondary"
              className="w-full border-[#9C6B70]/45 bg-white/35 px-7 text-center text-[#9C6B70] backdrop-blur-sm hover:bg-white/60 sm:w-auto"
              data-cta="hero-pricing"
              data-event="click-hero-pricing"
            >
              Ver ejemplos
            </SiteButton>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 font-site-sans text-[0.7rem] font-semibold uppercase tracking-[0.15em] text-[#4A3B35]/58 md:justify-start">
            <LockKeyhole size={13} strokeWidth={1.7} />
            Pago único, sin suscripciones
          </p>
        </FadeIn>

        <FadeIn className="relative -mt-8 min-h-[300px] overflow-visible md:mt-0 md:min-h-[540px] lg:min-h-[620px]" style={{ transitionDelay: '120ms' }}>
          <div className="pointer-events-none absolute left-1/2 top-2 h-[92%] w-[86%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle,rgba(255,255,255,0.88)_0%,rgba(255,248,243,0.62)_42%,rgba(255,248,243,0)_70%)] blur-sm" />
          <div className="pointer-events-none absolute left-[6%] top-[8%] hidden h-[78%] w-[78%] rotate-[-16deg] rounded-full border border-white/55 bg-white/18 shadow-[0_0_80px_rgba(255,255,255,0.45)] backdrop-blur-[1px] md:block" />
          <div className="relative mx-auto mt-1 aspect-[905/1737] w-[min(58vw,230px)] rotate-[-7deg] drop-shadow-[0_34px_58px_rgba(74,59,53,0.26)] sm:w-[min(54vw,310px)] md:w-[min(36vw,350px)] lg:mt-0 lg:w-[min(30vw,390px)] xl:w-[405px]">
            <Image
              src="/images/invitaciones/landing/wedding-premium-phone-mockup.png"
              alt="Mockup de invitación digital de boda en celular"
              fill
              priority
              sizes="(max-width: 640px) 67vw, (max-width: 768px) 54vw, (max-width: 1024px) 36vw, 405px"
              className="object-contain"
            />
          </div>
          <div className="pointer-events-none absolute bottom-6 right-[8%] hidden items-center gap-2 rounded-full border border-white/70 bg-white/55 px-4 py-2 font-site-sans text-xs font-semibold uppercase tracking-[0.12em] text-[#9C6B70] shadow-[0_18px_45px_rgba(74,59,53,0.12)] backdrop-blur-md md:flex">
            <ArrowRight size={14} strokeWidth={1.8} />
            Lista para compartir
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
