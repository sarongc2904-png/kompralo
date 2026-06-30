'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Check, Sparkles, Heart, Flower } from 'lucide-react';
import { Reveal } from './Motion';

interface ParticleProps {
  src: string;
  top: string;
  left: string;
  width: number;
  height: number;
  factorX: number;
  factorY: number;
  opacity: number;
  blur: string;
  smoothX: any;
  smoothY: any;
}

function ParallaxParticle({ src, top, left, width, height, factorX, factorY, opacity, blur, smoothX, smoothY }: ParticleProps) {
  const x = useTransform(smoothX, [0, 1], [-factorX, factorX]);
  const y = useTransform(smoothY, [0, 1], [-factorY, factorY]);

  return (
    <motion.div
      style={{
        position: 'absolute',
        top,
        left,
        x,
        y,
        opacity,
        filter: `blur(${blur})`,
        pointerEvents: 'none',
        zIndex: 5,
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
  // Rose Petals (pink)
  { id: 1, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '15%', left: '8%', width: 70, height: 70, factorX: 45, factorY: 35, opacity: 0.6, blur: '0px' },
  { id: 2, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '75%', left: '15%', width: 90, height: 90, factorX: 30, factorY: -45, opacity: 0.5, blur: '2px' },
  { id: 3, src: '/images/invitaciones/landing/wedding_rose_petal.png', top: '48%', left: '90%', width: 60, height: 60, factorX: -35, factorY: 25, opacity: 0.6, blur: '0.5px' },

  // Eucalyptus Leaves (green)
  { id: 4, src: '/images/invitaciones/landing/wedding_eucalyptus_leaf.png', top: '10%', left: '42%', width: 80, height: 80, factorX: -25, factorY: -35, opacity: 0.4, blur: '1.5px' },
  { id: 5, src: '/images/invitaciones/landing/wedding_eucalyptus_leaf.png', top: '80%', left: '48%', width: 90, height: 90, factorX: 50, factorY: 40, opacity: 0.5, blur: '1px' },
  { id: 6, src: '/images/invitaciones/landing/wedding_eucalyptus_leaf.png', top: '35%', left: '78%', width: 70, height: 70, factorX: -40, factorY: -30, opacity: 0.45, blur: '3px' },

  // Golden Sparkles (shimmering lights)
  { id: 7, src: '/images/invitaciones/landing/wedding_golden_sparkle.png', top: '25%', left: '22%', width: 50, height: 50, factorX: 60, factorY: 50, opacity: 0.7, blur: '0.5px' },
  { id: 8, src: '/images/invitaciones/landing/wedding_golden_sparkle.png', top: '60%', left: '5%', width: 40, height: 40, factorX: -20, factorY: 30, opacity: 0.8, blur: '0px' },
  { id: 9, src: '/images/invitaciones/landing/wedding_golden_sparkle.png', top: '70%', left: '85%', width: 55, height: 55, factorX: 30, factorY: -30, opacity: 0.7, blur: '1px' },
  { id: 10, src: '/images/invitaciones/landing/wedding_golden_sparkle.png', top: '5%', left: '88%', width: 45, height: 45, factorX: -45, factorY: 45, opacity: 0.6, blur: '2px' },
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
            src="/images/invitaciones/hero-wedding-editorial.webp"
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
          src="/images/invitaciones/hero-wedding-editorial.webp"
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
          opacity={p.opacity}
          blur={p.blur}
          smoothX={smoothX}
          smoothY={smoothY}
        />
      ))}

      <div className="cro-shell z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Text & Value Propositions */}
          <Reveal className="cro-hero-content">
            <span className="cro-eyebrow" style={{ textShadow: '0 2px 10px rgba(197,168,128,0.2)', letterSpacing: '0.1em', whiteSpace: 'normal', wordBreak: 'break-word' }}>
              Invitaciones de Boda Digitales
            </span>
            <h1 className="cro-title-mega" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              La invitación digital que hará que sus invitados se enamoren de su boda desde el primer clic
            </h1>
            <p className="cro-copy mt-6" style={{ color: '#E7E5E4' }}>
              Diseños elegantes, personalizados y fáciles de compartir por WhatsApp, con todos los detalles importantes de su gran día en un solo lugar.
            </p>
            
            {/* Value bullets */}
            <div className="mt-8 flex flex-col gap-3.5">
              {[
                'Diseños elegantes y personalizados',
                'Fácil de compartir por WhatsApp',
                'Sin instalar aplicaciones',
                'Confirmación de asistencia al instante'
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
              <Link href="#planes" className="cro-btn cro-btn-cyan" data-cta="hero-primary" data-event="click-hero-primary">
                Quiero mi invitación de boda
              </Link>
              <Link 
                href="/i/nuestrabodaarletteymayorga" 
                target="_blank" 
                className="cro-btn cro-btn-outline" 
                style={{ background: 'rgba(255,255,255,0.02)' }} 
                data-cta="hero-demo" 
                data-event="click-hero-demo"
              >
                <Play size={14} fill="currentColor" className="mr-1 inline" /> Ver ejemplos
              </Link>
            </div>

            <p style={{ fontSize: '0.75rem', color: '#A8A29E', marginTop: '1.5rem', letterSpacing: '0.12em' }}>
              Sin instalar apps · Sin saber diseño · Lista para compartir
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
