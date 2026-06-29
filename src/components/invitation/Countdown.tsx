'use client';

import React, { useEffect, useState } from 'react';
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
      style={{ position: 'relative', zIndex: 20 }}
    >
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-center"
      >
        {/* Header label */}
        <p style={{ fontSize: 10, letterSpacing: '4px', color: 'var(--v2-color-accent, #c9a84c)', textTransform: 'uppercase', marginBottom: 12 }}>
          {eventPassed ? 'Un Momento Especial' : 'Cuenta Regresiva'}
        </p>

        {/* Gold separator line */}
        <div style={{ width: 40, height: 1, background: 'var(--v2-color-accent, #c9a84c)', margin: '0 auto 40px' }} />

        {!hasValidDate ? (
          /* ── NO VALID DATE STATE ──────────────────────────────────────── */
          <p
            className={`text-base md:text-lg font-light tracking-wide ${theme.bodyFont}`}
            style={{ color: theme.colors.textSecondary }}
          >
            Fecha por confirmar
          </p>
        ) : eventPassed ? (
          /* ── EVENT PASSED STATE ───────────────────────────────────────── */
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
          /* ── COUNTDOWN STATE ──────────────────────────────────────────── */
          <div style={{ display: 'flex', justifyContent: 'center', gap: 32, alignItems: 'flex-start', flexWrap: 'wrap' }}>
            {units.map((u, i) => (
              <React.Fragment key={u.label}>
                <div style={{ textAlign: 'center' }}>
                  <span style={{
                    fontSize: 'clamp(56px, 10vw, 96px)',
                    fontFamily: 'serif',
                    fontWeight: 300,
                    color: 'var(--v2-color-text-primary, #2c1810)',
                    lineHeight: 1,
                  }}>
                    {String(u.value).padStart(u.max, '0')}
                  </span>
                  <p style={{
                    fontSize: '10px',
                    letterSpacing: '4px',
                    color: 'var(--v2-color-text-muted, #8B6914)',
                    textTransform: 'uppercase',
                    margin: '8px 0 0',
                  }}>
                    {u.label}
                  </p>
                </div>
                {i < units.length - 1 && (
                  <span style={{ color: 'var(--v2-color-accent, #c9a84c)', fontSize: 32, lineHeight: 1, alignSelf: 'flex-start', paddingTop: 12 }}>·</span>
                )}
              </React.Fragment>
            ))}
          </div>
        )}

        {/* Footer ornament */}
        <div style={{ width: 40, height: 1, background: 'var(--v2-color-accent, #c9a84c)', margin: '40px auto 0', opacity: 0.5 }} />
      </motion.div>
    </section>
  );
}
