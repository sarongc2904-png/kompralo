'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── Shared premium card design tokens ───────────────────────────────────────
//
// These values are the single source of truth for the warm ivory glass card
// style used across all invitation sections. Inline styles are intentional
// here to stay independent of theme CSS variables that may vary by theme,
// while still respecting --v2 tokens when the ThemeProviderV2 is present.

export const CARD_BASE: React.CSSProperties = {
  background: 'var(--v2-glass-bg, rgba(255, 250, 238, 0.88))',
  backdropFilter: 'blur(22px) saturate(150%)',
  WebkitBackdropFilter: 'blur(22px) saturate(150%)',
  border: '1px solid var(--v2-card-border, rgba(212, 175, 95, 0.30))',
  borderRadius: 'var(--v2-radius-lg, 24px)',
  boxShadow:
    '0 8px 36px rgba(120, 88, 40, 0.11), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.92)',
  overflow: 'hidden',
  position: 'relative',
};

// Reusable top-gloss overlay — add as first child inside any card that wants it
export function CardGloss() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '45%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.28) 0%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

type AnimateFrom = 'left' | 'right' | 'bottom' | 'scale' | 'none';

export interface ElegantInvitationCardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  /** Direction of the entrance animation. Default: 'bottom'. */
  animateFrom?: AnimateFrom;
  /** Framer Motion delay in seconds. Default: 0. */
  animateDelay?: number;
}

function buildInitial(from: AnimateFrom): Record<string, number> | undefined {
  if (from === 'left')  return { opacity: 0, x: -32 };
  if (from === 'right') return { opacity: 0, x: 32 };
  if (from === 'scale') return { opacity: 0, scale: 0.92 };
  if (from === 'none')  return undefined;
  return { opacity: 0, y: 22 };
}

export default function ElegantInvitationCard({
  children,
  className = '',
  style,
  animateFrom = 'bottom',
  animateDelay = 0,
}: ElegantInvitationCardProps) {
  const initial     = buildInitial(animateFrom);
  const whileInView = initial ? { opacity: 1, x: 0, y: 0, scale: 1 } : undefined;

  return (
    <motion.div
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.75, delay: animateDelay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={{ ...CARD_BASE, ...style }}
    >
      {children}
    </motion.div>
  );
}
