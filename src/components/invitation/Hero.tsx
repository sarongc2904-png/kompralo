'use client';

import React, { useEffect, useRef, useState } from 'react';
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
  /** Library video URL — takes priority over videoUrl when provided (plan-gated by renderer) */
  heroVideoUrl?: string | null;
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
  heroVideoUrl,
  eventLabel = 'Nuestra Boda',
  theme,
}: HeroProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const [videoFailed, setVideoFailed] = useState(false);
  const [legacyVideoFailed, setLegacyVideoFailed] = useState(false);
  const primaryName = protagonists?.[0]?.name ?? brideName ?? '';
  const secondaryName = protagonists?.[1]?.name ?? groomName ?? '';

  // Reset videoFailed whenever heroVideoUrl changes so switching videos works.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => { setVideoFailed(false); }, [heroVideoUrl]);

  // Library video takes priority; falls back to legacy videoUrl (YouTube or direct mp4).
  // videoFailed is set to true when the library video src returns an error.
  const resolvedDirectVideoUrl = !videoFailed ? (heroVideoUrl ?? null) : null;
  const videoEmbed = resolvedDirectVideoUrl ? null : (!legacyVideoFailed ? getVideoEmbedUrl(videoUrl) : null);

  console.log('[heroVideo/Hero] received heroVideoUrl:', heroVideoUrl);
  console.log('[heroVideo/Hero] videoFailed:', videoFailed);
  console.log('[heroVideo/Hero] resolvedDirectVideoUrl:', resolvedDirectVideoUrl);

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
          {resolvedDirectVideoUrl ? (
            /* A — Library video (muted mp4, highest priority) */
            <video
              key={resolvedDirectVideoUrl}
              src={resolvedDirectVideoUrl}
              autoPlay
              muted
              loop
              playsInline
              preload="metadata"
              aria-hidden="true"
              onLoadedData={() => console.log('[heroVideo/Hero] video loaded:', resolvedDirectVideoUrl)}
              onError={(e) => {
                console.error('[heroVideo/Hero] video error:', resolvedDirectVideoUrl, e);
                setVideoFailed(true);
              }}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                filter: 'brightness(0.78) saturate(1.08)',
                userSelect: 'none', pointerEvents: 'none',
              }}
            />
          ) : videoEmbed?.type === 'youtube' ? (
            /* B — Legacy YouTube embed */
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
                transform: 'scale(1.08)',
              }}
            />
          ) : videoEmbed?.type === 'direct' ? (
            /* C — Legacy direct mp4 URL */
            <video
              key={videoEmbed.embedUrl}
              src={videoEmbed.embedUrl}
              autoPlay
              muted
              loop
              playsInline
              aria-hidden="true"
              onError={() => setLegacyVideoFailed(true)}
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover', objectPosition: 'center top',
                filter: 'brightness(0.78) saturate(1.08)',
                userSelect: 'none', pointerEvents: 'none',
              }}
            />
          ) : (
            /* D — Image fallback — never empty */
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
          background: `radial-gradient(circle at 50% 45%, rgba(200,167,93,0.12) 0%, transparent 65%), linear-gradient(
            180deg,
            rgba(31,26,22,0.35) 0%,
            rgba(31,26,22,0.15) 35%,
            rgba(31,26,22,0.20) 60%,
            rgba(251,247,239,0.60) 85%,
            var(--v2-background-main, #FBF7EF) 100%
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
          animate={{ opacity: 1.0, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`text-xs md:text-sm font-semibold uppercase tracking-[0.28em] mb-5 text-center max-w-md px-6 ${theme.bodyFont}`}
          style={{ textShadow: '0 2px 8px rgba(0,0,0,0.65)', color: '#FFFFFF' }}
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
            background: 'linear-gradient(90deg, transparent, var(--v2-color-accent, #C8A75D), transparent)',
            marginBottom: 28,
          }}
        />

        {/* Names */}
        <div
          className="relative select-none px-8 py-10 md:px-14 md:py-12 mx-auto"
          style={{ overflow: 'visible', textAlign: 'center', lineHeight: 1.1 }}
        >
          {/* Sibling glass background to avoid clipping WebKit cursive text */}
          <div
            className="absolute inset-0 rounded-[2rem] md:rounded-[3rem] pointer-events-none"
            style={{
              background: 'linear-gradient(152deg, rgba(255,251,242,0.18) 0%, rgba(253,245,229,0.12) 50%, rgba(247,235,210,0.06) 100%)',
              backdropFilter: 'blur(20px) saturate(130%)',
              WebkitBackdropFilter: 'blur(20px) saturate(130%)',
              border: '1px solid rgba(200, 167, 93, 0.22)',
              boxShadow: '0 12px 40px rgba(116, 84, 38, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.35)',
              zIndex: -1,
            }}
          >
            {/* Inner Border for the glass plate */}
            <div
              className="absolute inset-1.5 rounded-[1.6rem] md:rounded-[2.6rem] pointer-events-none"
              style={{
                border: '1px solid rgba(200, 167, 93, 0.14)',
                opacity: 0.6,
              }}
            />
          </div>

          <motion.span
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-calligraphy block glow-pulse"
            style={{
              fontSize: 'clamp(3rem, 9vw, 5.5rem)',
              fontFamily: 'var(--v2-font-heading, inherit)',
              textShadow: '0 2px 12px rgba(31,26,22,0.08), 0 8px 30px rgba(31,26,22,0.15)',
              overflow: 'visible',
              color: 'var(--v2-color-text-primary, #1F1A16)',
            }}
          >
            {primaryName}
          </motion.span>

          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="block my-1"
            style={{ fontSize: 'clamp(1rem, 3vw, 1.5rem)', letterSpacing: '0.12em', color: 'var(--v2-color-accent, #C8A75D)' }}
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
              textShadow: '0 2px 12px rgba(31,26,22,0.08), 0 8px 30px rgba(31,26,22,0.15)',
              overflow: 'visible',
              color: 'var(--v2-color-text-primary, #1F1A16)',
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
            className={`text-[11px] md:text-xs font-semibold uppercase tracking-[0.25em] mb-1.5 ${theme.bodyFont}`}
            style={{ color: 'var(--v2-color-text-primary, #1F1A16)' }}
          >
            {eventLabel}
          </p>
          <p
            className={`text-[14px] md:text-[16px] font-bold tracking-[0.12em] ${theme.bodyFont}`}
            style={{ color: 'var(--v2-color-text-primary, #1F1A16)' }}
          >
            {formattedDate}
          </p>
        </motion.div>

        {/* Scroll hint */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1.0 }}
          transition={{ delay: 2.8, duration: 1 }}
          className="mt-10 flex flex-col items-center gap-2 select-none"
        >
          <span 
            className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${theme.bodyFont}`} 
            style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}
          >
            Deslizar
          </span>
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
            style={{
              width: 1.5, height: 40,
              background: 'linear-gradient(180deg, var(--v2-color-accent, #C8A75D) 0%, transparent 100%)',
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
