'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Check, Sparkles, Heart, Flower, Star } from 'lucide-react';
import { Reveal } from './Motion';

interface ParticleProps {
  src: string;
  top: string;
  left: string;
  width: number;
  height: number;
  factorX: number;
  factorY: number;
  initialRotate: number;
  factorRotate: number;
  opacity: number;
  blur: string;
  zIndex: number;
  smoothX: any;
  smoothY: any;
}

function ParallaxParticle({ src, top, left, width, height, factorX, factorY, initialRotate, factorRotate, opacity, blur, zIndex, smoothX, smoothY }: ParticleProps) {
  const x = useTransform(smoothX, [0, 1], [-factorX, factorX]);
  const y = useTransform(smoothY, [0, 1], [-factorY, factorY]);
  const rotate = useTransform(smoothX, [0, 1], [initialRotate - factorRotate, initialRotate + factorRotate]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top,
        left,
        x,
        y,
        rotate,
        opacity,
        filter: `blur(${blur})`,
        pointerEvents: 'none',
        zIndex,
        mixBlendMode: 'screen',
        width,
        height,
      }}
    >
      <Image src={src} alt="Parallax Particle" width={width} height={height} style={{ objectFit: 'contain' }} />
    </motion.div>
  );
}

const PARTICLES = [
  // --- Foreground Rose Petals (Large, Blurred, high speed/depth) ---
  { id: 1, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '10%', left: '5%', width: 140, height: 140, factorX: 80, factorY: 60, initialRotate: 45, factorRotate: 20, opacity: 0.7, blur: '4px', zIndex: 20 },
  { id: 2, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '80%', left: '80%', width: 160, height: 160, factorX: -70, factorY: -90, initialRotate: -30, factorRotate: -25, opacity: 0.65, blur: '5px', zIndex: 20 },

  // --- Midground Rose Petals (Medium, Sharp, normal speed) ---
  { id: 3, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '25%', left: '75%', width: 85, height: 85, factorX: 40, factorY: 30, initialRotate: 120, factorRotate: 15, opacity: 0.8, blur: '0px', zIndex: 8 },
  { id: 4, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '55%', left: '12%', width: 75, height: 75, factorX: -30, factorY: 45, initialRotate: -15, factorRotate: 10, opacity: 0.75, blur: '0.5px', zIndex: 8 },
  { id: 5, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '78%', left: '35%', width: 95, height: 95, factorX: 35, factorY: -40, initialRotate: 60, factorRotate: -15, opacity: 0.8, blur: '0px', zIndex: 8 },

  // --- Background Rose Petals (Small, Slightly Blurred, slow speed) ---
  { id: 6, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '48%', left: '45%', width: 50, height: 50, factorX: 15, factorY: 15, initialRotate: -80, factorRotate: 5, opacity: 0.5, blur: '1.5px', zIndex: 3 },
  { id: 7, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '5%', left: '92%', width: 55, height: 55, factorX: -20, factorY: 20, initialRotate: 150, factorRotate: 8, opacity: 0.55, blur: '2px', zIndex: 3 },

  // --- Eucalyptus Leaves ---
  { id: 8, src: '/images/invitaciones/landing/wedding_eucalyptus_leaf.png', top: '12%', left: '48%', width: 80, height: 80, factorX: -30, factorY: -25, initialRotate: -45, factorRotate: 15, opacity: 0.5, blur: '1px', zIndex: 5 },
  { id: 9, src: '/images/invitaciones/landing/wedding_eucalyptus_leaf.png', top: '70%', left: '90%', width: 90, height: 90, factorX: 45, factorY: 45, initialRotate: 75, factorRotate: -20, opacity: 0.55, blur: '0px', zIndex: 5 },

  // --- Golden Sparkles ---
  { id: 10, src: '/images/invitaciones/landing/wedding_golden_sparkle.png', top: '30%', left: '20%', width: 50, height: 50, factorX: 50, factorY: 40, initialRotate: 0, factorRotate: 0, opacity: 0.7, blur: '0.5px', zIndex: 6 },
  { id: 11, src: '/images/invitaciones/landing/wedding_golden_sparkle.png', top: '65%', left: '6%', width: 40, height: 40, factorX: -15, factorY: 25, initialRotate: 0, factorRotate: 0, opacity: 0.8, blur: '0px', zIndex: 6 },
  { id: 12, src: '/images/invitaciones/landing/wedding_golden_sparkle.png', top: '8%', left: '80%', width: 45, height: 45, factorX: -25, factorY: 30, initialRotate: 0, factorRotate: 0, opacity: 0.6, blur: '2.5px', zIndex: 6 },
];

