'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Theme } from '@/domain/themes/types';

interface CountdownProps {
  eventDate: string;
  theme: Theme;
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function useCompactCountdown() {
  const [isCompact, setIsCompact] = useState(true);

  useEffect(() => {
    const update = () => setIsCompact(window.innerWidth < 768);
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  return isCompact;
}

// Normalises YYYY-MM-DD (no time part) to midnight local time before parsing,
// so the countdown never receives NaN from a bare date string.
function parseEventDate(raw: string): Date | null {
  if (!raw) return null;
  const normalized = raw.includes('T') ? raw : `${raw}T00:00:00`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isEventPast(eventDate: string): boolean {
  const d = parseEventDate(eventDate);
  if (!d) return false;
  return d.getTime() - Date.now() <= 0;
}

function getTimeLeft(eventDate: string): TimeLeft {
  const d = parseEventDate(eventDate);
  if (!d) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const diff = d.getTime() - Date.now();
  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  return {
    days:    Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours:   Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / 1000 / 60) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

// ─── FLIP CARD ────────────────────────────────────────────────────────────────

function FlipCard({ value, label, theme, maxDigits = 2 }: { value: number; label: string; theme: Theme; maxDigits?: number }) {
  const isCompact = useCompactCountdown();
  const prevRef     = useRef(value);
  const [display,   setDisplay]   = useState(value);
  const [prev,      setPrev]      = useState(value);
  const [flipping,  setFlipping]  = useState(false);
  const flipTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value === prevRef.current) return;
    const oldVal = prevRef.current;
    prevRef.current = value;

    // Cancel any in-flight flip
    if (flipTimer.current) clearTimeout(flipTimer.current);

    setPrev(oldVal);
    setDisplay(value);   // static halves immediately show new value (masked by flap)
    setFlipping(true);

    flipTimer.current = setTimeout(() => setFlipping(false), 700);
    return () => { if (flipTimer.current) clearTimeout(flipTimer.current); };
  }, [value]);

  const fmt = (v: number) => String(v).padStart(maxDigits, '0');
  const currStr = fmt(display);
  const prevStr = fmt(prev);

  // Fixed pixel sizing is kept for the flip math; compact values prevent mobile overflow.
  const W = isCompact ? (maxDigits > 2 ? 82 : 74) : (maxDigits > 2 ? 110 : 92);
  const H = isCompact ? 92 : 116;
  const FS = isCompact ? (maxDigits > 2 ? 36 : 40) : (maxDigits > 2 ? 52 : 56);
  const HALF = H / 2;

  const cardBase: React.CSSProperties = {
    position: 'absolute', left: 0, width: W, overflow: 'hidden',
  };

  const digitStyle: React.CSSProperties = {
    fontSize: FS, lineHeight: 1,
    // V2: use accent token — resolveTheme maps champagne→editorial which has the same gold.
    color: `var(--v2-color-accent, ${theme.colors.accent})`,
    fontFamily: 'Georgia, "Times New Roman", serif',
    fontWeight: 300, letterSpacing: '-0.02em',
    userSelect: 'none', pointerEvents: 'none',
  };

  const renderInnerTop = (str: string) => (
    <div style={{ position: 'absolute', top: 0, left: 0, width: W, height: H,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={digitStyle}>{str}</span>
    </div>
  );
  const renderInnerBottom = (str: string) => (
    <div style={{ position: 'absolute', bottom: 0, left: 0, width: W, height: H,
      display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={digitStyle}>{str}</span>
    </div>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isCompact ? 10 : 14, minWidth: 0 }}>
      {/* Card */}
      <div style={{ position: 'relative', width: W, height: H, perspective: '600px' }}>

        {/* ── STATIC TOP (new value) ── */}
        <div style={{
          ...cardBase, top: 0, height: HALF,
          background: theme.textures.leather || 'linear-gradient(180deg, #2A2418 0%, #222018 100%)',
          borderRadius: '8px 8px 0 0',
          boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.06)',
        }}>
          {renderInnerTop(currStr)}
        </div>

        {/* ── STATIC BOTTOM (new value) ── */}
        <div style={{
          ...cardBase, bottom: 0, height: HALF,
          background: theme.textures.leather || 'linear-gradient(180deg, #1C1A12 0%, #161410 100%)',
          borderRadius: '0 0 8px 8px',
          boxShadow: 'inset 0 -1px 0 rgba(255,255,255,0.03)',
        }}>
          {renderInnerBottom(currStr)}
        </div>

        {/* ── CENTER DIVIDER ── */}
        <div style={{
          position: 'absolute', top: HALF - 1, left: 0, width: W, height: 2,
          background: 'rgba(0,0,0,0.7)', zIndex: 15,
        }} />

        {/* ── FLIP FLAPS ── */}
        {flipping && (
          <>
            {/* Old top flap → flips DOWN (0 → -90) */}
            <motion.div
              style={{
                ...cardBase, top: 0, height: HALF,
                background: theme.textures.leather || 'linear-gradient(180deg, #2A2418 0%, #222018 100%)',
                borderRadius: '8px 8px 0 0',
                transformOrigin: 'center bottom',
                zIndex: 30,
                backfaceVisibility: 'hidden',
              }}
              initial={{ rotateX: 0 }}
              animate={{ rotateX: -90 }}
              transition={{ duration: 0.32, ease: [0.55, 0, 1, 0.45] }}
            >
              {renderInnerTop(prevStr)}
              {/* Sheen overlay on flap */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.1) 100%)',
                pointerEvents: 'none',
              }} />
            </motion.div>

            {/* New bottom flap → unfolds (90 → 0, delayed) */}
            <motion.div
              style={{
                ...cardBase, bottom: 0, height: HALF,
                background: theme.textures.leather || 'linear-gradient(180deg, #1C1A12 0%, #161410 100%)',
                borderRadius: '0 0 8px 8px',
                transformOrigin: 'center top',
                zIndex: 30,
                backfaceVisibility: 'hidden',
              }}
              initial={{ rotateX: 90 }}
              animate={{ rotateX: 0 }}
              transition={{ duration: 0.32, ease: [0, 0.55, 0.45, 1], delay: 0.32 }}
            >
              {renderInnerBottom(currStr)}
              {/* Sheen overlay on flap */}
              <div style={{
                position: 'absolute', inset: 0,
                background: 'linear-gradient(180deg, rgba(0,0,0,0.12) 0%, rgba(255,255,255,0.03) 100%)',
                pointerEvents: 'none',
              }} />
            </motion.div>
          </>
        )}

        {/* Outer card shadow */}
        <div style={{
          position: 'absolute', inset: 0, borderRadius: 8, pointerEvents: 'none',
          boxShadow: '0 12px 40px rgba(0,0,0,0.55), 0 2px 8px rgba(0,0,0,0.4), inset 0 0 0 1px rgba(255,255,255,0.05)',
          zIndex: 5,
        }} />
      </div>

      {/* Label */}
      <span style={{
        fontSize: isCompact ? 8 : 9, letterSpacing: isCompact ? '0.18em' : '0.28em', textTransform: 'uppercase',
        color: theme.colors.textSecondary || '#7A5C35', fontFamily: 'Georgia, serif', opacity: 1, fontWeight: 600,
      }}>
        {label}
      </span>
    </div>
  );
}

