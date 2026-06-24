'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Play, Check, MapPin } from 'lucide-react';
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
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
            <span className="cro-eyebrow" style={{ textShadow: '0 2px 10px rgba(197,168,128,0.2)' }}>
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
          <Reveal delay={0.2} className="flex justify-center items-center">
            <motion.div 
              style={{ 
                rotateX, 
                rotateY, 
                transformStyle: 'preserve-3d'
              }}
              className="cro-phone-container"
            >
              {/* Phone Frame */}
              <div className="cro-phone-frame">
                {/* Notch */}
                <div className="cro-phone-notch" />
                
                {/* Screen Content */}
                <div className="cro-phone-screen">
                  {/* Hero Wedding Invitation Header */}
                  <div className="cro-phone-hero">
                    <div className="font-calligraphy text-2xl text-[#C5A880] leading-none mb-1">S & A</div>
                    <div className="cro-phone-names">Sofía & Alejandro</div>
                    <span className="cro-phone-sub">¡Nos casamos!</span>
                    <div className="text-[0.65rem] text-[#78716C] mt-1 font-sans tracking-wide">
                      SÁBADO, 24 DE OCTUBRE DE 2026
                    </div>
                  </div>

                  {/* Countdown widget */}
                  <div className="cro-phone-countdown">
                    <div className="cro-phone-countdown-val">
                      <span>122</span>
                      <small>días</small>
                    </div>
                    <div className="cro-phone-countdown-val">
                      <span>14</span>
                      <small>horas</small>
                    </div>
                    <div className="cro-phone-countdown-val">
                      <span>05</span>
                      <small>min</small>
                    </div>
                  </div>

                  {/* RSVP button */}
                  <button type="button" className="cro-phone-rsvp-btn">
                    Confirmar Asistencia
                  </button>

                  {/* Map Preview */}
                  <div className="cro-phone-map-preview">
                    <div className="flex items-center gap-1.5 text-[0.65rem] font-bold text-[#1C1917] tracking-wide uppercase">
                      <MapPin size={10} className="text-[#C5A880]" />
                      <span>Ubicación de la Recepción</span>
                    </div>
                    <div className="text-[0.65rem] text-[#78716C] leading-snug">
                      Hacienda Cocoyoc, Morelos, México
                    </div>
                    <div className="cro-phone-map-img">
                      {/* Stylized vector map representation */}
                      <svg width="100%" height="100%" viewBox="0 0 200 60" style={{ background: '#EAE6DF' }}>
                        <path d="M 0 10 L 200 40 M 40 0 L 100 60 M 150 0 L 120 60" stroke="#D6D3D1" strokeWidth="1.5" />
                        <circle cx="110" cy="30" r="15" fill="rgba(197, 168, 128, 0.15)" />
                        <circle cx="110" cy="30" r="4" fill="#C5A880" />
                        <path d="M 110 30 Q 110 20 110 18 Q 110 20 110 30" stroke="#C5A880" strokeWidth="2" fill="none" />
                      </svg>
                    </div>
                  </div>

                  {/* QR Preview */}
                  <div className="cro-phone-qr-preview">
                    <span className="text-[0.6rem] font-bold text-[#1C1917] tracking-wider uppercase">
                      Pase Personalizado
                    </span>
                    <div className="text-[0.55rem] text-[#78716C] leading-none mb-1">
                      Invitado: Familia Mendoza · 2 Lugares
                    </div>
                    <div className="cro-phone-qr-code">
                      {/* Stylized QR Code placeholder */}
                      <svg width="34" height="34" viewBox="0 0 34 34" fill="#1C1917">
                        <rect x="0" y="0" width="10" height="10" fill="none" stroke="#1C1917" strokeWidth="2" />
                        <rect x="2" y="2" width="6" height="6" />
                        <rect x="24" y="0" width="10" height="10" fill="none" stroke="#1C1917" strokeWidth="2" />
                        <rect x="26" y="2" width="6" height="6" />
                        <rect x="0" y="24" width="10" height="10" fill="none" stroke="#1C1917" strokeWidth="2" />
                        <rect x="2" y="26" width="6" height="6" />
                        <rect x="14" y="14" width="6" height="6" />
                        <rect x="24" y="24" width="4" height="4" />
                        <rect x="28" y="28" width="6" height="6" fill="none" stroke="#1C1917" strokeWidth="2" />
                        <rect x="14" y="0" width="4" height="8" />
                        <rect x="0" y="14" width="8" height="4" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </Reveal>
          
        </div>
      </div>
    </section>
  );
}
