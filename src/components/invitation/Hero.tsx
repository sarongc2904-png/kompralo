'use client';

import React, { useRef } from 'react';
import { Theme } from '@/domain/themes/types';
import { InvitationProtagonist } from '@/domain/invitations/types';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { getVideoEmbedUrl } from '@/lib/video/getVideoEmbedUrl';

interface HeroProps {
  protagonists?: InvitationProtagonist[];
  brideName?: string;
  groomName?: string;
  eventDate: string;
  emotionalPhrase: string;
  imageUrl: string;
  videoUrl?: string;
  eventLabel?: string;
  theme: Theme;
}

export default function Hero({
  protagonists,
  brideName,
  groomName,
  eventDate,
  emotionalPhrase,
  imageUrl,
  videoUrl,
  eventLabel = 'Nuestra Boda',
  theme,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const primaryName = protagonists?.[0]?.name ?? brideName ?? '';
  const secondaryName = protagonists?.[1]?.name ?? groomName ?? '';

  const videoEmbed = getVideoEmbedUrl(videoUrl);

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end start'],
  });

  // Smooth spring to remove jitter
  const smooth = useSpring(scrollYProgress, { stiffness: 80, damping: 24, restDelta: 0.001 });

  // Layer depths — each moves at a different rate
  const bgImageY    = useTransform(smooth, [0, 1], ['0%',   '28%']);   // slowest — deep
  const gradientY   = useTransform(smooth, [0, 1], ['0%',   '14%']);   // mid
  const textY       = useTransform(smooth, [0, 1], ['0%',  '-22%']);   // floats up faster
  const textOpacity = useTransform(smooth, [0, 0.65], [1, 0]);
  const textScale   = useTransform(smooth, [0, 0.65], [1, 0.94]);

  // Date formatting
  const dateObj     = new Date(eventDate);
  const formattedDate = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).replace(/^./, (c) => c.toUpperCase());

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: 640 }}
    >
      {/* ── Layer 1: Background Photo (slowest) ─────────────────────────── */}
      <motion.div
        aria-hidden="true"
        style={{
          y: bgImageY,
          position: 'absolute', inset: 0,
          willChange: 'transform',
        }}
      >
        {/* Media is 130% height so there is room for the parallax shift */}
        <div style={{ position: 'absolute', top: '-15%', left: 0, right: 0, bottom: '-15%' }}>
          {videoEmbed?.type === 'youtube' ? (
            <iframe
              src={videoEmbed.embedUrl + '?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1'}
              title={`${primaryName} & ${secondaryName} — video`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              loading="lazy"
              aria-hidden="true"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                filter: 'brightness(0.78) saturate(1.08)',
                border: 'none',
                pointerEvents: 'none',
                // Scale up to hide YouTube controls bar at bottom
                transform: 'scale(1.08)',
              }}
            />
          ) : videoEmbed?.type === 'direct' ? (
            <video
              src={videoEmbed.embedUrl}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                filter: 'brightness(0.78) saturate(1.08)',
                userSelect: 'none', pointerEvents: 'none',
              }}
            />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={imageUrl}
              alt={`${primaryName} & ${secondaryName}`}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                filter: 'brightness(0.78) saturate(1.08)',
                userSelect: 'none', pointerEvents: 'none',
              }}
            />
          )}
        </div>
      </motion.div>

      {/* ── Layer 2: Gradient Overlay (mid-speed) ───────────────────────── */}
      <motion.div
        aria-hidden="true"
        style={{
          y: gradientY,
          position: 'absolute', inset: 0,
          background: `radial-gradient(circle at 50% 50%, rgba(196,169,98,0.10) 0%, transparent 60%), linear-gradient(
            180deg,
            rgba(13,10,7,0.22) 0%,
            rgba(13,10,7,0.12) 30%,
            rgba(13,10,7,0.16) 55%,
            rgba(13,10,7,0.65) 82%,
            rgba(13,10,7,0.90) 100%
          )`,
          willChange: 'transform',
        }}
      />

      {/* ── Layer 3: Content (fastest — floats toward viewer) ───────────── */}
      <motion.div
        style={{
          y: textY,
          opacity: textOpacity,
          scale: textScale,
          position: 'absolute', inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 'clamp(48px, 8vh, 88px)',
          willChange: 'transform, opacity',
        }}
      >
        {/* Emotional phrase */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 0.80, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`text-[10px] md:text-xs uppercase tracking-[0.28em] mb-5 text-center max-w-xs px-6 ${theme.bodyFont}`}
          style={{ textShadow: '0 1px 6px rgba(0,0,0,0.5)', color: 'var(--v2-color-text-over-video, #F1E3C8)' }}
        >
          {emotionalPhrase}
        </motion.p>

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0, opacity: 0 }}
          animate={{ scaleX: 1, opacity: 0.55 }}
          transition={{ duration: 1.0, delay: 0.7 }}
          style={{
            width: 48, height: 1,
            background: 'linear-gradient(90deg, transparent, var(--v2-color-accent, #E8D5A8), transparent)',
            marginBottom: 28,
          }}
        />

        {/* Names */}
        <div
          style={{ overflow: 'visible', textAlign: 'center', lineHeight: 1.1 }}
          className="select-none"
        >
          <motion.span
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-calligraphy block glow-pulse"
            style={{
              fontSize: 'clamp(3rem, 9vw, 5.5rem)',
              fontFamily: 'var(--v2-font-heading, inherit)',
              textShadow: '0 2px 24px rgba(0,0,0,0.45), 0 0 40px rgba(196,169,98,0.3)',
              overflow: 'visible',
              color: 'var(--v2-color-text-over-video, #F1E3C8)',
            }}
          >
            {primaryName}
          </motion.span>

          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="block my-1"
            style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', letterSpacing: '0.12em', color: 'var(--v2-color-accent, #C4A962)' }}
          >
            ♡
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-calligraphy block glow-pulse"
            style={{
              fontSize: 'clamp(3rem, 9vw, 5.5rem)',
              fontFamily: 'var(--v2-font-heading, inherit)',
              textShadow: '0 2px 24px rgba(0,0,0,0.45), 0 0 40px rgba(196,169,98,0.3)',
              overflow: 'visible',
              color: 'var(--v2-color-text-over-video, #F1E3C8)',
            }}
          >
            {secondaryName}
          </motion.span>
        </div>

        {/* Date */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 text-center"
        >
          <p
            className={`text-[9px] md:text-[10px] uppercase tracking-[0.32em] mb-1 ${theme.bodyFont}`}
            style={{ color: 'var(--v2-color-text-over-video, #F1E3C8)', opacity: 0.6 }}
          >
            {eventLabel}
          </p>
          <p
            className={`text-[11px] md:text-xs tracking-[0.18em] ${theme.bodyFont}`}
            style={{ textShadow: '0 1px 8px rgba(0,0,0,0.4)', color: 'var(--v2-color-text-over-video, #F1E3C8)', opacity: 0.85 }}
          >
            {formattedDate}
          </p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 2.8, duration: 1 }}
          className="mt-10 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 7, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 1, height: 36,
              background: 'linear-gradient(180deg, transparent 0%, var(--v2-color-accent, rgba(196,169,98,0.7)) 100%)',
            }}
          />
        </motion.div>
      </motion.div>

      {/* ── Layer 4: Vignette edges ──────────────────────────────────────── */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse 100% 100% at 50% 50%, transparent 55%, rgba(0,0,0,0.25) 100%)',
        }}
      />
    </section>
  );
}
