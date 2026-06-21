'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { ParentCouple } from '@/domain/invitations/types';
import { motion } from 'framer-motion';

interface ParentsProps {
  parents: ParentCouple[];
  theme: Theme;
}

// Ornament SVG
function Ornament({ flip = false }: { flip?: boolean }) {
  return (
    <svg
      width="80" height="24" viewBox="0 0 80 24" fill="none"
      style={{ transform: flip ? 'scaleX(-1)' : undefined, opacity: 0.55, color: `var(--v2-color-accent, #C5A880)` }}
      aria-hidden="true"
    >
      <line x1="0" y1="12" x2="28" y2="12" stroke="currentColor" strokeWidth="0.7" />
      <circle cx="32" cy="12" r="2" fill="currentColor" />
      <circle cx="40" cy="12" r="3.5" stroke="currentColor" strokeWidth="0.7" fill="none" />
      <circle cx="48" cy="12" r="2" fill="currentColor" />
      <line x1="52" y1="12" x2="80" y2="12" stroke="currentColor" strokeWidth="0.7" />
    </svg>
  );
}

// Single parent couple card
function FamilyCard({
  couple,
  index,
}: {
  couple: ParentCouple;
  index: number;
}) {
  const cardTitle = couple.side === 'bride' ? 'Padres de la Novia' : 'Padres del Novio';
  const fromLeft = index % 2 === 0;

  return (
    <motion.div
      initial={{ opacity: 0, x: fromLeft ? -32 : 32 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1], delay: index * 0.12 }}
      className="relative"
      style={{
        background: `var(--v2-glass-bg, rgba(255,255,255,0.80))`,
        backdropFilter: 'blur(22px) saturate(150%)',
        WebkitBackdropFilter: 'blur(22px) saturate(150%)',
        border: `1px solid var(--v2-color-border, rgba(255,255,255,0.92))`,
        borderBottom: `1px solid var(--v2-color-border, rgba(197,168,128,0.22))`,
        borderRight: `1px solid var(--v2-color-border, rgba(197,168,128,0.15))`,
        borderRadius: `var(--v2-radius-lg, 22px)`,
        padding: '32px 28px 28px',
        boxShadow: `var(--v2-shadow-card, 0 4px 24px rgba(197,168,128,0.10)), 0 1px 4px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.95)`,
        overflow: 'hidden',
      }}
    >
      {/* Top gloss */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: '45%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.30) 0%, transparent 100%)',
          borderRadius: '22px 22px 0 0',
          pointerEvents: 'none',
        }}
      />

      {/* Whose side label */}
      <div className="text-center mb-5">
        <span
          className="text-[9px] uppercase tracking-[0.28em] font-semibold"
          style={{ color: `var(--v2-color-accent, #C5A880)` }}
        >
          {cardTitle}
        </span>
        <div className="flex justify-center mt-2">
          <Ornament />
        </div>
      </div>

      {/* Parents */}
      <div className="flex flex-col gap-5">
        {/* Father */}
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #2A2418 0%, #1C1509 100%)',
              border: `1px solid var(--v2-color-border-strong, rgba(197,168,128,0.4))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ color: `var(--v2-color-accent, #EDD8A0)` }}>
              <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.22em] mb-0.5 font-semibold"
              style={{ color: `var(--v2-color-accent, #A88C5A)` }}
            >
              Padre
            </p>
            <p className="text-sm font-light tracking-wide" style={{ color: `var(--v2-color-text-primary, #3D2B1A)` }}>
              {couple.fatherName}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div
          style={{
            height: 1,
            background: `linear-gradient(90deg, transparent, var(--v2-divider-color, rgba(197,168,128,0.35)), transparent)`,
          }}
        />

        {/* Mother */}
        <div className="flex items-center gap-4">
          <div
            style={{
              width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
              background: 'linear-gradient(135deg, #3D1A2A 0%, #2A0F1C 100%)',
              border: `1px solid var(--v2-color-border, rgba(197,168,128,0.35))`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0,0,0,0.18)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="8" r="4" stroke="#F2C4D0" strokeWidth="1.2" />
              <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" stroke="#F2C4D0" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </div>
          <div>
            <p
              className="text-[9px] uppercase tracking-[0.22em] mb-0.5 font-semibold"
              style={{ color: `var(--v2-color-accent, #A88C5A)` }}
            >
              Madre
            </p>
            <p className="text-sm font-light tracking-wide" style={{ color: `var(--v2-color-text-primary, #3D2B1A)` }}>
              {couple.motherName}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Parents({ parents, theme }: ParentsProps) {
  if (!parents || parents.length === 0) return null;

  const groomParents = parents.find((p) => p.side === 'groom');
  const brideParents = parents.find((p) => p.side === 'bride');

  return (
    <section className="py-20 md:py-28 px-6 md:px-8 bg-transparent select-none">
      <div className="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className={`text-xs uppercase tracking-[0.28em] mb-3 ${theme.accentText} ${theme.bodyFont}`}>
            Con la bendición de nuestros padres
          </p>
          <h3 className={`text-3xl md:text-4xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}>
            Nuestras Familias
          </h3>
          <div className="flex items-center justify-center gap-3 mt-6">
            <div className="h-px w-10" style={{ background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }} />
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: `var(--v2-color-accent, #C5A880)` }}>
              <path d="M12 21s-9-7.5-9-13a5 5 0 0 1 9-3 5 5 0 0 1 9 3c0 5.5-9 13-9 13z" />
            </svg>
            <div className="h-px w-10" style={{ background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }} />
          </div>
          <p
            className={`text-xs mt-5 opacity-65 max-w-sm mx-auto leading-relaxed ${theme.bodyFont} ${theme.bodyText}`}
          >
            Este día no sería posible sin el amor y apoyo incondicional de nuestras familias.
          </p>
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {groomParents && (
            <FamilyCard couple={groomParents} index={0} />
          )}
          {brideParents && (
            <FamilyCard couple={brideParents} index={1} />
          )}
        </div>

        {/* Bottom ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className="flex justify-center mt-12"
        >
          <svg width="160" height="20" viewBox="0 0 160 20" fill="none" aria-hidden="true" style={{ opacity: 0.35, color: `var(--v2-color-accent, #C5A880)` }}>
            <line x1="0" y1="10" x2="60" y2="10" stroke="currentColor" strokeWidth="0.7" />
            <circle cx="67" cy="10" r="2.5" fill="currentColor" />
            <circle cx="80" cy="10" r="5" stroke="currentColor" strokeWidth="0.7" fill="none" />
            <circle cx="93" cy="10" r="2.5" fill="currentColor" />
            <line x1="100" y1="10" x2="160" y2="10" stroke="currentColor" strokeWidth="0.7" />
          </svg>
        </motion.div>

      </div>
    </section>
  );
}
