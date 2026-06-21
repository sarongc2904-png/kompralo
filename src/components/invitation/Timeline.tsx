'use client';

import React, { useRef } from 'react';
import { Theme } from '@/domain/themes/types';
import { TimelineEvent } from '@/domain/invitations/types';
import { motion, useScroll } from 'framer-motion';
import { Heart } from 'lucide-react';

interface TimelineProps {
  events: TimelineEvent[];
  theme: Theme;
}

// ── Mobile single-column item ─────────────────────────────────────────────────
// Heart lives in normal flow (not absolute), so it's always visible.

function MobileItem({
  event, index, total, theme,
}: {
  event: TimelineEvent;
  index: number;
  total: number;
  theme: Theme;
}) {
  return (
    <motion.div
      className="relative flex gap-4"
      initial={{ opacity: 0, x: -14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.07 }}
    >
      {/* Left column: heart + connector line */}
      <div className="relative flex shrink-0 flex-col items-center">
        {/* Heart circle — always in the DOM, no opacity:0 initial state */}
        <div
          className="z-10 flex h-10 w-10 items-center justify-center rounded-full shadow-md"
          style={{
            border: `1px solid var(--v2-color-border, #EDE8DF)`,
            background: 'var(--v2-glass-bg, #FFFAF3)',
            color: `var(--v2-color-accent, #C5A880)`,
          }}
          aria-hidden="true"
        >
          <Heart className="h-4 w-4 fill-current" strokeWidth={0} />
        </div>

        {/* Vertical connector — only between items, not after the last */}
        {index < total - 1 && (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mt-2 w-[2px] flex-1 origin-top rounded-full"
            style={{
              minHeight: '64px',
              background: `linear-gradient(to bottom, var(--v2-color-accent, #c9a24f) 0%, var(--v2-color-accent, #c9a24f) 65%, transparent 100%)`,
              opacity: 0.65,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Right column: text */}
      <div className="min-w-0 pb-10">
        <span
          className="text-xs font-semibold tracking-widest font-mono"
          style={{ color: `var(--v2-color-accent, #C5A880)` }}
        >
          {event.year}
        </span>

        <h4
          className={`mt-1 text-lg font-light tracking-wide leading-snug ${theme.headingFont}`}
          style={{ fontFamily: 'var(--v2-font-heading, inherit)', color: 'var(--v2-color-text-primary, inherit)' }}
        >
          {event.title}
        </h4>

        <p
          className={`mt-2 text-sm leading-relaxed ${theme.bodyFont}`}
          style={{ color: 'var(--v2-color-text-secondary, inherit)', opacity: 0.85 }}
        >
          {event.description}
        </p>
      </div>
    </motion.div>
  );
}

// ── Desktop alternating item ───────────────────────────────────────────────────

function DesktopItem({
  event, index, theme,
}: {
  event: TimelineEvent;
  index: number;
  theme: Theme;
}) {
  const isEven = index % 2 === 0;

  return (
    <div className={`relative flex flex-row ${isEven ? 'flex-row-reverse' : ''} items-center`}>
      {/* Pulsing heart marker — centered on the dividing line */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.div
            animate={{ scale: [1, 1.15, 1, 1.15, 1] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut', repeatDelay: 0.8 }}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center shadow-md"
            style={{
              borderWidth: '1px',
              borderStyle: 'solid',
              borderColor: `var(--v2-color-border, #EDE8DF)`,
              color: `var(--v2-color-accent, #C5A880)`,
            }}
          >
            <Heart className="w-4 h-4 fill-current" strokeWidth={1} />
          </motion.div>
        </motion.div>
      </div>

      {/* Empty spacer half */}
      <div className="w-1/2" />

      {/* Content half */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className={`w-1/2 ${isEven ? 'pl-4 pr-16' : 'pl-16 pr-4'}`}
      >
        <div className={isEven ? 'text-right' : 'text-left'}>
          <span
            className={`inline-block text-sm font-semibold tracking-widest font-mono mb-2 ${theme.accentText}`}
          >
            {event.year}
          </span>

          <h4
            className={`text-xl font-light mb-3 tracking-wide ${theme.headingFont}`}
            style={{ fontFamily: 'var(--v2-font-heading, inherit)', color: 'var(--v2-color-text-primary, inherit)' }}
          >
            {event.title}
          </h4>

          <p
            className={`text-sm leading-relaxed max-w-sm ${isEven ? 'ml-auto mr-0' : 'mr-auto ml-0'} ${theme.bodyFont}`}
            style={{ color: 'var(--v2-color-text-secondary, inherit)', opacity: 0.85 }}
          >
            {event.description}
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function Timeline({ events, theme }: TimelineProps) {
  const desktopRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: desktopRef,
    offset: ['start center', 'end center'],
  });

  if (!events || events.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-6 md:px-8 bg-transparent select-none">
      <div className="max-w-4xl mx-auto">

        {/* Section header */}
        <div className="text-center mb-16 md:mb-24">
          <p className={`text-xs uppercase tracking-[0.25em] mb-3 ${theme.accentText} ${theme.bodyFont}`}>
            Nuestra Historia
          </p>
          <h3
            className={`text-3xl md:text-4xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}
            style={{ fontFamily: 'var(--v2-font-heading, inherit)' }}
          >
            Línea del Tiempo
          </h3>
          <div
            className="w-12 mx-auto mt-6"
            aria-hidden="true"
            style={{ height: '1px', background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }}
          />
        </div>

        {/* ── MOBILE layout (block on < md, hidden on ≥ md) ── */}
        <div className="block md:hidden">
          {events.map((event, index) => (
            <MobileItem
              key={event.id}
              event={event}
              index={index}
              total={events.length}
              theme={theme}
            />
          ))}
        </div>

        {/* ── DESKTOP layout (hidden on < md, block on ≥ md) ── */}
        <div ref={desktopRef} className="relative hidden md:block">
          {/* Static faint background line */}
          <div
            className="absolute left-1/2 top-0 bottom-0 w-[1px] -translate-x-1/2 z-0"
            style={{ background: `var(--v2-color-border, #EDE8DF)` }}
          />
          {/* Animated growing accent line */}
          <motion.div
            style={{ scaleY: scrollYProgress, originY: 0, background: `var(--v2-color-accent, #C5A880)` }}
            className="absolute left-1/2 top-0 bottom-0 w-[2px] -translate-x-1/2 z-0"
          />

          <div className="space-y-24">
            {events.map((event, index) => (
              <DesktopItem
                key={event.id}
                event={event}
                index={index}
                theme={theme}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
