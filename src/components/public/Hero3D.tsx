'use client';

import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { Play } from 'lucide-react';
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

  // 3D Rotations
  const rotateX = useTransform(smoothY, [0, 1], [10, -10]);
  const rotateY = useTransform(smoothX, [0, 1], [-10, 10]);

  // Parallax offsets
  const bgX = useTransform(smoothX, [0, 1], ['-2%', '2%']);
  const bgY = useTransform(smoothY, [0, 1], ['-2%', '2%']);

  const float1X = useTransform(smoothX, [0, 1], [30, -30]);
  const float1Y = useTransform(smoothY, [0, 1], [30, -30]);

  const float2X = useTransform(smoothX, [0, 1], [-40, 40]);
  const float2Y = useTransform(smoothY, [0, 1], [-40, 40]);

  const float3X = useTransform(smoothX, [0, 1], [50, -50]);
  const float3Y = useTransform(smoothY, [0, 1], [-50, 50]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setIsMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth);
      mouseY.set(e.clientY / window.innerHeight);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY]);

  if (!isMounted) {
    // Fallback for SSR to prevent hydration mismatch
    return (
      <section className="cro-section-vh" style={{ minHeight: '100svh' }}>
        <div className="cro-hero-bg">
          <Image
            className="cro-hero-img"
            src="/images/invitaciones/social-proof-event-1.webp"
            alt="Kompralo Ultra Premium"
            fill
            priority
            sizes="100vw"
          />
          <div className="cro-hero-overlay"></div>
        </div>
      </section>
    );
  }

  return (
    <section 
      className="cro-section-vh" 
      style={{ 
        minHeight: '100svh',
        perspective: '1200px',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Background Layer with Parallax */}
      <motion.div 
        className="cro-hero-bg"
        style={{ x: bgX, y: bgY, scale: 1.05 }}
      >
        <Image
          src="/images/invitaciones/hero-wedding-editorial.webp"
          alt="Kompralo Hero"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.4 }}
        />
        <div className="cro-hero-overlay" style={{ background: 'radial-gradient(circle at center, rgba(0,0,0,0.1) 0%, #000 100%)' }}></div>
      </motion.div>

      {/* Interactive 3D Container */}
      <motion.div 
        className="cro-shell" 
        style={{ 
          rotateX, 
          rotateY, 
          transformStyle: 'preserve-3d',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Reveal className="cro-hero-content" style={{ transform: 'translateZ(60px)' }}>
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
          >
            <p className="cro-eyebrow" style={{ textShadow: '0 2px 10px rgba(166,123,91,0.3)' }}>Sin perseguir invitados por WhatsApp</p>
            <h1 className="cro-title-mega" style={{ fontSize: 'clamp(1.9rem, 5.5vw, 4rem)', textShadow: '0 10px 30px rgba(0,0,0,0.8)' }}>Organiza tu evento sin perseguir invitados<br/>por WhatsApp.</h1>
            <p className="cro-copy" style={{ maxWidth: 700, margin: '2rem auto 0', textShadow: '0 2px 5px rgba(0,0,0,0.8)' }}>
              Invitación digital premium. RSVP automático. Toda la información de tu evento en un solo enlace elegante.
            </p>
            <div className="cro-hero-actions" style={{ justifyContent: 'center' }}>
              <Link href="#planes" className="cro-btn cro-btn-cyan" data-cta="hero-primary">Comenzar ahora</Link>
              <Link href="/sofia-y-alejandro" className="cro-btn cro-btn-outline" style={{ background: 'rgba(255,255,255,0.05)' }} data-cta="hero-demo">
                <Play size={16} fill="currentColor" /> Ver demo real
              </Link>
            </div>
            <p style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)', marginTop: '1.5rem', letterSpacing: '0.12em' }}>
              Sin mensualidades · Listo en minutos · Comparte por WhatsApp
            </p>
          </motion.div>
        </Reveal>

        {/* 3D Floating Mockups */}
        <motion.div
          style={{
            position: 'absolute',
            top: '15%',
            left: '5%',
            width: '20%',
            aspectRatio: '9/16',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 30px 60px rgba(0,0,0,0.6), 0 0 20px rgba(166,123,91,0.2)',
            transform: 'translateZ(100px) rotate(-15deg)',
            x: float1X,
            y: float1Y,
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          className="hidden lg:block"
        >
          <Image src="/images/invitaciones/xv-event-editorial.webp" alt="XV Años" fill style={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Gala XV</span>
          </div>
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            bottom: '10%',
            right: '8%',
            width: '22%',
            aspectRatio: '9/16',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 40px 80px rgba(0,0,0,0.8), 0 0 30px rgba(255,255,255,0.1)',
            transform: 'translateZ(150px) rotate(10deg)',
            x: float2X,
            y: float2Y,
            border: '1px solid rgba(255,255,255,0.15)'
          }}
          className="hidden lg:block"
        >
          <Image src="/images/invitaciones/wedding-details.webp" alt="Wedding Details" fill style={{ objectFit: 'cover' }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-4">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Wedding Premium</span>
          </div>
        </motion.div>

        <motion.div
          style={{
            position: 'absolute',
            top: '5%',
            right: '25%',
            width: '15%',
            aspectRatio: '9/16',
            borderRadius: '12px',
            overflow: 'hidden',
            boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
            transform: 'translateZ(50px) rotate(25deg)',
            x: float3X,
            y: float3Y,
            border: '1px solid rgba(255,255,255,0.05)',
            opacity: 0.6
          }}
          className="hidden lg:block"
        >
          <Image src="/images/invitaciones/baptism-soft-event.webp" alt="Soft Event" fill style={{ objectFit: 'cover' }} />
        </motion.div>

      </motion.div>
    </section>
  );
}
