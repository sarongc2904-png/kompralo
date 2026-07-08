'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import {
  CalendarCheck2,
  Clock3,
  LockKeyhole,
  MapPin,
  MessageCircle,
  Smartphone,
} from 'lucide-react';
import { SiteButton } from '@/components/public/Button';

const heroBenefits = [
  { label: 'Se abre sin apps', icon: Smartphone },
  { label: 'Confirmaciones en tiempo real', icon: CalendarCheck2 },
  { label: 'Pago único desde $499 MXN', icon: LockKeyhole },
];

export default function Hero3D() {
  const sectionRef = useRef<HTMLElement>(null);
  const [parallaxY, setParallaxY] = useState(0);

  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReducedMotion.matches) return;

    let frame = 0;

    const updateParallax = () => {
      frame = 0;
      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const nextY = Math.max(-34, Math.min(46, rect.top * -0.08));
      setParallaxY((currentY) => (Math.abs(currentY - nextY) < 0.5 ? currentY : nextY));
    };

    const requestUpdate = () => {
      if (frame) return;
      frame = window.requestAnimationFrame(updateParallax);
    };

    updateParallax();
    window.addEventListener('scroll', requestUpdate, { passive: true });
    window.addEventListener('resize', requestUpdate);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', requestUpdate);
      window.removeEventListener('resize', requestUpdate);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative isolate flex min-h-[calc(100svh-73px)] w-full items-center overflow-hidden bg-[#F7EFE8] px-0 py-10 md:min-h-[90svh] md:py-16 lg:py-20"
    >
      <div
        className="absolute -top-[10%] bottom-[-10%] right-0 -z-30 hidden w-[68%] will-change-transform md:block"
        style={{ transform: `translate3d(0, ${parallaxY}px, 0)` }}
      >
        <Image
          src="/landing/hero-couple-bg.webp"
          alt=""
          fill
          priority
          sizes="68vw"
          className="object-cover object-center saturate-[0.92]"
        />
      </div>
      <div
        className="absolute inset-x-0 bottom-[-8%] -z-30 h-[56%] will-change-transform md:hidden"
        style={{ transform: `translate3d(0, ${parallaxY * 0.45}px, 0)` }}
      >
        <Image
          src="/landing/hero-couple-bg.webp"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover object-top opacity-16"
        />
      </div>
      <Image
        src="/landing/texture-paper.webp"
        alt=""
        fill
        priority
        sizes="100vw"
        className="absolute inset-0 -z-20 object-cover opacity-45 mix-blend-multiply"
      />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(247,239,232,1)_0%,rgba(247,239,232,0.98)_34%,rgba(247,239,232,0.76)_58%,rgba(247,239,232,0.22)_100%)]" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_18%_22%,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0)_34%),radial-gradient(circle_at_82%_20%,rgba(156,107,112,0.12)_0%,rgba(156,107,112,0)_36%)]" />
      <div className="absolute left-[47%] top-0 -z-10 hidden h-full w-[24vw] -skew-x-12 bg-white/28 blur-xl lg:block" />
      <div className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-28 bg-gradient-to-t from-[#F7EFE8] to-transparent" />

      <div className="mx-auto grid w-[min(1240px,calc(100%-32px))] grid-cols-1 items-center gap-4 md:w-[min(1240px,calc(100%-48px))] md:gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12 xl:gap-16">
        <div className="relative z-10 max-w-3xl pt-2 text-center md:text-left lg:pt-0">
          <div className="mx-auto mb-5 flex w-fit items-center gap-3 rounded-full border border-[#9C6B70]/16 bg-white/42 px-4 py-2 shadow-[0_12px_34px_rgba(74,59,53,0.08)] backdrop-blur-md md:mx-0">
            <span className="h-px w-8 bg-[#C9A46A]/60" />
            <p className="m-0 font-site-sans text-[0.68rem] font-extrabold uppercase tracking-[0.22em] text-[#9C6B70]">
              Suite digital de boda
            </p>
            <span className="h-px w-8 bg-[#C9A46A]/60" />
          </div>

          <h1 className="m-0 text-[#9C6B70]">
            <span className="block font-site-serif text-[clamp(2.82rem,6.15vw,5.85rem)] font-semibold leading-[0.92] tracking-[-0.025em]">
              Deja de responder las mismas
            </span>
            <span className="mt-2 block font-site-serif text-[clamp(2.95rem,6.3vw,6.15rem)] font-normal italic leading-[0.88] tracking-[-0.01em] text-[#7F565B]">
              preguntas de tu boda
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-[650px] font-site-sans text-base leading-7 text-[#4A3B35]/84 md:mx-0 md:mt-7 md:text-lg md:leading-8">
            Crea una invitación digital elegante con ubicación, horarios, mesa de regalos y confirmación de asistencia en un solo link para WhatsApp.
          </p>

          <div className="mx-auto mt-6 grid max-w-[650px] grid-cols-3 gap-2 md:mx-0 md:mt-8 md:gap-2.5">
            {heroBenefits.map(({ label, icon: Icon }) => (
              <div
                key={label}
                className="flex min-h-[82px] flex-col items-center justify-start gap-2 rounded-xl border border-white/70 bg-white/50 px-2 py-3 text-center font-site-sans text-[0.62rem] font-bold leading-3 tracking-normal text-[#4A3B35]/82 shadow-[0_14px_34px_rgba(74,59,53,0.07)] backdrop-blur-md sm:text-xs md:min-h-[96px] md:gap-3 md:px-3 md:leading-4"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F1E3DF] text-[#9C6B70]">
                  <Icon size={20} strokeWidth={1.7} />
                </span>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className="mt-7 flex flex-col items-center gap-3 sm:flex-row md:mt-9 md:items-start">
            <SiteButton
              href="/i/nuestrabodaarletteymayorga"
              className="min-h-14 w-full border-[#7F565B] bg-[#7F565B] px-8 text-center text-site-crema shadow-[0_20px_48px_rgba(127,86,91,0.28)] hover:border-[#654347] hover:bg-[#654347] sm:w-auto"
              data-cta="hero-primary"
              data-event="view_demo"
            >
              Ver demo real
            </SiteButton>
            <SiteButton
              href="#planes"
              variant="secondary"
              className="min-h-14 w-full border-[#9C6B70]/45 bg-white/54 px-7 text-center text-[#7F565B] shadow-[0_14px_32px_rgba(74,59,53,0.08)] backdrop-blur-md hover:bg-white/80 sm:w-auto"
              data-cta="hero-plans"
              data-event="view_plans"
            >
              Ver planes
            </SiteButton>
          </div>

          <p className="mt-5 flex items-center justify-center gap-2 font-site-sans text-[0.7rem] font-extrabold uppercase tracking-[0.15em] text-[#4A3B35]/62 md:justify-start">
            <LockKeyhole size={13} strokeWidth={1.7} />
            Desde $499 MXN · Pago único · Acceso inmediato
          </p>
        </div>

        <div className="relative -mt-3 min-h-[345px] overflow-visible md:mt-0 md:min-h-[540px] lg:min-h-[650px]">
          <div className="pointer-events-none absolute left-1/2 top-8 h-[86%] w-[82%] -translate-x-1/2 rounded-[50%] bg-[radial-gradient(circle,rgba(255,255,255,0.92)_0%,rgba(255,248,243,0.66)_44%,rgba(255,248,243,0)_72%)] blur-sm" />
          <div className="pointer-events-none absolute left-[4%] top-[7%] hidden h-[82%] w-[82%] rotate-[-14deg] rounded-[46%] border border-white/70 bg-white/20 shadow-[0_0_90px_rgba(255,255,255,0.42)] backdrop-blur-[1px] md:block" />
          <div className="pointer-events-none absolute right-[2%] top-[10%] hidden h-[76%] w-[46%] rounded-full border border-[#C9A46A]/24 md:block" />

          <div className="absolute left-[7%] top-[8%] hidden w-48 rounded-2xl border border-white/70 bg-white/70 p-4 font-site-sans text-[#4A3B35] shadow-[0_18px_46px_rgba(74,59,53,0.14)] backdrop-blur-xl md:block">
            <div className="mb-2 flex items-center gap-2 text-[0.68rem] font-extrabold uppercase tracking-[0.12em] text-[#9C6B70]">
              <MessageCircle size={14} strokeWidth={1.8} />
              WhatsApp listo
            </div>
            <p className="m-0 text-sm font-bold leading-5">Link con mapa, horarios y confirmación.</p>
          </div>

          <div className="absolute right-[3%] top-[17%] hidden w-44 rounded-2xl border border-white/75 bg-white/72 p-4 font-site-sans text-[#4A3B35] shadow-[0_18px_46px_rgba(74,59,53,0.13)] backdrop-blur-xl lg:block">
            <div className="mb-3 flex items-center justify-between">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#F1E3DF] text-[#9C6B70]">
                <CalendarCheck2 size={18} strokeWidth={1.7} />
              </span>
              <span className="rounded-full bg-[#EEF7EE] px-2 py-1 text-[0.65rem] font-extrabold uppercase tracking-[0.1em] text-[#3C7B47]">Confirmado</span>
            </div>
            <p className="m-0 text-sm font-bold leading-5">2 invitados confirmaron desde el celular.</p>
          </div>

          <div className="relative mx-auto mt-0 aspect-[905/1737] w-[min(57vw,220px)] rotate-[-5deg] drop-shadow-[0_38px_70px_rgba(74,59,53,0.28)] sm:w-[min(51vw,300px)] md:w-[min(35vw,350px)] lg:mt-3 lg:w-[min(29vw,395px)] xl:w-[420px]">
            <div className="absolute -inset-[3%] rounded-[3rem] bg-[linear-gradient(145deg,rgba(255,255,255,0.55),rgba(197,164,106,0.08))] blur-xl" />
            <Image
              src="/images/invitaciones/landing/wedding-premium-phone-mockup.png"
              alt="Mockup de invitación digital de boda en celular"
              fill
              priority
              sizes="(max-width: 640px) 62vw, (max-width: 768px) 51vw, (max-width: 1024px) 35vw, 420px"
              className="object-contain"
            />
          </div>

          <div className="absolute bottom-8 left-1/2 flex w-[min(92%,430px)] -translate-x-1/2 items-center justify-between gap-3 rounded-2xl border border-white/75 bg-white/72 px-4 py-3 font-site-sans text-[#4A3B35] shadow-[0_20px_50px_rgba(74,59,53,0.16)] backdrop-blur-xl md:bottom-5 lg:left-[48%] lg:w-[430px]">
            <div className="flex min-w-0 items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F1E3DF] text-[#9C6B70]">
                <MapPin size={18} strokeWidth={1.7} />
              </span>
              <div className="min-w-0">
                <p className="m-0 text-[0.66rem] font-extrabold uppercase tracking-[0.13em] text-[#9C6B70]">Detalle incluido</p>
                <p className="m-0 truncate text-sm font-bold">Ubicación, itinerario y mesa de regalos</p>
              </div>
            </div>
            <div className="hidden items-center gap-1 rounded-full bg-[#FAF3EE] px-3 py-2 text-[0.72rem] font-extrabold uppercase tracking-[0.1em] text-[#7F565B] sm:flex">
              <Clock3 size={14} strokeWidth={1.8} />
              En un link
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
