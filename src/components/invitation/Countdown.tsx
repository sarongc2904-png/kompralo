'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Theme } from '@/domain/themes/types';

interface CountdownProps {
  eventDate: string;
  eventTime?: string;
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
function parseEventDate(raw: string, eventTime?: string): Date | null {
  if (!raw) return null;
  const timeMatch = eventTime?.match(/(\d{1,2}):(\d{2})/);
  const datePart = raw.includes('T') ? raw.split('T')[0] : raw.split(' ')[0];
  if (timeMatch && /^\d{4}-\d{2}-\d{2}$/.test(datePart)) {
    const [, hour, minute] = timeMatch;
    const d = new Date(`${datePart}T${hour.padStart(2, '0')}:${minute}:00`);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  const normalized = raw.includes('T') ? raw : `${raw}T00:00:00`;
  const d = new Date(normalized);
  return Number.isNaN(d.getTime()) ? null : d;
}

function isEventPast(eventDate: string, eventTime?: string): boolean {
  const d = parseEventDate(eventDate, eventTime);
  if (!d) return false;
  return d.getTime() - Date.now() <= 0;
}

function getTimeLeft(eventDate: string, eventTime?: string): TimeLeft {
  const d = parseEventDate(eventDate, eventTime);
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
    color: `var(--v2-color-text-primary, #1F1A16)`,
    fontFamily: 'var(--v2-font-heading, "Cormorant Garamond", Georgia, serif)',
    fontWeight: 400, letterSpacing: '-0.02em',
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
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: isCompact ? 12 : 16, minWidth: 0 }}>
      {/* Outer frame wrapper */}
      <div 
        style={{
          padding: '6px',
          borderRadius: '14px',
          border: '1px solid var(--v2-color-border, rgba(200,167,93,0.22))',
          background: 'rgba(255,255,255,0.25)',
          boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.01), 0 2px 8px rgba(116,84,38,0.03)',
        }}
      >
        {/* Card */}
        <div style={{ position: 'relative', width: W, height: H, perspective: '600px' }}>

          {/* ── STATIC TOP (new value) ── */}
          <div style={{
            ...cardBase, top: 0, height: HALF,
            background: 'var(--v2-countdown-card-bg-top, linear-gradient(180deg, #FAF6EE 0%, #F5ECDB 100%))',
            borderRadius: '8px 8px 0 0',
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.7)',
          }}>
            {renderInnerTop(currStr)}
          </div>

          {/* ── STATIC BOTTOM (new value) ── */}
          <div style={{
            ...cardBase, bottom: 0, height: HALF,
            background: 'var(--v2-countdown-card-bg-bottom, linear-gradient(180deg, #F5ECDB 0%, #EFE3CE 100%))',
            borderRadius: '0 0 8px 8px',
            boxShadow: 'inset 0 -1px 0 rgba(0,0,0,0.01)',
          }}>
            {renderInnerBottom(currStr)}
          </div>

          {/* ── CENTER DIVIDER ── */}
          <div style={{
            position: 'absolute', top: HALF - 0.5, left: 0, width: W, height: 1,
            background: 'var(--v2-countdown-divider-color, rgba(116,84,38,0.20))', zIndex: 15,
          }} />

          {/* ── FLIP FLAPS ── */}
          {flipping && (
            <>
              {/* Old top flap → flips DOWN (0 → -90) */}
              <motion.div
                style={{
                  ...cardBase, top: 0, height: HALF,
                  background: 'var(--v2-countdown-card-bg-top, linear-gradient(180deg, #FAF6EE 0%, #F5ECDB 100%))',
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
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.02) 100%)',
                  pointerEvents: 'none',
                }} />
              </motion.div>

              {/* New bottom flap → unfolds (90 → 0, delayed) */}
              <motion.div
                style={{
                  ...cardBase, bottom: 0, height: HALF,
                  background: 'var(--v2-countdown-card-bg-bottom, linear-gradient(180deg, #F5ECDB 0%, #EFE3CE 100%))',
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
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(180deg, rgba(0,0,0,0.03) 0%, rgba(255,255,255,0.1) 100%)',
                  pointerEvents: 'none',
                }} />
              </motion.div>
            </>
          )}

          {/* Outer card shadow */}
          <div style={{
            position: 'absolute', inset: 0, borderRadius: 8, pointerEvents: 'none',
            boxShadow: 'var(--v2-shadow-soft, 0 4px 12px rgba(116,84,38,0.06), 0 12px 30px rgba(120,88,40,0.10)), inset 0 0 0 1px rgba(200,167,93,0.15)',
            zIndex: 5,
          }} />
        </div>
      </div>

      {/* Label */}
      <span style={{
        fontSize: isCompact ? 11 : 13, letterSpacing: isCompact ? '0.22em' : '0.28em', textTransform: 'uppercase',
        color: 'var(--v2-color-text-secondary, #5C4A3E)', fontFamily: 'var(--v2-font-body, inherit)', opacity: 0.85, fontWeight: 600,
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

export default function Countdown({ eventDate, eventTime, theme }: CountdownProps) {
  const hasValidDate = !!parseEventDate(eventDate, eventTime);
  const [timeLeft,    setTimeLeft]    = useState<TimeLeft>(() => getTimeLeft(eventDate, eventTime));
  const [eventPassed, setEventPassed] = useState<boolean>(() => isEventPast(eventDate, eventTime));

  useEffect(() => {
    const calc = () => {
      setTimeLeft(getTimeLeft(eventDate, eventTime));
      setEventPassed(isEventPast(eventDate, eventTime));
    };

    calc();
    const id = setInterval(calc, 1000);
    return () => clearInterval(id);
  }, [eventDate, eventTime]);

  const units = [
    { label: 'Días',     value: timeLeft.days,    max: timeLeft.days >= 100 ? 3 : 2 },
    { label: 'Horas',    value: timeLeft.hours,   max: 2 },
    { label: 'Minutos',  value: timeLeft.minutes, max: 2 },
    { label: 'Segundos', value: timeLeft.seconds, max: 2 },
  ];

  return (
    <section
      className="pt-28 pb-24 md:pt-40 md:pb-36 px-4 text-center select-none overflow-visible"
      style={{
        position: 'relative',
        zIndex: 20,
        backgroundImage: 'url(https://djztbgidfrhpkmyvhuyo.supabase.co/storage/v1/object/public/invitation-assets/backgrounds/fondo_3.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        {/* Header */}
        <p 
          className={`text-[11px] md:text-[14px] uppercase tracking-[0.35em] mb-4 ${theme.accentText} ${theme.bodyFont}`}
          style={{ color: 'var(--v2-color-accent, inherit)', opacity: 0.9 }}
        >
          {eventPassed ? 'Un Momento Especial' : 'Cuenta Regresiva'}
        </p>
        
        {/* Ornamental Divider */}
        <div className="flex items-center justify-center mb-10 text-amber-800/40" style={{ color: 'var(--v2-divider-color, var(--v2-color-accent, inherit))' }}>
          <svg className="w-28 h-4" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="8" x2="48" y2="8" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
            <path d="M60 3 L64 8 L60 13 L56 8 Z" fill="currentColor" fillOpacity="0.8" />
            <circle cx="52" cy="8" r="1.5" fill="currentColor" fillOpacity="0.5" />
            <circle cx="68" cy="8" r="1.5" fill="currentColor" fillOpacity="0.5" />
            <line x1="72" y1="8" x2="120" y2="8" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.3" />
          </svg>
        </div>

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
        <div className="flex items-center justify-center mt-12 text-amber-800/30" style={{ color: 'var(--v2-divider-color, var(--v2-color-accent, inherit))' }}>
          <svg className="w-24 h-4" viewBox="0 0 120 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <line x1="0" y1="8" x2="48" y2="8" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.2" />
            <path d="M60 5 L63 8 L60 11 L57 8 Z" fill="currentColor" fillOpacity="0.6" />
            <circle cx="52" cy="8" r="1" fill="currentColor" fillOpacity="0.4" />
            <circle cx="68" cy="8" r="1" fill="currentColor" fillOpacity="0.4" />
            <line x1="72" y1="8" x2="120" y2="8" stroke="currentColor" strokeWidth="0.75" strokeOpacity="0.2" />
          </svg>
        </div>
      </motion.div>
    </section>
  );
}
