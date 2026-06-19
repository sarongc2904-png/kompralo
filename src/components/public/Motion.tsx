'use client';

import { motion, useInView, useReducedMotion } from 'framer-motion';
import { useRef } from 'react';
import type { ReactNode, CSSProperties } from 'react';

const EASE: [number, number, number, number] = [0.65, 0, 0.35, 1];

// ─── Single element scroll reveal ────────────────────────────────────────────
export function Reveal({
  children,
  delay = 0,
  y = 30,
  duration = 0.75,
  style,
  className,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  duration?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-72px 0px' });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      style={style}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y }}
      animate={!reduceMotion && inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration, ease: EASE, delay }}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger container ────────────────────────────────────────────────────────
export function Stagger({
  children,
  delay = 0.04,
  gap = 0.1,
  style,
  className,
}: {
  children: ReactNode;
  delay?: number;
  gap?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      ref={ref}
      style={style}
      className={className}
      initial={reduceMotion ? false : 'hidden'}
      animate={reduceMotion ? undefined : (inView ? 'visible' : 'hidden')}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: gap, delayChildren: delay } },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Stagger child ────────────────────────────────────────────────────────────
export function Item({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <motion.div
      style={style}
      className={className}
      variants={{
        hidden: { opacity: 0, y: 26 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.68, ease: EASE },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

// ─── Hover lift card ─────────────────────────────────────────────────────────
export function HoverCard({
  children,
  lift = 6,
  style,
  className,
}: {
  children: ReactNode;
  lift?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      style={{ cursor: 'default', ...style }}
      className={className}
      whileHover={reduceMotion ? undefined : { y: -lift, transition: { duration: 0.28, ease: EASE } }}
    >
      {children}
    </motion.div>
  );
}

// ─── Hover button ─────────────────────────────────────────────────────────────
export function HoverButton({
  children,
  style,
  className,
  onClick,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  onClick?: () => void;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      style={style}
      className={className}
      onClick={onClick}
      whileHover={reduceMotion ? undefined : { y: -2, scale: 1.015, transition: { duration: 0.2, ease: EASE } }}
      whileTap={reduceMotion ? undefined : { scale: 0.98, transition: { duration: 0.1 } }}
    >
      {children}
    </motion.div>
  );
}
