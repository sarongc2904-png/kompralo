'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '@/domain/themes/types';
import type { InvitationProtagonist } from '@/domain/invitations/types';
import { gsap } from 'gsap';
import confetti from 'canvas-confetti';
import { motion } from 'framer-motion';

interface CinematicIntroProps {
  protagonists: InvitationProtagonist[];
  title: string;
  subtitle: string;
  eventDate: string;
  theme: Theme;
  onEnter: () => void;
  introTitle?: string;
  introSubtitle?: string;
  introButtonText?: string;
}

function formatEventDate(dateStr: string): string {
  const d = new Date(dateStr);
  const day   = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year  = d.getFullYear();
  return `${day}.${month}.${year}`;
}

// ─── GOLDEN HEART ────────────────────────────────────────────────────────────

function GoldenHeart({ onClick, showConjunction = true }: { onClick: () => void; showConjunction?: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      className="relative cursor-pointer select-none flex items-center justify-center my-2"
      style={{ background: 'none', border: 'none', outline: 'none', padding: 0, width: 90, height: 90 }}
      initial={{ opacity: 1, scale: 1 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      whileTap={{ scale: 0.92 }}
      title="Entrar a la invitación"
    >
      {/* Outer gold glow pulse */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ filter: 'blur(12px)' }}
        animate={{ opacity: [0.25, 0.55, 0.25], scale: [0.95, 1.1, 0.95] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
      >
        <svg viewBox="0 0 100 100" width="100" height="100" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M50 82 C50 82 15 56 15 32 C15 19 25 10 37 10 C44 10 48 14 50 18 C52 14 56 10 63 10 C75 10 85 19 85 32 C85 56 50 82 50 82Z"
            fill="#C8A75D"
            opacity="0.3"
          />
        </svg>
      </motion.div>

      {/* Heart beat animation wrapper */}
      <motion.div
        animate={{ scale: [1, 1.05, 1, 1.03, 1] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut', times: [0, 0.25, 0.45, 0.65, 1] }}
        className="relative"
      >
        <svg viewBox="0 0 100 100" width="90" height="90" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="goldOutline" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FAF0D7" />
              <stop offset="50%" stopColor="#C8A75D" />
              <stop offset="100%" stopColor="#A88538" />
            </linearGradient>
            <filter id="goldGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="1.5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Shadow */}
          <path
            d="M50 82 C50 82 15 56 15 32 C15 19 25 10 37 10 C44 10 48 14 50 18 C52 14 56 10 63 10 C75 10 85 19 85 32 C85 56 50 82 50 82Z"
            fill="#5C4A3E" opacity="0.1" transform="translate(1,3)"
          />

          {/* Outer thin heart */}
          <path
            d="M50 82 C50 82 15 56 15 32 C15 19 25 10 37 10 C44 10 48 14 50 18 C52 14 56 10 63 10 C75 10 85 19 85 32 C85 56 50 82 50 82Z"
            stroke="url(#goldOutline)"
            strokeWidth="1.5"
            fill="rgba(255,250,238,0.3)"
            filter="url(#goldGlow)"
          />

          {/* Inner thinner heart */}
          <path
            d="M50 78 C50 78 19 53 19 32 C19 21 27 13 37 13 C43 13 47 16 50 20 C53 16 57 13 63 13 C73 13 81 21 81 32 C81 53 50 78 50 78Z"
            stroke="url(#goldOutline)"
            strokeWidth="0.8"
            fill="none"
            opacity="0.5"
          />

          {/* Sparkle star */}
          <path d="M30 22 Q30 25 33 25 Q30 25 30 28 Q30 25 27 25 Q30 25 30 22 Z" fill="#FFF" />
          <circle cx="30" cy="25" r="0.8" fill="#C8A75D" />

          {/* Conjunction glyph */}
          {showConjunction && (
            <text
              x="50" y="47"
              textAnchor="middle"
              dominantBaseline="middle"
              fontFamily='var(--v2-font-heading, "Cormorant Garamond", Georgia, serif)'
              fontSize="24"
              fontStyle="italic"
              fill="#000000"
              fontWeight="normal"
              style={{ userSelect: 'none' }}
            >y</text>
          )}
        </svg>
      </motion.div>
    </motion.button>
  );
}

// ─── BUTTON ──────────────────────────────────────────────────────────────────

function PremiumButton({ onClick, label = 'Abrir Invitación' }: { onClick: () => void; label?: string }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative cursor-pointer select-none group"
      style={{ padding: 0, background: 'none', border: 'none', outline: 'none' }}
      initial={{ opacity: 1, y: 0 }}
      animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.7 } }}
      whileTap={{ scale: 0.97 }}
    >
      <div className="relative px-10 py-4 overflow-hidden" style={{ minWidth: 240 }}>
        <motion.div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(135deg, rgba(197,168,128,0.12), rgba(197,168,128,0.06))' }}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: hovered ? 1 : 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        />
        <motion.div className="absolute top-0 left-0 h-px bg-[#C5A880]" animate={{ width: hovered ? '100%' : '30%' }} transition={{ duration: 0.4 }} />
        <motion.div className="absolute bottom-0 right-0 h-px bg-[#C5A880]" animate={{ width: hovered ? '100%' : '30%' }} transition={{ duration: 0.4 }} />
        <motion.div className="absolute left-0 top-0 w-px bg-[#C5A880]" animate={{ height: hovered ? '100%' : '30%' }} transition={{ duration: 0.4 }} />
        <motion.div className="absolute right-0 bottom-0 w-px bg-[#C5A880]" animate={{ height: hovered ? '100%' : '30%' }} transition={{ duration: 0.4 }} />
        <div className="absolute top-1.5 left-1.5 w-1 h-1 bg-[#C5A880] opacity-60 rounded-full" />
        <div className="absolute top-1.5 right-1.5 w-1 h-1 bg-[#C5A880] opacity-60 rounded-full" />
        <div className="absolute bottom-1.5 left-1.5 w-1 h-1 bg-[#C5A880] opacity-60 rounded-full" />
        <div className="absolute bottom-1.5 right-1.5 w-1 h-1 bg-[#C5A880] opacity-60 rounded-full" />
        <span
          className="relative z-10 flex items-center justify-center gap-3"
          style={{ fontFamily: 'Georgia, serif', color: '#4A3B2A', letterSpacing: '0.35em', fontSize: '11px', textTransform: 'uppercase' }}
        >
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
            <line x1="0" y1="4" x2="8" y2="4" stroke="#C5A880" strokeWidth="0.8" />
            <path d="M9 1 L13 4 L9 7" stroke="#C5A880" strokeWidth="0.8" fill="none" />
          </svg>
          {label}
          <svg width="14" height="8" viewBox="0 0 14 8" fill="none" style={{ transform: 'scaleX(-1)' }}>
            <line x1="0" y1="4" x2="8" y2="4" stroke="#C5A880" strokeWidth="0.8" />
            <path d="M9 1 L13 4 L9 7" stroke="#C5A880" strokeWidth="0.8" fill="none" />
          </svg>
        </span>
      </div>
    </motion.button>
  );
}

