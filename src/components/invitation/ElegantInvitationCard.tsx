'use client';

import React from 'react';
import { motion } from 'framer-motion';

// ─── Shared premium card design tokens ───────────────────────────────────────
//
// Warm ivory glass card style used across all invitation sections.
// Uses --v2 CSS custom properties with warm-ivory fallbacks.

export const CARD_BASE: React.CSSProperties = {
  background: 'var(--v2-glass-bg, rgba(255,255,255,0.75))',
  border: '1px solid var(--v2-color-border, rgba(201,168,76,0.3))',
  borderRadius: '8px',
  boxShadow: '0 2px 12px rgba(116,84,38,0.08), 0 8px 24px rgba(120,88,40,0.06)',
  backdropFilter: 'blur(4px)',
  overflow: 'hidden',
  position: 'relative',
};

// Reusable top-gloss overlay — renders a subtle light-catch like fine paper
export function CardGloss() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        top: 0, left: 0, right: 0,
        height: '50%',
        background: 'linear-gradient(180deg, rgba(255,255,255,0.32) 0%, rgba(255,255,255,0.08) 40%, transparent 100%)',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// Inner double border — letterpress-inspired luxury detail
function InnerBorder() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: '4px',
        borderRadius: '4px',
        border: '1px solid var(--v2-color-border, rgba(200,167,93,0.20))',
        pointerEvents: 'none',
        zIndex: 1,
        opacity: 0.5,
      }}
    />
  );
}

function CardTextureOverlay() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        backgroundImage: 'var(--v2-card-texture-url, none)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'repeat',
        opacity: 'var(--v2-card-texture-opacity, 0)',
        mixBlendMode: 'multiply',
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// Linen paper texture overlay — very subtle grain
function LinenTexture() {
  return (
    <div
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        opacity: 0.04,
        mixBlendMode: 'multiply',
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
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
  /** Show inner double border. Default: true */
  showInnerBorder?: boolean;
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
  showInnerBorder = true,
}: ElegantInvitationCardProps) {
  const initial     = buildInitial(animateFrom);
  const whileInView = initial ? { opacity: 1, x: 0, y: 0, scale: 1 } : undefined;

  return (
    <motion.div
      data-elegant-card=""
      initial={initial}
      whileInView={whileInView}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.75, delay: animateDelay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
      style={{ ...CARD_BASE, ...style }}
    >
      <CardTextureOverlay />
      {showInnerBorder && <InnerBorder />}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

