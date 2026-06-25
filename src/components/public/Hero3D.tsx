'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Check } from 'lucide-react';
import { Reveal } from './Motion';

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
      className="cro-section-vh flex items-center" 
      style={{ 
        minHeight: '100svh',
        perspective: '1200px',
        overflow: 'hidden',
        position: 'relative',
        padding: '5rem 0'
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

      <div className="cro-shell z-10 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-center">
          
          {/* Left Column: Text & Value Propositions */}
          <Reveal className="cro-hero-content">
            <span className="cro-eyebrow" style={{ textShadow: '0 2px 10px rgba(197,168,128,0.2)', letterSpacing: '0.1em', whiteSpace: 'normal', wordBreak: 'break-word' }}>
              Invitaciones Digitales Premium
            </span>
            <h1 className="cro-title-mega" style={{ textShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
              Crea tu invitación digital de boda en minutos
            </h1>
            <p className="cro-copy mt-6" style={{ color: '#E7E5E4' }}>
              Compártela por WhatsApp, recibe confirmaciones automáticas y evita perseguir invitados uno por uno.
            </p>
            
            {/* Value bullets */}
            <div className="mt-8 flex flex-col gap-3.5">
              {[
                'Pago único, sin mensualidades',
                'Editable cuando lo necesites',
                'Funciona en cualquier celular',
                'RSVP, mapas, música, galería y pases QR'
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
                Crear mi invitación
              </Link>
              <Link 
                href="/sofia-y-alejandro" 
                target="_blank" 
                className="cro-btn cro-btn-outline" 
                style={{ background: 'rgba(255,255,255,0.02)' }} 
                data-cta="hero-demo" 
                data-event="click-hero-demo"
              >
                <Play size={14} fill="currentColor" className="mr-1 inline" /> Ver ejemplo
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
