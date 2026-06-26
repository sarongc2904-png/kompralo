'use client';

import React, { useRef } from 'react';
import { Theme } from '@/domain/themes/types';
import { TimelineEvent } from '@/domain/invitations/types';
import { motion, useScroll } from 'framer-motion';
import { Heart } from 'lucide-react';
import SectionShell from './SectionShell';
import SectionHeader from './SectionHeader';
import { EditableText } from '@/components/visual-editor/EditableText';

interface TimelineProps {
  events: TimelineEvent[];
  theme: Theme;
  editablePreview?: boolean;
}

// ── Mobile single-column item ─────────────────────────────────────────────────
function MobileItem({
  event, index, total, theme, editablePreview,
}: {
  event: TimelineEvent;
  index: number;
  total: number;
  theme: Theme;
  editablePreview: boolean;
}) {
  return (
    <motion.div
      className="relative flex gap-5"
      initial={{ opacity: 0, x: -14 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ duration: 0.5, ease: 'easeOut', delay: index * 0.07 }}
    >
      {/* Left column: heart + connector line */}
      <div className="relative flex shrink-0 flex-col items-center">
        {/* Heart circle */}
        <div
          className="z-10 flex h-9 w-9 items-center justify-center rounded-full shadow-sm"
          style={{
            border: `1px solid var(--v2-color-border, rgba(200, 167, 93, 0.25))`,
            background: 'var(--v2-surface-elevated, #FFFDF8)',
            color: `var(--v2-color-accent, #C8A75D)`,
          }}
          aria-hidden="true"
        >
          <Heart className="h-3.5 w-3.5 fill-current" strokeWidth={1} />
        </div>

        {/* Vertical connector */}
        {index < total - 1 && (
          <motion.div
            initial={{ scaleY: 0 }}
            whileInView={{ scaleY: 1 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="mt-2 w-[1.5px] flex-1 origin-top rounded-full"
            style={{
              minHeight: '64px',
              background: `linear-gradient(to bottom, var(--v2-color-accent, #C8A75D) 0%, rgba(200,167,93,0.15) 75%, transparent 100%)`,
            }}
            aria-hidden="true"
          />
        )}
      </div>

      {/* Right column: text */}
      <div className="min-w-0 pb-8">
        {event.year && (
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-medium tracking-widest font-mono mb-2"
            style={{
              background: 'var(--v2-color-accent-soft, rgba(200, 167, 93, 0.10))',
              border: '1px solid var(--v2-color-border, rgba(200, 167, 93, 0.25))',
              color: 'var(--v2-color-accent, #C8A75D)',
            }}
          >
            <EditableText value={event.year} fieldPath={`timeline.${index}.year`} isEditable={editablePreview} />
          </span>
        )}

        <h4
          className={`mt-1 text-lg font-normal tracking-wide leading-snug ${theme.headingFont}`}
          style={{ fontFamily: 'var(--v2-font-heading, inherit)', color: 'var(--v2-color-text-primary, #1F1A16)' }}
        >
          <EditableText value={event.title} fieldPath={`timeline.${index}.title`} isEditable={editablePreview} />
        </h4>

        <p
          className={`mt-2 text-sm leading-relaxed ${theme.bodyFont}`}
          style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)', opacity: 0.85 }}
        >
          <EditableText value={event.description} fieldPath={`timeline.${index}.description`} isEditable={editablePreview} />
        </p>
      </div>
    </motion.div>
  );
}

// ── Desktop alternating item ───────────────────────────────────────────────────
function DesktopItem({
  event, index, theme, editablePreview,
}: {
  event: TimelineEvent;
  index: number;
  theme: Theme;
  editablePreview: boolean;
}) {
  const isEven = index % 2 === 0;

  return (
    <div className={`relative flex flex-row ${isEven ? 'flex-row-reverse' : ''} items-center`}>
      {/* Pulsing heart marker */}
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex items-center justify-center">
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        >
          <motion.div
            animate={{ scale: [1, 1.06, 1, 1.06, 1] }}
            transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut', repeatDelay: 1 }}
            className="w-9 h-9 rounded-full flex items-center justify-center shadow-sm"
            style={{
              border: `1px solid var(--v2-color-border, rgba(200, 167, 93, 0.28))`,
              background: 'var(--v2-surface-elevated, #FFFDF8)',
              color: `var(--v2-color-accent, #C8A75D)`,
            }}
          >
            <Heart className="w-3.5 h-3.5 fill-current" strokeWidth={1} />
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
          {event.year && (
            <span
              className="inline-block px-3 py-1 rounded-full text-xs font-medium tracking-widest font-mono mb-3"
              style={{
                background: 'var(--v2-color-accent-soft, rgba(200, 167, 93, 0.10))',
                border: '1px solid var(--v2-color-border, rgba(200, 167, 93, 0.25))',
                color: 'var(--v2-color-accent, #C8A75D)',
              }}
            >
              <EditableText value={event.year} fieldPath={`timeline.${index}.year`} isEditable={editablePreview} />
            </span>
          )}

          <h4
            className={`text-xl font-normal mb-3 tracking-wide ${theme.headingFont}`}
            style={{ fontFamily: 'var(--v2-font-heading, inherit)', color: 'var(--v2-color-text-primary, #1F1A16)' }}
          >
            <EditableText value={event.title} fieldPath={`timeline.${index}.title`} isEditable={editablePreview} />
          </h4>

          <p
            className={`text-sm leading-relaxed max-w-sm ${isEven ? 'ml-auto mr-0' : 'mr-auto ml-0'} ${theme.bodyFont}`}
            style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)', opacity: 0.85 }}
          >
            <EditableText value={event.description} fieldPath={`timeline.${index}.description`} isEditable={editablePreview} />
          </p>
        </div>
      </motion.div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function Timeline({ events, theme, editablePreview = false }: TimelineProps) {
  const desktopRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: desktopRef,
    offset: ['start center', 'end center'],
  });

  if (!events || events.length === 0) return null;

  return (
    <SectionShell variant="alt" className="select-none" contentClassName="max-w-4xl mx-auto">
      {/* Section header */}
      <SectionHeader 
        eyebrow="Nuestra Historia" 
        title="Línea del Tiempo" 
        theme={theme}
        className="mb-16 md:mb-24"
      />

      {/* ── MOBILE layout (block on < md, hidden on ≥ md) ── */}
      <div className="block md:hidden">
        {events.map((event, index) => (
          <MobileItem
            key={event.id}
            event={event}
            index={index}
            total={events.length}
            theme={theme}
            editablePreview={editablePreview}
          />
        ))}
      </div>

      {/* ── DESKTOP layout (hidden on < md, block on ≥ md) ── */}
      <div ref={desktopRef} className="relative hidden md:block">
        {/* Top Line End Ornament */}
        <div 
          className="absolute left-1/2 -top-1.5 -translate-x-1/2 z-10 w-3 h-3 rounded-full"
          style={{
            background: 'var(--v2-color-accent, #C5A880)',
            border: '2.5px solid var(--v2-background-main, #FBF7EF)',
            boxShadow: '0 0 0 1px var(--v2-color-border, rgba(200,167,93,0.35))',
          }}
        />

        {/* Static faint background line */}
        <div
          className="absolute left-1/2 top-2 bottom-2 w-[1px] -translate-x-1/2 z-0"
          style={{ background: `var(--v2-color-border, rgba(200, 167, 93, 0.25))` }}
        />
        {/* Animated growing accent line */}
        <motion.div
          style={{ scaleY: scrollYProgress, originY: 0, background: `var(--v2-color-accent, #C8A75D)` }}
          className="absolute left-1/2 top-2 bottom-2 w-[1.5px] -translate-x-1/2 z-0"
        />

        {/* Bottom Line End Ornament */}
        <div 
          className="absolute left-1/2 -bottom-1.5 -translate-x-1/2 z-10 w-3 h-3 rounded-full"
          style={{
            background: 'var(--v2-color-accent, #C5A880)',
            border: '2.5px solid var(--v2-background-main, #FBF7EF)',
            boxShadow: '0 0 0 1px var(--v2-color-border, rgba(200,167,93,0.35))',
          }}
        />

        <div className="space-y-24">
          {events.map((event, index) => (
            <DesktopItem
              key={event.id}
              event={event}
              index={index}
              theme={theme}
              editablePreview={editablePreview}
            />
          ))}
        </div>
      </div>
    </SectionShell>
  );
}
