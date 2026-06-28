'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Theme } from '@/domain/themes/types';
import { InvitationProtagonist } from '@/domain/invitations/types';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import { getVideoEmbedUrl } from '@/lib/video/getVideoEmbedUrl';
import { EditableText } from '@/components/visual-editor/EditableText';

interface HeroProps {
  protagonists?: InvitationProtagonist[];
  brideName?: string;
  groomName?: string;
  eventDate: string;
  eventTime?: string;
  emotionalPhrase: string;
  imageUrl: string;
  videoUrl?: string;
  /** Library video URL — takes priority over videoUrl when provided (plan-gated by renderer) */
  heroVideoUrl?: string | null;
  eventLabel?: string;
  connectorText?: string;
  theme: Theme;
  editablePreview?: boolean;
}

export default function Hero({
  protagonists,
  brideName,
  groomName,
  eventDate,
  eventTime,
  emotionalPhrase,
  imageUrl,
  videoUrl,
  heroVideoUrl,
  eventLabel = 'Nuestra Boda',
  connectorText = 'y',
  theme,
  editablePreview = false,
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

  // In the editor canvas the section fills a fixed device-frame with no real scroll,
  // so textY can produce a large negative translateY that overflow:hidden clips.
  // Freeze all text transforms to their at-rest (scroll=0) values in editor mode.
  const effectiveTextY       = editablePreview ? 0         : textY;
  const effectiveTextOpacity = editablePreview ? 1         : textOpacity;
  const effectiveTextScale   = editablePreview ? 1         : textScale;

  // Date formatting
  const dateObj     = new Date(eventDate + 'T12:00:00');
  const formattedDate = dateObj.toLocaleDateString('es-ES', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  }).replace(/^./, (c) => c.toUpperCase());

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden"
      style={{ height: editablePreview ? 'min(100svh, 820px)' : '100svh', minHeight: 640 }}
    >
      <style dangerouslySetInnerHTML={{ __html: `
        .hero-card-container {
          background: transparent !important;
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          border: none !important;
          box-shadow: none !important;
          border-radius: 0 !important;
        }
        .hero-title-text {
          color: #F8E7C6 !important;
          text-shadow: 0 8px 28px rgba(0,0,0,0.45) !important;
        }
        .hero-text-champagne {
          color: #F4DFC0 !important;
          text-shadow: 0 8px 28px rgba(0,0,0,0.45) !important;
        }
        @media (max-width: 768px) {
          .hero-card-container {
            background: transparent !important;
            border: none !important;
          }
          .hero-title-text {
            color: #F8E7C6 !important;
            font-size: clamp(3.0rem, 14vw, 5.0rem) !important;
          }
          .hero-text-champagne {
            color: #F5DEC0 !important;
          }
        }
      `}} />
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
                filter: 'brightness(0.68) contrast(0.95) saturate(0.78) sepia(0.08)',
                userSelect: 'none', pointerEvents: 'none',
              }}
            />
          ) : videoEmbed?.type === 'youtube' ? (
            /* B — Legacy YouTube embed.
               objectFit:cover does not apply to iframes; use absolute-center + min-size
               to ensure the 16:9 content fills any portrait/landscape container. */
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', pointerEvents: 'none' }}>
              <iframe
                src={videoEmbed.embedUrl + '?autoplay=1&mute=1&loop=1&controls=0&playsinline=1&rel=0&modestbranding=1'}
                title={`${primaryName} & ${secondaryName} — video`}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                loading="lazy"
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  /* 16:9 cover: min-width ensures full cover in portrait; min-height in landscape */
                  width: 'max(100%, calc(100% * 16 / 9 * (100vh / 100vw)))',
                  height: 'max(100%, calc(100% * 9 / 16 * (100vw / 100vh)))',
                  minWidth: '177.78%',
                  minHeight: '100%',
                  transform: 'translate(-50%, -50%)',
                  filter: 'brightness(0.68) contrast(0.95) saturate(0.78) sepia(0.08)',
                  border: 'none',
                  pointerEvents: 'none',
                }}
              />
            </div>
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
                filter: 'brightness(0.68) contrast(0.95) saturate(0.78) sepia(0.08)',
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
                filter: 'brightness(0.68) contrast(0.95) saturate(0.78) sepia(0.08)',
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
          background: `
            radial-gradient(
              circle at center,
              rgba(0,0,0,0.18) 0%,
              rgba(0,0,0,0.42) 62%,
              rgba(0,0,0,0.68) 100%
            ),
            linear-gradient(
              180deg,
              rgba(0,0,0,0.20) 0%,
              rgba(0,0,0,0.38) 60%,
              var(--v2-background-main, #FBF7EF) 100%
            )
          `,
          willChange: 'transform',
        }}
      />

      {/* ── Layer 3: Content (fastest — floats toward viewer) ───────────── */}
      <motion.div
        style={{
          y: effectiveTextY,
          opacity: effectiveTextOpacity,
          scale: effectiveTextScale,
          position: 'absolute', inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-end',
          paddingBottom: 'clamp(48px, 8vh, 88px)',
          // Buffer so justify-content:flex-end overflow doesn't push the eyebrow
          // above the section's overflow:hidden boundary in the editor device frame.
          paddingTop: editablePreview ? '5rem' : '4rem',
          willChange: 'transform, opacity',
        }}
      >
        {/* Event label — "Nos casamos" — principal headline above names */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1.0, y: 0 }}
          transition={{ duration: 1.2, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className={`text-sm md:text-base font-semibold uppercase tracking-[0.28em] mb-5 text-center max-w-md px-6 ${theme.bodyFont} hero-text-champagne`}
          style={{ textShadow: '0 8px 28px rgba(0,0,0,0.45)', color: '#F4DFC0' }}
        >
          <EditableText
            value={eventLabel}
            fieldPath="hero.eventLabel"
            isEditable={editablePreview}
          />
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

        {/* Names — floating elegantly without card background */}
        <div
          className="relative select-none px-8 py-10 md:px-14 md:py-12 mx-auto"
          style={{ overflow: 'visible', textAlign: 'center', lineHeight: 1.1 }}
        >

          <motion.span
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 0.85, ease: [0.16, 1, 0.3, 1] }}
            className="font-calligraphy block glow-pulse hero-title-text"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
              fontFamily: 'var(--v2-font-heading, inherit)',
              textShadow: '0 8px 28px rgba(0,0,0,0.45)',
              overflow: 'visible',
              color: '#F8E7C6',
            }}
          >
            <EditableText
              value={primaryName}
              fieldPath="protagonists.0.name"
              isEditable={editablePreview}
            />
          </motion.span>

          <motion.span
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 0.9, scale: 1 }}
            transition={{ duration: 0.8, delay: 1.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="block font-calligraphy italic my-0.5 hero-text-champagne"
            style={{ fontSize: 'clamp(2rem, 5vw, 3rem)', color: '#F4DFC0', textShadow: '0 8px 28px rgba(0,0,0,0.45)' }}
          >
            <EditableText
              value={connectorText}
              fieldPath="hero.connectorText"
              isEditable={editablePreview}
            />
          </motion.span>

          <motion.span
            initial={{ opacity: 0, y: 22 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.4, delay: 1.5, ease: [0.16, 1, 0.3, 1] }}
            className="font-calligraphy block glow-pulse hero-title-text"
            style={{
              fontSize: 'clamp(3.5rem, 10vw, 6.5rem)',
              fontFamily: 'var(--v2-font-heading, inherit)',
              textShadow: '0 8px 28px rgba(0,0,0,0.45)',
              overflow: 'visible',
              color: '#F8E7C6',
            }}
          >
            <EditableText
              value={secondaryName}
              fieldPath="protagonists.1.name"
              isEditable={editablePreview}
            />
          </motion.span>
        </div>

        {/* Emotional phrase — subtitle below names */}
        {(emotionalPhrase || editablePreview) && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 0.85, y: 0 }}
            transition={{ duration: 1.0, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
            className={`text-xs md:text-sm italic text-center max-w-xs px-6 mt-4 ${theme.bodyFont} hero-text-champagne`}
            style={{ textShadow: '0 4px 16px rgba(0,0,0,0.4)', color: '#F4DFC0' }}
          >
            <EditableText
              value={emotionalPhrase}
              fieldPath="hero.emotionalPhrase"
              isEditable={editablePreview}
              placeholder="Frase emotiva…"
            />
          </motion.p>
        )}

        {/* Date */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.0, delay: 2.0, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 text-center"
        >
          <p
            className={`text-[16px] md:text-[18px] font-semibold tracking-[0.06em] ${theme.bodyFont} hero-text-champagne`}
            style={{
              color: '#F4DFC0',
              fontWeight: 600,
              textShadow: '0 8px 28px rgba(0,0,0,0.45)',
              ...(editablePreview ? { cursor: 'pointer', outline: 'none' } : {}),
            }}
            onClick={editablePreview ? () => {
              window.parent?.postMessage(
                {
                  type: 'EDITOR_V4_ELEMENT_SELECTED',
                  elementType: 'datetime',
                  fieldPath: 'event',
                  label: 'Fecha del evento',
                  meta: { date: eventDate ?? '', time: eventTime ?? '' },
                },
                window.location.origin,
              );
            } : undefined}
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
            className={`text-[10px] font-semibold uppercase tracking-[0.3em] ${theme.bodyFont} hero-text-champagne`}
            style={{ color: '#F4DFC0', textShadow: '0 8px 28px rgba(0,0,0,0.45)' }}
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
