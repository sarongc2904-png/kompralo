'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '@/domain/themes/types';
import { InvitationProtagonist, StorySlide } from '@/domain/invitations/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface StoryBookProps {
  slides: StorySlide[];
  theme: Theme;
  protagonists?: InvitationProtagonist[];
  brideName?: string;
  groomName?: string;
}

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function FloralDivider({ color = 'var(--v2-color-accent, #C5A880)' }: { color?: string }) {
  return (
    <svg width="120" height="22" viewBox="0 0 120 22" fill="none" className="mx-auto my-3 opacity-55">
      <line x1="0" y1="11" x2="48" y2="11" stroke={color} strokeWidth="0.8" />
      <path d="M54 3 C57 8 63 8 66 3 C63 9 57 9 54 3Z" fill={color} opacity="0.85" />
      <circle cx="60" cy="11" r="2.5" fill={color} />
      <path d="M54 19 C57 14 63 14 66 19 C63 13 57 13 54 19Z" fill={color} opacity="0.85" />
      <line x1="72" y1="11" x2="120" y2="11" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ─── BOOK COVER ───────────────────────────────────────────────────────────────

function BookCover({ brideName, groomName, onClick, theme }: {
  brideName: string;
  groomName: string;
  onClick: () => void;
  theme: Theme;
}) {
  return (
    <motion.div
      className="cursor-pointer group select-none flex flex-col items-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.5 } }}
      onClick={onClick}
    >
      {/* 3D Book */}
      <div style={{ perspective: '1200px' }}>
        <motion.div
          className="relative"
          style={{ width: 260, height: 360, transformStyle: 'preserve-3d' }}
          animate={{ rotateY: -14, rotateX: 4 }}
          transition={{ duration: 0 }}
          whileHover={{ rotateY: -6, rotateX: 2, transition: { duration: 0.45 } }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* ── FRONT COVER ── */}
            <div
              className="absolute inset-0 overflow-hidden"
              style={{
                background: theme.textures.leather || 'linear-gradient(145deg, #2e1b0e 0%, #4d2b18 30%, #3b2010 65%, #1f100a 100%)',
                boxShadow: '-12px 14px 50px rgba(0,0,0,0.75), -4px 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <div className="absolute inset-0 opacity-[0.035]" style={{ backgroundImage: NOISE_SVG }} />
              <div className="absolute inset-4 border border-[#D4AF37]/22 pointer-events-none" />
              <div className="absolute inset-[22px] border border-[#D4AF37]/10 pointer-events-none" />

              {['top-4 left-4', 'top-4 right-4', 'bottom-4 left-4', 'bottom-4 right-4'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-4 h-4 opacity-30`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d={i < 2 ? (i === 0 ? 'M0 8 L0 0 L8 0' : 'M8 0 L16 0 L16 8') : (i === 2 ? 'M0 8 L0 16 L8 16' : 'M8 16 L16 16 L16 8')}
                      stroke="#D4AF37" strokeWidth="0.8" />
                  </svg>
                </div>
              ))}

              <div className="absolute top-9 left-1/2 -translate-x-1/2">
                <svg width="100" height="20" viewBox="0 0 100 20" fill="none">
                  <line x1="0" y1="10" x2="36" y2="10" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5" />
                  <path d="M40 2 L50 10 L40 18 L44 10Z" fill="#D4AF37" opacity="0.5" />
                  <path d="M60 2 L50 10 L60 18 L56 10Z" fill="#D4AF37" opacity="0.5" />
                  <line x1="64" y1="10" x2="100" y2="10" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5" />
                </svg>
              </div>

              <div className="absolute inset-0 flex flex-col items-center justify-center px-8 text-center">
                <p
                  className="text-[30px] italic tracking-wide leading-tight mb-3"
                  style={{
                    color: `var(--v2-color-accent, ${theme.colors.accent || '#D4AF37'})`,
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    textShadow: '0 0 24px rgba(212,175,55,0.3), 0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {brideName} & {groomName}
                </p>
                <div className="w-14 h-px bg-[#D4AF37] opacity-35 mb-3" />
                <p
                  className="text-[10.5px] tracking-[0.28em] uppercase opacity-65"
                  style={{ fontFamily: 'Georgia, serif', color: `var(--v2-color-accent, ${theme.colors.accent})` }}
                >
                  Así comienza nuestra historia
                </p>
              </div>

              <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                <svg width="70" height="20" viewBox="0 0 70 20" fill="none">
                  <path d="M8 10 Q35 2 62 10 Q35 18 8 10Z" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.42" />
                  <circle cx="35" cy="10" r="2" fill="#D4AF37" opacity="0.5" />
                </svg>
              </div>

              <p className="absolute bottom-5 w-full text-center text-[8.5px] tracking-[0.3em] uppercase transition-all duration-500 opacity-40 group-hover:opacity-70" style={{ color: `var(--v2-color-accent, ${theme.colors.accent})` }}>
                ✦ Abrir el libro ✦
              </p>
            </div>

            {/* ── SPINE ── */}
            <div
              className="absolute top-0 left-0 w-[18px] h-full"
              style={{
                background: 'linear-gradient(to right, #0c0704, #2a1a0e)',
                transform: 'rotateY(-90deg)',
                transformOrigin: 'right center',
              }}
            />

            {/* ── PAGES STACK ── */}
            <div
              className="absolute top-[3px] right-0 w-[15px] h-[calc(100%-6px)]"
              style={{
                background: 'repeating-linear-gradient(to bottom, #f5f0e7, #ece7d5 1.5px, #f8f4ec 3px)',
                transform: 'rotateY(90deg)',
                transformOrigin: 'left center',
              }}
            />

            {/* ── SHADOW ── */}
            <div
              className="absolute -bottom-5 left-1/2 -translate-x-1/2 w-[86%] h-5 pointer-events-none"
              style={{
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
                filter: 'blur(7px)',
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.p
        className="mt-8 text-[10px] tracking-[0.3em] uppercase"
        style={{ color: `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`, fontFamily: 'Georgia, serif' }}
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        Haz clic para abrir
      </motion.p>
    </motion.div>
  );
}

// ─── IMAGE PAGE ───────────────────────────────────────────────────────────────
// The image is double-contained: outer box controls size/aspect, inner box
// clips and rounds the image. The image NEVER escapes to the text page.

function ImagePage({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  return (
    <div
      className="
        relative w-full
        aspect-[4/5] md:aspect-auto md:min-h-[520px]
        overflow-hidden
        rounded-t-2xl md:rounded-l-none md:rounded-r-none
        bg-stone-900
        flex items-center justify-center
        p-2 md:p-0
      "
    >
      {/* Inner image container — strictly bounded, never bleeds */}
      <div className="relative w-full h-full min-h-[280px] md:min-h-[520px] overflow-hidden">
        <Image
          src={imageUrl}
          alt={alt || 'Nuestra historia'}
          fill
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-contain object-top md:object-cover md:object-center"
          style={{ filter: 'sepia(0.18) contrast(0.97) brightness(0.96)' }}
        />
        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
        {/* Spine shadow — desktop only, on the right edge toward the center fold */}
        <div className="hidden md:block absolute top-0 right-0 w-12 h-full bg-gradient-to-r from-transparent to-black/14 pointer-events-none" />
        {/* Paper overlay */}
        <div className="absolute inset-0 opacity-[0.025] mix-blend-multiply pointer-events-none" style={{ backgroundImage: NOISE_SVG }} />
      </div>
    </div>
  );
}

// ─── TEXT PAGE ────────────────────────────────────────────────────────────────
// Pure text — no image, no background-image, no overflow from ImagePage.

function TextPage({ slide, pageNum, theme }: {
  slide: StorySlide;
  pageNum: number;
  theme: Theme;
}) {
  return (
    <div
      className="
        relative w-full
        min-h-[280px] md:min-h-[520px]
        flex flex-col justify-center
        overflow-hidden
        rounded-b-2xl md:rounded-l-none md:rounded-r-none
      "
      style={{
        background: `var(--v2-background-story, ${theme.backgrounds.storyBook || 'linear-gradient(135deg, #fdf9f0 0%, #f5efdd 50%, #ede7d2 100%)'})`,
        padding: '36px 32px 36px 32px',
      }}
    >
      {/* Paper grain */}
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: NOISE_SVG }} />

      {/* Double border frame */}
      <div className="absolute inset-3 border pointer-events-none" style={{ borderColor: theme.borders.subtle }} />
      <div className="absolute inset-[13px] border pointer-events-none opacity-40" style={{ borderColor: theme.borders.subtle }} />

      {/* Spine shadow — desktop only, on the left edge toward the center fold */}
      <div className="hidden md:block absolute top-0 left-0 w-12 h-full bg-gradient-to-l from-transparent to-black/08 pointer-events-none" />

      {/* Aged vignette */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 48%, rgba(139,115,85,0.05) 100%)' }}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        <FloralDivider />

        <h4
          className="text-xl md:text-2xl font-light italic tracking-wide mb-4 leading-snug"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: `var(--v2-color-text-primary, ${theme.colors.textPrimary})` }}
        >
          {slide.title}
        </h4>

        <div className="w-8 h-px mx-auto mb-4 opacity-55" style={{ background: `var(--v2-color-accent, ${theme.colors.accent})` }} />

        <p
          className="text-[13px] md:text-sm leading-relaxed text-justify opacity-90"
          style={{ fontFamily: 'Georgia, serif', color: `var(--v2-color-text-primary, ${theme.colors.textPrimary})` }}
        >
          {slide.text}
        </p>

        <FloralDivider />
      </div>

      {/* Page number */}
      <p className="absolute bottom-4 left-1/2 -translate-x-1/2 text-[8px] tracking-[0.22em] opacity-45 font-mono" style={{ color: `var(--v2-color-text-secondary, ${theme.colors.textSecondary})` }}>
        {pageNum}
      </p>
    </div>
  );
}

// ─── FINAL SPREAD ─────────────────────────────────────────────────────────────

function FinalSpread({ brideName, groomName, theme }: { brideName: string; groomName: string; theme: Theme }) {
  return (
    <div
      className="relative w-full min-h-[380px] md:min-h-[520px] flex items-center justify-center overflow-hidden"
      style={{ background: `var(--v2-background-final, ${theme.backgrounds.final || 'linear-gradient(135deg, #fdf9ef 0%, #f0eadb 50%, #e7e0ce 100%)'})` }}
    >
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: NOISE_SVG }} />
      <div className="absolute inset-4 border pointer-events-none" style={{ borderColor: theme.borders.subtle }} />
      <div className="absolute inset-7 border pointer-events-none opacity-45" style={{ borderColor: theme.borders.subtle }} />

      <div className="relative z-10 text-center px-10 max-w-lg mx-auto">
        <svg width="140" height="28" viewBox="0 0 140 28" fill="none" className="mx-auto mb-7 opacity-48">
          <line x1="0" y1="14" x2="53" y2="14" stroke={`var(--v2-color-accent, ${theme.colors.accent})`} strokeWidth="0.8" />
          <path d="M58 4 L70 14 L58 24 L62 14Z" fill={`var(--v2-color-accent, ${theme.colors.accent})`} opacity="0.7" />
          <path d="M82 4 L70 14 L82 24 L78 14Z" fill={`var(--v2-color-accent, ${theme.colors.accent})`} opacity="0.7" />
          <line x1="87" y1="14" x2="140" y2="14" stroke={`var(--v2-color-accent, ${theme.colors.accent})`} strokeWidth="0.8" />
        </svg>

        <p className="text-[9px] tracking-[0.38em] uppercase mb-5 font-mono" style={{ color: `var(--v2-color-text-secondary, ${theme.colors.textSecondary})` }}>
          Último capítulo
        </p>

        <h3
          className="text-[26px] font-light italic leading-snug mb-5"
          style={{ fontFamily: 'Georgia, "Times New Roman", serif', color: `var(--v2-color-text-primary, ${theme.colors.textPrimary})` }}
        >
          Hoy comienza<br />nuestro mayor capítulo
        </h3>

        <div className="w-10 h-px mx-auto mb-5 opacity-55" style={{ background: `var(--v2-color-accent, ${theme.colors.accent})` }} />

        <p
          className="text-[13.5px] leading-relaxed opacity-80 italic"
          style={{ fontFamily: 'Georgia, serif', color: `var(--v2-color-text-primary, ${theme.colors.textPrimary})` }}
        >
          Gracias por ser parte de nuestra historia.
        </p>

        <div className="mt-8">
          <p
            className="text-[22px] italic"
            style={{
              color: `var(--v2-color-accent, ${theme.colors.accent})`,
              fontFamily: 'Georgia, serif',
              textShadow: '0 0 20px rgba(197,168,128,0.22)',
            }}
          >
            {brideName} & {groomName}
          </p>
        </div>

        <svg width="100" height="22" viewBox="0 0 100 22" fill="none" className="mx-auto mt-8 opacity-38">
          <path d="M10 11 Q50 3 90 11 Q50 19 10 11Z" fill="none" stroke={`var(--v2-color-accent, ${theme.colors.accent})`} strokeWidth="0.8" />
          <circle cx="50" cy="11" r="2.5" fill={`var(--v2-color-accent, ${theme.colors.accent})`} />
        </svg>
      </div>

      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(ellipse at center, transparent 44%, rgba(139,115,85,0.05) 100%)' }}
      />
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function StoryBook({ protagonists, slides, theme, brideName, groomName }: StoryBookProps) {
  const primaryName   = protagonists?.[0]?.name ?? brideName ?? 'Sofía';
  const secondaryName = protagonists?.[1]?.name ?? groomName ?? 'Alejandro';

  const [phase, setPhase] = useState<'closed' | 'open'>('closed');
  const [spread, setSpread] = useState(0);
  const [dir, setDir]       = useState(1);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalSpreads  = slides.length + 1;
  const isFinal       = spread >= slides.length;
  const currentSlide  = !isFinal ? slides[spread] : null;
  const imageOnLeft   = spread % 2 === 0;
  const pageNum       = spread * 2 + 1;

  const clearAuto = () => { if (autoRef.current) clearTimeout(autoRef.current); };

  const scheduleAuto = useCallback((currentSpread: number) => {
    clearAuto();
    if (currentSpread < totalSpreads - 1) {
      autoRef.current = setTimeout(() => {
        setDir(1);
        setSpread(s => Math.min(s + 1, totalSpreads - 1));
      }, 5200);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalSpreads]);

  useEffect(() => {
    if (phase === 'open') scheduleAuto(spread);
    return clearAuto;
  }, [phase, spread, scheduleAuto]);

  const goNext = () => {
    if (spread < totalSpreads - 1) { clearAuto(); setDir(1); setSpread(s => s + 1); }
  };
  const goPrev = () => {
    if (spread > 0) { clearAuto(); setDir(-1); setSpread(s => s - 1); }
    else { clearAuto(); setPhase('closed'); setSpread(0); }
  };
  const goTo = (i: number) => {
    if (i === spread) return;
    clearAuto(); setDir(i > spread ? 1 : -1); setSpread(i);
  };

  // Page-turn: simple fade + slight scale. No rotateY to avoid 3D bleed between columns.
  const spreadVariants = {
    enter: (_d: number) => ({ opacity: 0, scale: 0.98 }),
    center: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] },
    },
    exit: (_d: number) => ({
      opacity: 0,
      scale: 0.98,
      transition: { duration: 0.35, ease: [0.55, 0, 1, 0.45] as [number, number, number, number] },
    }),
  };

  return (
    <section className="relative py-20 px-4 flex flex-col items-center justify-center overflow-hidden">
      <AnimatePresence mode="wait">
        {phase === 'closed' ? (
          <motion.div key="closed" className="flex flex-col items-center w-full">
            {/* Section header */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.6 } }}
              className="text-center mb-10"
            >
              <p className={`text-xs uppercase tracking-[0.25em] mb-2 ${theme.accentText}`}>
                Nuestra Historia
              </p>
              <h3 className={`text-3xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}>
                Capítulos de Amor
              </h3>
              <div className="w-10 h-px mx-auto mt-5" style={{ background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }} />
            </motion.div>

            <BookCover
              brideName={primaryName}
              groomName={secondaryName}
              theme={theme}
              onClick={() => setPhase('open')}
            />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } }}
            className="w-full max-w-5xl flex flex-col items-center"
          >
            {/* ── BOOK SPREAD ── */}
            {/*
              No fixed height on the outer container. The pages (ImagePage + TextPage)
              drive their own height via min-h. This prevents the image from being
              clipped or bleeding into the text column.
            */}
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{ boxShadow: theme.shadows.book }}
            >
              <AnimatePresence initial={false} custom={dir} mode="wait">
                <motion.div
                  key={`spread-${spread}`}
                  custom={dir}
                  variants={spreadVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  {isFinal ? (
                    <FinalSpread brideName={primaryName} groomName={secondaryName} theme={theme} />
                  ) : (
                    /*
                      Two-column grid on desktop, single column on mobile.
                      Each column has its own overflow-hidden — the image is
                      completely contained within ImagePage and cannot bleed.
                    */
                    <div className="relative grid grid-cols-1 md:grid-cols-2">

                      {/* Center fold line — desktop only */}
                      <div
                        className="hidden md:block pointer-events-none absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[3px] z-20"
                        style={{ background: 'linear-gradient(to bottom, rgba(26,15,8,0.25), #2a1a0e 50%, rgba(26,15,8,0.25))' }}
                      />
                      <div className="hidden md:block pointer-events-none absolute top-0 bottom-0 left-[calc(50%-1px)] w-px bg-[#D4AF37]/10 z-20" />

                      {imageOnLeft ? (
                        <>
                          <ImagePage imageUrl={currentSlide!.imageUrl} alt={currentSlide!.title} />
                          <TextPage slide={currentSlide!} pageNum={pageNum + 1} theme={theme} />
                        </>
                      ) : (
                        <>
                          <TextPage slide={currentSlide!} pageNum={pageNum} theme={theme} />
                          <ImagePage imageUrl={currentSlide!.imageUrl} alt={currentSlide!.title} />
                        </>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* ── NAVIGATION ── */}
            <div className="flex items-center justify-between w-full mt-7 px-1">
              <button
                onClick={goPrev}
                className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase cursor-pointer transition-colors"
                style={{ color: `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`, fontFamily: 'Georgia, serif' }}
                onMouseEnter={e => (e.currentTarget.style.color = `var(--v2-color-accent, ${theme.colors.accent})`)}
                onMouseLeave={e => (e.currentTarget.style.color = `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`)}
              >
                <ChevronLeft className="w-4 h-4" />
                {spread === 0 ? 'Cerrar' : 'Anterior'}
              </button>

              <div className="flex items-center gap-2">
                {Array.from({ length: totalSpreads }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => goTo(i)}
                    className="cursor-pointer transition-all rounded-full"
                    style={{
                      width: i === spread ? 20 : 6,
                      height: 6,
                      background: i === spread
                        ? `var(--v2-color-accent, ${theme.colors.accent})`
                        : `var(--v2-color-accent-soft, ${theme.colors.accentSoft})`,
                    }}
                    aria-label={`Página ${i + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={goNext}
                disabled={spread >= totalSpreads - 1}
                className="flex items-center gap-1.5 text-[10px] tracking-widest uppercase cursor-pointer transition-colors disabled:opacity-28 disabled:cursor-default"
                style={{ color: `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`, fontFamily: 'Georgia, serif' }}
                onMouseEnter={e => { if (!e.currentTarget.disabled) e.currentTarget.style.color = `var(--v2-color-accent, ${theme.colors.accent})`; }}
                onMouseLeave={e => (e.currentTarget.style.color = `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`)}
              >
                Siguiente
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <p className="mt-3 text-[8.5px] tracking-[0.22em] font-mono opacity-40" style={{ color: `var(--v2-color-text-secondary, ${theme.colors.textSecondary})` }}>
              Página {spread + 1} de {totalSpreads}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
