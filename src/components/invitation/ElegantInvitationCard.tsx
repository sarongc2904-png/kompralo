'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── Shared premium card design tokens ───────────────────────────────────────
//
// These values are the single source of truth for the warm ivory glass card
// style used across all invitation sections. Inline styles are intentional
// here to stay independent of theme CSS variables that may vary by theme,
// while still respecting --v2 tokens when the ThemeProviderV2 is present.

// NOTE: We intentionally use --v2-card-ivory-bg and --v2-card-radius here,
// NOT --v2-glass-bg or --v2-radius-lg, because every theme overrides those
// two with their own palette values. These new variables have no theme
// definition yet, so the warm-ivory fallback is always applied.
export const CARD_BASE: React.CSSProperties = {
  background:
    'var(--v2-card-ivory-bg, linear-gradient(145deg, rgba(255,250,238,0.96), rgba(255,244,220,0.90)))',
  backdropFilter: 'blur(10px) saturate(140%)',
  WebkitBackdropFilter: 'blur(10px) saturate(140%)',
  border: '1px solid var(--v2-card-border, rgba(212,175,95,0.38))',
  borderRadius: 'var(--v2-card-radius, 28px)',
  boxShadow:
    '0 18px 45px rgba(116,84,38,0.14), inset 0 1px 0 rgba(255,255,255,0.75)',
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