// ─── NAMES DISPLAY ────────────────────────────────────────────────────────────

function NamesDisplay({ protagonists, onHeartClick }: { protagonists: InvitationProtagonist[]; onHeartClick: () => void }) {
  const nameStyle: React.CSSProperties = {
    fontSize: 'clamp(52px, 10vw, 78px)',
    lineHeight: 1.2,
  };

  if (protagonists.length >= 2) {
    return (
      <motion.h1
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.9 }}
        className="font-calligraphy flex flex-col items-center w-full"
        style={nameStyle}
      >
        <span className="text-black glow-pulse px-10 py-2 leading-[1.3] inline-block">
          {protagonists[0].name}
        </span>
        <GoldenHeart onClick={onHeartClick} showConjunction={true} />
        <span className="text-black glow-pulse px-10 py-2 leading-[1.3] inline-block">
          {protagonists[1].name}
        </span>
      </motion.h1>
    );
  }

  return (
    <motion.h1
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.9 }}
      className="font-calligraphy flex flex-col items-center w-full"
      style={nameStyle}
    >
      <span className="text-black glow-pulse px-10 py-2 leading-[1.3] inline-block">
        {protagonists[0]?.name ?? ''}
      </span>
      <GoldenHeart onClick={onHeartClick} showConjunction={false} />
    </motion.h1>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function CinematicIntro({
  protagonists,
  subtitle,
  eventDate,
  theme,
  onEnter,
  introTitle,
  introSubtitle,
  introButtonText,
}: CinematicIntroProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const isOpeningRef = useRef(false);
  const containerRef    = useRef<HTMLDivElement>(null);
  const contentRef      = useRef<HTMLDivElement>(null);
  const leftCurtainRef  = useRef<HTMLDivElement>(null);
  const rightCurtainRef = useRef<HTMLDivElement>(null);

  const formattedDate = formatEventDate(eventDate);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (contentRef.current) {
      gsap.set(contentRef.current, { opacity: 1, scale: 1, y: 0 });
    }
    if (leftCurtainRef.current && rightCurtainRef.current) {
      gsap.set([leftCurtainRef.current, rightCurtainRef.current], { xPercent: 0 });
    }
    setTimeout(() => {
      (window as unknown as Record<string, { stop?: () => void }>).lenis?.stop?.();
      document.body.style.overflow = 'hidden';
    }, 50);
  }, []);

  const handleOpen = (e?: React.SyntheticEvent) => {
    if (e) {
      e.stopPropagation();
    }
    if (isOpeningRef.current) return;
    isOpeningRef.current = true;

    if (!containerRef.current || !contentRef.current) return;

    onEnter();

    if (typeof window !== 'undefined') {
      (window as unknown as Record<string, { start?: () => void }>).lenis?.start?.();
      document.body.style.overflow = '';
    }

    const colors = ['#C5A880', '#E3D9C6', '#FAF8F5', '#E5B1A8', '#8D7D64'];
    confetti({ particleCount: 80, angle: 60,  spread: 70, origin: { x: 0, y: 0.8 }, colors });
    confetti({ particleCount: 80, angle: 120, spread: 70, origin: { x: 1, y: 0.8 }, colors });
    setTimeout(() => confetti({ particleCount: 100, spread: 100, origin: { x: 0.5, y: 0.65 }, colors }), 250);

    const tl = gsap.timeline({ onComplete: () => setIsDismissed(true) });
    tl.to(contentRef.current, { opacity: 0, scale: 0.95, y: -16, duration: 0.7, ease: 'power3.inOut' });

    if (leftCurtainRef.current && rightCurtainRef.current) {
      tl.to(leftCurtainRef.current,  { xPercent: -100, duration: 1.1, ease: 'power4.inOut' }, '-=0.35');
      tl.to(rightCurtainRef.current, { xPercent:  100, duration: 1.1, ease: 'power4.inOut' }, '-=1.1');
    } else {
      tl.to(containerRef.current, { opacity: 0, duration: 0.9, ease: 'power2.inOut' }, '-=0.35');
    }
  };

  if (isDismissed) return null;

  return (
    <div
      ref={containerRef}
      onClick={handleOpen}
      onTouchStart={handleOpen}
      className="fixed inset-0 z-[9999] overflow-y-auto cursor-pointer"
    >
      {/* Curtains — fixed to the viewport, behind scrollable content */}
      <div ref={leftCurtainRef}  className={`fixed inset-y-0 left-0 w-1/2 ${theme.bodyBg} border-r ${theme.cardBorder}`} />
      <div ref={rightCurtainRef} className={`fixed inset-y-0 right-0 w-1/2 ${theme.bodyBg}`} />

      {/*
        Centering wrapper: min-h-full so it fills the viewport when content is short
        (flex centering works), but grows taller when content overflows (scroll works).
        This avoids the classic overflow-y:auto + flex:center issue where the top
        of overflowing centered content ends up above y=0 and is unreachable.
      */}
      <div
        className="relative min-h-full flex items-start justify-center"
        style={{ paddingTop: 'max(80px, env(safe-area-inset-top, 0px) + 80px)', paddingBottom: 'clamp(24px, 6vh, 64px)' }}
      >

      {/* Content */}
      <div ref={contentRef} className="relative z-20 max-w-lg w-full px-6 text-center flex flex-col items-center select-none">

        {/* Decorative ornament top */}
        <motion.div
          initial={{ opacity: 0.55, y: 0 }}
          animate={{ opacity: 0.55, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-4"
        >
          <svg width="60" height="28" viewBox="0 0 60 28" fill="none">
            <line x1="0"  y1="14" x2="22" y2="14" stroke="#C5A880" strokeWidth="0.7" />
            <path d="M25 5 L30 14 L25 23 L28 14Z" fill="#C5A880" opacity="0.7" />
            <path d="M35 5 L30 14 L35 23 L32 14Z" fill="#C5A880" opacity="0.7" />
            <line x1="38" y1="14" x2="60" y2="14" stroke="#C5A880" strokeWidth="0.7" />
          </svg>
        </motion.div>

        <motion.p
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className={`text-xs uppercase tracking-[0.25em] mb-8 ${theme.accentText} ${theme.bodyFont}`}
          style={{
            lineHeight: 1.35,
            paddingTop: '0.25em',
            paddingBottom: '0.25em',
            overflow: 'visible',
            display: 'block',
          }}
        >
          {introTitle ?? 'Estás Invitado a Celebrar'}
        </motion.p>

        {/* Names — layout adapts to 1 or 2 protagonists */}
        <NamesDisplay protagonists={protagonists} onHeartClick={handleOpen} />

        {/* Subtítulo — editable via IntroInspector; fallback to invitation.subtitle if set */}
        {(() => {
          const display = introSubtitle || (subtitle && subtitle !== 'NINGUNO' ? subtitle : '');
          return display ? (
            <motion.p
              initial={{ opacity: 0.7 }}
              animate={{ opacity: 0.7 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className={`text-xs tracking-[0.2em] uppercase mt-4 ${theme.bodyText} ${theme.bodyFont}`}
            >
              {display}
            </motion.p>
          ) : null;
        })()}

        <motion.div
          initial={{ opacity: 0.2, scaleX: 1 }}
          animate={{ opacity: 0.2, scaleX: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="h-px w-24 bg-current mt-6 mb-5"
        />

        {/* Date */}
        <motion.p
          initial={{ opacity: 0.75 }}
          animate={{ opacity: 0.75 }}
          transition={{ duration: 0.7, delay: 0.15 }}
          className={`text-sm tracking-widest uppercase mb-6 ${theme.bodyText} ${theme.bodyFont}`}
        >
          {formattedDate}
        </motion.p>

        <PremiumButton onClick={handleOpen} label={introButtonText ?? 'Abrir Invitación'} />

        <motion.p
          initial={{ opacity: 0.45 }}
          animate={{ opacity: 0.45 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-5 text-[10px] tracking-[0.25em] uppercase font-medium"
          style={{ color: '#8A7665', fontFamily: 'var(--v2-font-body, inherit)' }}
        >
          {protagonists.length >= 2 ? 'o toca el corazón para entrar' : 'toca el corazón para entrar'}
        </motion.p>


      </div>
      </div>{/* end centering wrapper */}
    </div>
  );
}