export default function Hero3D() {
  const [isMounted, setIsMounted] = useState(false);
  
  // Mouse position
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);

  // Smooth springs for fluid 3D motion
  const springConfig = { damping: 30, stiffness: 100, mass: 1 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D Rotations (tilted for the mockup)
  const rotateX = useTransform(smoothY, [0, 1], [15, -15]);
  const rotateY = useTransform(smoothX, [0, 1], [-15, 15]);

  // Parallax offsets for background
  const bgX = useTransform(smoothX, [0, 1], ['-1%', '1%']);
  const bgY = useTransform(smoothY, [0, 1], ['-1%', '1%']);

  // Parallax offsets for the phone mockup
  const phoneX = useTransform(smoothX, [0, 1], [-20, 20]);
  const phoneY = useTransform(smoothY, [0, 1], [-20, 20]);

  useEffect(() => {
    const mountTimer = window.setTimeout(() => setIsMounted(true), 0);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.clearTimeout(mountTimer);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [mouseX, mouseY]);

  if (!isMounted) {
    return (
      <section className="cro-section-vh" style={{ minHeight: '100svh' }}>
        <div className="cro-hero-bg">
          <Image
            className="cro-hero-img"
            src="/images/invitaciones/landing/wedding_clean_dark_bg.png"
            alt="Kompralo Invitaciones Premium"
            fill
            priority
            sizes="100vw"
            style={{ objectFit: 'cover', opacity: 0.25 }}
          />
          <div className="cro-hero-overlay" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, #0C0A09 100%)' }}></div>
        </div>
      </section>
    );
  }

  return (
    <section
      className="cro-section-vh flex items-center pt-24 lg:pt-20"
      style={{
        minHeight: '100svh',
        perspective: '1200px',
        overflow: 'hidden',
        position: 'relative',
        paddingBottom: '5rem',
      }}
    >
      {/* Background Layer with Parallax */}
      <motion.div 
        className="cro-hero-bg"
        style={{ x: bgX, y: bgY, scale: 1.02 }}
      >
        <Image
          src="/images/invitaciones/landing/wedding_clean_dark_bg.png"
          alt="Kompralo Hero"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.25 }}
        />
        <div className="cro-hero-overlay" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, #0C0A09 100%)' }}></div>
      </motion.div>

      {/* 3D Parallax Floating Particles (Estilo Gboo.es) */}
      {isMounted && PARTICLES.map((p) => (
        <ParallaxParticle
          key={p.id}
          src={p.src}
          top={p.top}
          left={p.left}
          width={p.width}
          height={p.height}
          factorX={p.factorX}
          factorY={p.factorY}
          initialRotate={p.initialRotate}
          factorRotate={p.factorRotate}
          opacity={p.opacity}
          blur={p.blur}
          zIndex={p.zIndex}
          smoothX={smoothX}
          smoothY={smoothY}
        />
      ))}

      <div className="cro-shell z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Text & Value Propositions */}
          <Reveal className="cro-hero-content">
            <span className="cro-eyebrow" style={{ textShadow: '0 2px 10px rgba(197,168,128,0.2)', letterSpacing: '0.1em', whiteSpace: 'normal', wordBreak: 'break-word' }}>
              Invitaciones digitales de boda
            </span>
            <h1 className="cro-title-mega" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              Tu boda merece más que una imagen en WhatsApp
            </h1>
            <p className="cro-copy mt-6" style={{ color: '#E7E5E4' }}>
              Crea tu invitación digital interactiva con mapa, confirmación de asistencia y mesa de regalos. La personalizas tú misma en minutos y la compartes con un solo link. Pago único, sin mensualidades.
            </p>
            
            {/* Value bullets */}
            <div className="mt-8 flex flex-col gap-3.5">
              {[
                'Pago único',
                'Sin mensualidades',
                'Vista previa en tiempo real',
                'Confirmación de asistencia'
              ].map((bullet) => (
                <div key={bullet} className="flex items-center gap-3">
                  <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[rgba(197,168,128,0.1)] border border-[rgba(197,168,128,0.25)]">
                    <Check size={12} className="text-[#C5A880]" />
                  </div>
                  <span className="text-sm md:text-base font-medium text-[#E7E5E4]">{bullet}</span>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="cro-hero-actions">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '0.85rem' }}>
              <Link href="/i/nuestrabodaarletteymayorga" className="cro-btn cro-btn-cyan" data-cta="hero-primary" data-event="click-hero-primary">
                Ver una invitación real →
              </Link>
              <div
                aria-label="Calificación 4.5 de 5 basada en más de 650 reseñas"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: '#E7E5E4',
                  fontSize: '0.82rem',
                  lineHeight: 1,
                  flexWrap: 'wrap',
                  maxWidth: '100%',
                }}
              >
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.12rem', color: '#F4B740' }}>
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={index} size={17} fill="currentColor" strokeWidth={0} opacity={index === 4 ? 0.55 : 1} />
                  ))}
                </span>
                <span style={{ color: '#A8A29E' }}>
                  Calificación <strong style={{ color: '#F5F5F4', fontWeight: 700 }}>4.5/5</strong> basada en <strong style={{ color: '#F5F5F4', fontWeight: 700 }}>+650 reseñas</strong>
                </span>
              </div>
              </div>
              <Link 
                href="#planes"
                className="cro-btn cro-btn-outline" 
                style={{ background: 'rgba(255,255,255,0.02)' }} 
                data-cta="hero-pricing" 
                data-event="click-hero-pricing"
              >
                Ver planes y precios
              </Link>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#A8A29E', marginTop: '1.5rem', letterSpacing: '0.12em' }}>
              Desde $499 MXN · Confirmación de asistencia · Vista previa en tiempo real
            </p>
          </Reveal>

          {/* Right Column: Interactive 3D Phone Mockup */}
          <Reveal delay={0.2} className="flex justify-center items-center w-full">
            <motion.div 
              style={{ 
                rotateX, 
                rotateY, 
                x: phoneX,
                y: phoneY,
                transformStyle: 'preserve-3d',
                aspectRatio: '905 / 1737',
                filter: 'drop-shadow(0 25px 50px rgba(0, 0, 0, 0.5)) drop-shadow(0 0 25px rgba(197, 168, 128, 0.15))'
              }}
              className="cro-phone-container w-[85vw] max-w-[320px] sm:max-w-[340px] md:max-w-[380px] lg:max-w-[400px] relative select-none"
            >
              <Image
                src="/images/invitaciones/landing/wedding-premium-phone-mockup.png"
                alt="Mockup de invitación digital de boda premium en celular"
                fill
                priority
                sizes="(max-width: 768px) 85vw, (max-width: 1024px) 40vw, 400px"
                className="object-contain"
              />
            </motion.div>
          </Reveal>
          
        </div>
      </div>
    </section>
  );
}