// ─── SEPARATOR ────────────────────────────────────────────────────────────────

function Separator({ theme }: { theme: Theme }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, alignItems: 'center', paddingBottom: 28 }}>
      <motion.div
        animate={{ opacity: [1, 0.2, 1] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 5, height: 5, borderRadius: '50%', background: `var(--v2-color-accent, ${theme.colors.accent || '#C5A880'})` }}
      />
      <motion.div
        animate={{ opacity: [0.2, 1, 0.2] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
        style={{ width: 5, height: 5, borderRadius: '50%', background: `var(--v2-color-accent, ${theme.colors.accent || '#C5A880'})` }}
      />
    </div>
  );
}

// ─── MAIN ─────────────────────────────────────────────────────────────────────

export default function Countdown({ eventDate, theme }: CountdownProps) {
  const hasValidDate = !!parseEventDate(eventDate);
  const [timeLeft,    setTimeLeft]    = useState<TimeLeft>(() => getTimeLeft(eventDate));
  const [eventPassed, setEventPassed] = useState<boolean>(() => isEventPast(eventDate));

  useEffect(() => {
    const calc = () => {
      setTimeLeft(getTimeLeft(eventDate));
      setEventPassed(isEventPast(eventDate));
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [eventDate]);

  const units = [
    { label: 'Días',     value: timeLeft.days,    max: timeLeft.days >= 100 ? 3 : 2 },
    { label: 'Horas',    value: timeLeft.hours,   max: 2 },
    { label: 'Minutos',  value: timeLeft.minutes, max: 2 },
    { label: 'Segundos', value: timeLeft.seconds, max: 2 },
  ];

  return (
    <section className="pt-28 pb-24 md:pt-40 md:pb-36 px-4 bg-transparent text-center select-none overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        {/* Header */}
        <p className={`text-xs uppercase tracking-[0.3em] mb-3 ${theme.accentText} ${theme.bodyFont}`}>
          {eventPassed ? 'Un Momento Especial' : 'Cuenta Regresiva'}
        </p>
        <svg width="100" height="18" viewBox="0 0 100 18" fill="none" className="mb-8 md:mb-10 opacity-40">
          <line x1="0"  y1="9" x2="40" y2="9" stroke={`var(--v2-color-accent, ${theme.colors.accent})`} strokeWidth="0.7" />
          <circle cx="50" cy="9" r="3" fill={`var(--v2-color-accent, ${theme.colors.accent})`} />
          <line x1="60" y1="9" x2="100" y2="9" stroke={`var(--v2-color-accent, ${theme.colors.accent})`} strokeWidth="0.7" />
        </svg>

        {!hasValidDate ? (
          /* ── NO VALID DATE STATE ────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4 py-8"
          >
            <p
              className={`text-base md:text-lg font-light tracking-wide ${theme.bodyFont}`}
              style={{ color: theme.colors.textSecondary }}
            >
              Fecha por confirmar
            </p>
          </motion.div>
        ) : eventPassed ? (
          /* ── EVENT PASSED STATE ─────────────────────────────────────────── */
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-6 py-8"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              style={{ fontSize: 48, lineHeight: 1 }}
            >
              ♡
            </motion.div>
            <h3
              className={`text-2xl md:text-3xl font-light tracking-wide ${theme.headingFont}`}
              style={{ color: theme.colors.textPrimary }}
            >
              El gran día ya llegó
            </h3>
            <p
              className={`text-sm md:text-base opacity-70 max-w-sm leading-relaxed ${theme.bodyFont}`}
              style={{ color: theme.colors.textSecondary }}
            >
              Gracias por acompañarnos en este momento tan especial.
            </p>
          </motion.div>
        ) : (
          /* ── COUNTDOWN STATE ────────────────────────────────────────────── */
          <div className="grid w-full max-w-[360px] grid-cols-2 place-items-center gap-x-4 gap-y-7 px-1 md:flex md:max-w-none md:items-center md:justify-center md:gap-5 md:px-0">
            {units.map((u, i) => (
              <React.Fragment key={u.label}>
                <FlipCard value={u.value} label={u.label} maxDigits={u.max} theme={theme} />
                {i < units.length - 1 && (
                  <div className="hidden md:block">
                    <Separator theme={theme} />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Footer ornament */}
        <svg width="100" height="18" viewBox="0 0 100 18" fill="none" className="mt-10 opacity-30">
          <line x1="0"  y1="9" x2="40" y2="9" stroke={`var(--v2-color-accent, ${theme.colors.accent})`} strokeWidth="0.7" />
          <circle cx="50" cy="9" r="3" fill={`var(--v2-color-accent, ${theme.colors.accent})`} />
          <line x1="60" y1="9" x2="100" y2="9" stroke={`var(--v2-color-accent, ${theme.colors.accent})`} strokeWidth="0.7" />
        </svg>
      </motion.div>
    </section>
  );
}
