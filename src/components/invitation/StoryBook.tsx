'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Theme } from '@/domain/themes/types';
import { InvitationProtagonist, StorySlide } from '@/domain/invitations/types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { EditableText } from '@/components/visual-editor/EditableText';
import { useThemeV2 } from '@/domain/themes-v2';

interface StoryBookProps {
  slides: StorySlide[];
  theme: Theme;
  protagonists?: InvitationProtagonist[];
  brideName?: string;
  groomName?: string;
  editablePreview?: boolean;
  sectionEyebrow?: string;
  sectionTitle?: string;
}

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const NOISE_SVG = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`;

// ─── FLORAL DIVIDER ───────────────────────────────────────────────────────────
function FloralDivider({ color = 'var(--v2-color-accent, #C5A880)' }: { color?: string }) {
  return (
    <svg width="120" height="22" viewBox="0 0 120 22" fill="none" className="mx-auto my-3 opacity-55">
      <line x1="0" y1="11" x2="48" y2="11" stroke={color} strokeWidth="0.8" />
      <path d="M54 3 C57 8 63 8 66 3 C63 9 57 9 54 3Z" fill={color} opacity="0.85" />
      <circle cx="60" cy="11" r="2.5" fill={color} />
      <path d="M54 19 C57 14 63 14 66 19 C63 13 57 13 54 19Z" fill={color} opacity="0.85" />
      <line x1="72" y1="11" x2="120" y2="11" stroke={color} strokeWidth="0.8" />
    </svg>
  );
}

// ─── BOOK COVER ───────────────────────────────────────────────────────────────
function BookCover({
  brideName,
  groomName,
  onClick,
  theme,
}: {
  brideName: string;
  groomName: string;
  onClick: () => void;
  theme: Theme;
}) {
  const accent = theme.colors.accent;

  return (
    <motion.div
      className="cursor-pointer group select-none flex flex-col items-center"
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0, transition: { duration: 0.8, ease: 'easeOut' } }}
      exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.5 } }}
      onClick={onClick}
    >
      <div style={{ perspective: 1200 }}>
        <motion.div
          style={{ width: 260, height: 360, transformStyle: 'preserve-3d', position: 'relative' }}
          animate={{ rotateY: -14, rotateX: 4 }}
          transition={{ duration: 0 }}
          whileHover={{ rotateY: -6, rotateX: 2, transition: { duration: 0.45 } }}
        >
          <motion.div
            style={{ position: 'absolute', inset: 0 }}
            animate={{ y: [0, -7, 0] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
          >
            {/* Front cover */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                overflow: 'hidden',
                background:
                  theme.textures.leather ||
                  'linear-gradient(145deg, #2e1b0e 0%, #4d2b18 30%, #3b2010 65%, #1f100a 100%)',
                boxShadow: '-12px 14px 50px rgba(0,0,0,0.75), -4px 4px 12px rgba(0,0,0,0.4)',
              }}
            >
              <div style={{ position: 'absolute', inset: 0, opacity: 0.035, backgroundImage: NOISE_SVG }} />
              <div
                style={{
                  position: 'absolute',
                  inset: 16,
                  border: '1px solid rgba(212,175,55,0.22)',
                  pointerEvents: 'none',
                }}
              />
              <div
                style={{
                  position: 'absolute',
                  inset: 22,
                  border: '1px solid rgba(212,175,55,0.10)',
                  pointerEvents: 'none',
                }}
              />

              {[
                { pos: 'top-4 left-4', d: 'M0 8 L0 0 L8 0' },
                { pos: 'top-4 right-4', d: 'M8 0 L16 0 L16 8' },
                { pos: 'bottom-4 left-4', d: 'M0 8 L0 16 L8 16' },
                { pos: 'bottom-4 right-4', d: 'M8 16 L16 16 L16 8' },
              ].map(({ pos, d }, i) => (
                <div key={i} className={`absolute ${pos} w-4 h-4 opacity-30`}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d={d} stroke="#D4AF37" strokeWidth="0.8" />
                  </svg>
                </div>
              ))}

              <div className="absolute top-9 left-1/2 -translate-x-1/2">
                <svg width="100" height="20" viewBox="0 0 100 20" fill="none">
                  <line x1="0" y1="10" x2="36" y2="10" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5" />
                  <path d="M40 2 L50 10 L40 18 L44 10Z" fill="#D4AF37" opacity="0.5" />
                  <path d="M60 2 L50 10 L60 18 L56 10Z" fill="#D4AF37" opacity="0.5" />
                  <line x1="64" y1="10" x2="100" y2="10" stroke="#D4AF37" strokeWidth="0.6" opacity="0.5" />
                </svg>
              </div>

              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 32px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    fontSize: 30,
                    fontStyle: 'italic',
                    letterSpacing: '0.03em',
                    lineHeight: 1.25,
                    marginBottom: 12,
                    color: `var(--v2-color-accent, ${accent})`,
                    fontFamily: 'Georgia, "Times New Roman", serif',
                    textShadow: '0 0 24px rgba(212,175,55,0.3), 0 2px 4px rgba(0,0,0,0.5)',
                  }}
                >
                  {brideName} & {groomName}
                </p>
                <div style={{ width: 56, height: 1, background: '#D4AF37', opacity: 0.35, marginBottom: 12 }} />
                <p
                  style={{
                    fontSize: 10.5,
                    letterSpacing: '0.28em',
                    textTransform: 'uppercase',
                    opacity: 0.65,
                    fontFamily: 'Georgia, serif',
                    color: `var(--v2-color-accent, ${accent})`,
                  }}
                >
                  Así comienza nuestra historia
                </p>
              </div>

              <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                <svg width="70" height="20" viewBox="0 0 70 20" fill="none">
                  <path
                    d="M8 10 Q35 2 62 10 Q35 18 8 10Z"
                    fill="none"
                    stroke="#D4AF37"
                    strokeWidth="0.6"
                    opacity="0.42"
                  />
                  <circle cx="35" cy="10" r="2" fill="#D4AF37" opacity="0.5" />
                </svg>
              </div>

              <p
                className="absolute bottom-5 w-full text-center text-[8.5px] tracking-[0.3em] uppercase transition-all duration-500 opacity-40 group-hover:opacity-70"
                style={{ color: `var(--v2-color-accent, ${accent})` }}
              >
                ✦ Abrir el libro ✦
              </p>
            </div>

            {/* Spine */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: 18,
                height: '100%',
                background: 'linear-gradient(to right, #0c0704, #2a1a0e)',
                transform: 'rotateY(-90deg)',
                transformOrigin: 'right center',
              }}
            />

            {/* Pages stack */}
            <div
              style={{
                position: 'absolute',
                top: 3,
                right: 0,
                width: 15,
                height: 'calc(100% - 6px)',
                background: 'repeating-linear-gradient(to bottom, #f5f0e7, #ece7d5 1.5px, #f8f4ec 3px)',
                transform: 'rotateY(90deg)',
                transformOrigin: 'left center',
              }}
            />

            {/* Drop shadow */}
            <div
              style={{
                position: 'absolute',
                bottom: -20,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '86%',
                height: 20,
                background: 'radial-gradient(ellipse, rgba(0,0,0,0.5) 0%, transparent 70%)',
                filter: 'blur(7px)',
                pointerEvents: 'none',
              }}
            />
          </motion.div>
        </motion.div>
      </div>

      <motion.p
        className="mt-8 text-[10px] tracking-[0.3em] uppercase"
        style={{
          color: `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`,
          fontFamily: 'Georgia, serif',
        }}
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
      >
        Haz clic para abrir
      </motion.p>
    </motion.div>
  );
}

// ─── STORY IMAGE ──────────────────────────────────────────────────────────────
// Fills its containing block using position: absolute; inset: 0.
// The container MUST have position: relative and a definite height
// (provided by CSS grid stretch on desktop, or aspectRatio on mobile).
function StoryImage({ imageUrl, alt }: { imageUrl: string; alt: string }) {
  const [errored, setErrored] = useState(false);
  const hasImage = !!imageUrl && !errored;

  return (
    <>
      {hasImage ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt={alt || 'Nuestra historia'}
          onError={() => setErrored(true)}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            objectPosition: 'center top',
            display: 'block',
            filter: 'sepia(0.15) contrast(0.97) brightness(0.96)',
          }}
        />
      ) : (
        <div
          style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#9e9e9e',
            opacity: 0.28,
          }}
        >
          <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
          <span style={{ fontSize: 11, marginTop: 8, fontFamily: 'Georgia, serif' }}>Sin imagen</span>
        </div>
      )}

      {/* Bottom vignette */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(to top, rgba(0,0,0,0.2) 0%, transparent 45%)',
          pointerEvents: 'none',
        }}
      />
      {/* Paper grain */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: NOISE_SVG,
          opacity: 0.025,
          mixBlendMode: 'multiply',
          pointerEvents: 'none',
        }}
      />
    </>
  );
}

// ─── DESKTOP BOOK SPREAD ──────────────────────────────────────────────────────
// Two-page layout for lg+ screens.
// CSS grid with default align-items:stretch gives both columns equal height,
// driven by the text column's content. The image column uses position:relative
// so StoryImage can fill it with position:absolute; inset:0.
function DesktopBookSpread({
  slide,
  slideIndex,
  pageNum,
  imageOnLeft,
  theme,
  editablePreview,
}: {
  slide: StorySlide;
  slideIndex: number;
  pageNum: number;
  imageOnLeft: boolean;
  theme: Theme;
  editablePreview: boolean;
}) {
  const themeV2 = useThemeV2();
  const accent = `var(--v2-color-accent, ${theme.colors.accent})`;
  const textPrimary = `var(--v2-color-text-primary, ${theme.colors.textPrimary})`;
  const textSecondary = `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`;
  const storyBg =
    theme.backgrounds.storyBook ||
    'linear-gradient(135deg, #fdf9f0 0%, #f5efdd 50%, #ede7d2 100%)';
  const storyPageBackground = themeV2.id === 'rosa-antiguo'
    ? '#FFFFFF'
    : `var(--v2-background-story, ${storyBg})`;

  const imagePage = (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: '#1a1008',
        minHeight: 480,
        // Grid stretch gives this cell a definite height equal to the text column.
        // StoryImage fills it via position:absolute; inset:0.
      }}
    >
      <StoryImage imageUrl={slide.imageUrl} alt={slide.title} />
      {/* Fold shadow on the center edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          ...(imageOnLeft ? { right: 0 } : { left: 0 }),
          width: 48,
          height: '100%',
          background: imageOnLeft
            ? 'linear-gradient(to right, transparent, rgba(0,0,0,0.15))'
            : 'linear-gradient(to left, transparent, rgba(0,0,0,0.15))',
          zIndex: 2,
          pointerEvents: 'none',
        }}
      />
    </div>
  );

  const textPage = (
    <div
      style={{
        position: 'relative',
        overflow: 'hidden',
        background: storyPageBackground,
        padding: '44px 36px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        minHeight: 480,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: NOISE_SVG,
          opacity: 0.04,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 12,
          border: `1px solid ${theme.borders.subtle}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 20,
          border: `1px solid ${theme.borders.subtle}`,
          opacity: 0.4,
          pointerEvents: 'none',
        }}
      />
      {/* Spine shadow on the center edge */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          ...(imageOnLeft ? { left: 0 } : { right: 0 }),
          width: 48,
          height: '100%',
          background: imageOnLeft
            ? 'linear-gradient(to right, rgba(0,0,0,0.07), transparent)'
            : 'linear-gradient(to left, rgba(0,0,0,0.07), transparent)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 48%, rgba(139,115,85,0.05) 100%)',
          pointerEvents: 'none',
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
        <FloralDivider color={accent} />
        <h4
          style={{
            fontSize: 24,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontWeight: 300,
            letterSpacing: '0.03em',
            lineHeight: 1.32,
            color: textPrimary,
            marginBottom: 16,
          }}
        >
          <EditableText value={slide.title} fieldPath={`story.slides.${slideIndex}.title`} isEditable={editablePreview} />
        </h4>
        <div
          style={{
            width: 32,
            height: 1,
            background: accent,
            opacity: 0.55,
            margin: '0 auto 16px',
          }}
        />
        <p
          style={{
            fontSize: 15,
            fontFamily: 'Georgia, serif',
            lineHeight: 1.78,
            color: textPrimary,
            opacity: 0.88,
            textAlign: 'justify',
          }}
        >
          <EditableText value={slide.text} fieldPath={`story.slides.${slideIndex}.text`} isEditable={editablePreview} singleLine={false} />
        </p>
        <FloralDivider color={accent} />
      </div>

      <p
        style={{
          position: 'absolute',
          bottom: 14,
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: 8,
          letterSpacing: '0.22em',
          fontFamily: 'monospace',
          color: textSecondary,
          opacity: 0.45,
          whiteSpace: 'nowrap',
        }}
      >
        {pageNum}
      </p>
    </div>
  );

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', position: 'relative' }}>
      {/* Center fold */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: '50%',
          transform: 'translateX(-50%)',
          width: 3,
          background: 'linear-gradient(to bottom, rgba(26,15,8,0.2), #2a1a0e 50%, rgba(26,15,8,0.2))',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          left: 'calc(50% - 1px)',
          width: 1,
          background: 'rgba(212,175,55,0.1)',
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      {imageOnLeft ? (
        <>
          {imagePage}
          {textPage}
        </>
      ) : (
        <>
          {textPage}
          {imagePage}
        </>
      )}
    </div>
  );
}

// ─── MOBILE STORY CARD ────────────────────────────────────────────────────────
// Vertical card for mobile and tablet (< lg).
// aspectRatio gives the image container a definite height so StoryImage
// (position:absolute; inset:0) can fill it correctly.
function MobileStoryCard({
  slide,
  slideIndex,
  pageNum,
  theme,
  editablePreview,
}: {
  slide: StorySlide;
  slideIndex: number;
  pageNum: number;
  theme: Theme;
  editablePreview: boolean;
}) {
  const themeV2 = useThemeV2();
  const accent = `var(--v2-color-accent, ${theme.colors.accent})`;
  const textPrimary = `var(--v2-color-text-primary, ${theme.colors.textPrimary})`;
  const textSecondary = `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`;
  const storyBg =
    theme.backgrounds.storyBook ||
    'linear-gradient(135deg, #fdf9f0 0%, #ede7d2 100%)';
  const storyPageBackground = themeV2.id === 'rosa-antiguo'
    ? '#FFFFFF'
    : `var(--v2-background-story, ${storyBg})`;

  return (
    <div style={{ overflow: 'hidden' }}>
      {/* Image — aspect ratio establishes a definite height */}
      <div
        style={{
          position: 'relative',
          aspectRatio: '4 / 3',
          overflow: 'hidden',
          background: '#1a1008',
        }}
      >
        <StoryImage imageUrl={slide.imageUrl} alt={slide.title} />
      </div>

      {/* Text */}
      <div
        style={{
          position: 'relative',
          background: storyPageBackground,
          padding: '28px 24px 36px',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundImage: NOISE_SVG,
            opacity: 0.04,
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            inset: 10,
            border: `1px solid ${theme.borders.subtle}`,
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 1, textAlign: 'center' }}>
          <FloralDivider color={accent} />
          <h4
            style={{
              fontSize: 21,
              fontFamily: 'Georgia, "Times New Roman", serif',
              fontStyle: 'italic',
              fontWeight: 300,
              letterSpacing: '0.03em',
              lineHeight: 1.35,
              color: textPrimary,
              marginBottom: 12,
            }}
          >
            <EditableText value={slide.title} fieldPath={`story.slides.${slideIndex}.title`} isEditable={editablePreview} />
          </h4>
          <div
            style={{
              width: 28,
              height: 1,
              background: accent,
              opacity: 0.55,
              margin: '0 auto 12px',
            }}
          />
          <p
            style={{
              fontSize: 15,
              fontFamily: 'Georgia, serif',
              lineHeight: 1.72,
              color: textPrimary,
              opacity: 0.88,
            }}
          >
            <EditableText value={slide.text} fieldPath={`story.slides.${slideIndex}.text`} isEditable={editablePreview} singleLine={false} />
          </p>
          <FloralDivider color={accent} />
          <p
            style={{
              fontSize: 8,
              letterSpacing: '0.22em',
              fontFamily: 'monospace',
              color: textSecondary,
              opacity: 0.4,
            }}
          >
            {pageNum}
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── FINAL SPREAD ─────────────────────────────────────────────────────────────
function FinalSpread({
  brideName,
  groomName,
  theme,
}: {
  brideName: string;
  groomName: string;
  theme: Theme;
}) {
  const accent = `var(--v2-color-accent, ${theme.colors.accent})`;
  const textPrimary = `var(--v2-color-text-primary, ${theme.colors.textPrimary})`;
  const textSecondary = `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`;
  const finalBg =
    theme.backgrounds.final ||
    'linear-gradient(135deg, #fdf9ef 0%, #f0eadb 50%, #e7e0ce 100%)';

  return (
    <div
      style={{
        position: 'relative',
        minHeight: 420,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        background: `var(--v2-background-final, ${finalBg})`,
      }}
    >
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: NOISE_SVG,
          opacity: 0.04,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 16,
          border: `1px solid ${theme.borders.subtle}`,
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'absolute',
          inset: 28,
          border: `1px solid ${theme.borders.subtle}`,
          opacity: 0.45,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 1,
          textAlign: 'center',
          padding: '40px',
          maxWidth: 480,
          margin: '0 auto',
        }}
      >
        <svg width="140" height="28" viewBox="0 0 140 28" fill="none" className="mx-auto mb-7 opacity-48">
          <line x1="0" y1="14" x2="53" y2="14" stroke={accent} strokeWidth="0.8" />
          <path d="M58 4 L70 14 L58 24 L62 14Z" fill={accent} opacity="0.7" />
          <path d="M82 4 L70 14 L82 24 L78 14Z" fill={accent} opacity="0.7" />
          <line x1="87" y1="14" x2="140" y2="14" stroke={accent} strokeWidth="0.8" />
        </svg>

        <p
          style={{
            fontSize: 9,
            letterSpacing: '0.38em',
            textTransform: 'uppercase',
            marginBottom: 20,
            fontFamily: 'monospace',
            color: textSecondary,
          }}
        >
          Último capítulo
        </p>

        <h3
          style={{
            fontSize: 28,
            fontFamily: 'Georgia, "Times New Roman", serif',
            fontStyle: 'italic',
            fontWeight: 300,
            lineHeight: 1.35,
            marginBottom: 20,
            color: textPrimary,
          }}
        >
          Hoy comienza<br />nuestro mayor capítulo
        </h3>

        <div
          style={{
            width: 40,
            height: 1,
            background: accent,
            opacity: 0.55,
            margin: '0 auto 20px',
          }}
        />

        <p
          style={{
            fontSize: 15.5,
            lineHeight: 1.7,
            opacity: 0.8,
            fontStyle: 'italic',
            fontFamily: 'Georgia, serif',
            color: textPrimary,
          }}
        >
          Gracias por ser parte de nuestra historia.
        </p>

        <div style={{ marginTop: 32 }}>
          <p
            style={{
              fontSize: 24,
              fontStyle: 'italic',
              fontFamily: 'Georgia, serif',
              color: accent,
              textShadow: '0 0 20px rgba(197,168,128,0.22)',
            }}
          >
            {brideName} & {groomName}
          </p>
        </div>

        <svg width="100" height="22" viewBox="0 0 100 22" fill="none" className="mx-auto mt-8 opacity-38">
          <path d="M10 11 Q50 3 90 11 Q50 19 10 11Z" fill="none" stroke={accent} strokeWidth="0.8" />
          <circle cx="50" cy="11" r="2.5" fill={accent} />
        </svg>
      </div>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 44%, rgba(139,115,85,0.05) 100%)',
          pointerEvents: 'none',
        }}
      />
    </div>
  );
}

// ─── PAGE CONTROLS ────────────────────────────────────────────────────────────
function PageControls({
  currentPage,
  totalPages,
  onPrev,
  onNext,
  onDotClick,
  theme,
}: {
  currentPage: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  onDotClick: (i: number) => void;
  theme: Theme;
}) {
  const accent = `var(--v2-color-accent, ${theme.colors.accent})`;
  const accentSoft = `var(--v2-color-accent-soft, ${theme.colors.accentSoft})`;
  const textSecondary = `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`;

  const btnBase: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 10,
    letterSpacing: '0.28em',
    textTransform: 'uppercase',
    fontFamily: 'Georgia, serif',
    color: textSecondary,
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px 0',
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: 28,
        gap: 10,
        width: '100%',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          width: '100%',
          paddingLeft: 4,
          paddingRight: 4,
        }}
      >
        <button onClick={onPrev} style={btnBase}>
          <ChevronLeft size={16} />
          {currentPage === 0 ? 'Cerrar' : 'Anterior'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => onDotClick(i)}
              aria-label={`Página ${i + 1}`}
              style={{
                width: i === currentPage ? 20 : 6,
                height: 6,
                borderRadius: 3,
                background: i === currentPage ? accent : accentSoft,
                border: 'none',
                cursor: 'pointer',
                padding: 0,
                transition: 'width 0.25s ease, background 0.25s ease',
              }}
            />
          ))}
        </div>

        <button
          onClick={onNext}
          disabled={currentPage >= totalPages - 1}
          style={{
            ...btnBase,
            cursor: currentPage >= totalPages - 1 ? 'default' : 'pointer',
            opacity: currentPage >= totalPages - 1 ? 0.28 : 1,
          }}
        >
          Siguiente
          <ChevronRight size={16} />
        </button>
      </div>

      <p
        style={{
          fontSize: 8.5,
          letterSpacing: '0.22em',
          fontFamily: 'monospace',
          color: textSecondary,
          opacity: 0.4,
        }}
      >
        Página {currentPage + 1} de {totalPages}
      </p>
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────
export default function StoryBook({
  protagonists,
  slides,
  theme,
  brideName,
  groomName,
  editablePreview = false,
  sectionEyebrow,
  sectionTitle,
}: StoryBookProps) {
  const primaryName = protagonists?.[0]?.name ?? brideName ?? 'Sofía';
  const secondaryName = protagonists?.[1]?.name ?? groomName ?? 'Alejandro';

  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [dir, setDir] = useState(1);
  const autoRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const totalPages = slides.length + 1; // slides + final spread
  const isFinal = currentPage >= slides.length;
  const currentSlide = isFinal ? null : slides[currentPage];
  const imageOnLeft = currentPage % 2 === 0;
  const pageNum = currentPage * 2 + 1;

  const clearAuto = () => {
    if (autoRef.current) clearTimeout(autoRef.current);
  };

  const scheduleAuto = useCallback(
    (page: number) => {
      clearAuto();
      if (page < totalPages - 1) {
        autoRef.current = setTimeout(() => {
          setDir(1);
          setCurrentPage(p => Math.min(p + 1, totalPages - 1));
        }, 5200);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [totalPages],
  );

  useEffect(() => {
    if (isOpen) scheduleAuto(currentPage);
    return clearAuto;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, currentPage, scheduleAuto]);

  const goNext = () => {
    if (currentPage < totalPages - 1) {
      clearAuto();
      setDir(1);
      setCurrentPage(p => p + 1);
    }
  };

  const goPrev = () => {
    if (currentPage > 0) {
      clearAuto();
      setDir(-1);
      setCurrentPage(p => p - 1);
    } else {
      clearAuto();
      setIsOpen(false);
      setCurrentPage(0);
    }
  };

  const goTo = (i: number) => {
    if (i === currentPage) return;
    clearAuto();
    setDir(i > currentPage ? 1 : -1);
    setCurrentPage(i);
  };

  const spreadVariants = {
    enter: (_d: number) => ({ opacity: 0, scale: 0.98 }),
    center: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1] as [number, number, number, number],
      },
    },
    exit: (_d: number) => ({
      opacity: 0,
      scale: 0.98,
      transition: {
        duration: 0.35,
        ease: [0.55, 0, 1, 0.45] as [number, number, number, number],
      },
    }),
  };

  return (
    <section className="relative py-20 px-4 flex flex-col items-center justify-center overflow-hidden" style={{ backgroundColor: 'var(--v2-section-bg-alt, transparent)' }}>
      <AnimatePresence mode="wait">
        {!isOpen ? (
          <motion.div key="closed" className="flex flex-col items-center w-full">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.2, duration: 0.6 } }}
              className="text-center mb-10"
            >
              <p className={`text-xs uppercase tracking-[0.25em] mb-2 ${theme.accentText}`}>
                <EditableText
                  value={sectionEyebrow ?? 'Nuestra Historia'}
                  fieldPath="story.sectionEyebrow"
                  isEditable={editablePreview}
                  placeholder="Subtítulo decorativo…"
                />
              </p>
              <h3
                className={`text-3xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}
                style={{ fontFamily: 'var(--v2-font-special, var(--v2-font-heading, inherit))' }}
              >
                <EditableText
                  value={sectionTitle ?? 'Capítulos de Amor'}
                  fieldPath="story.sectionTitle"
                  isEditable={editablePreview}
                  placeholder="Título de sección…"
                />
              </h3>
              <div
                className="w-10 h-px mx-auto mt-5"
                style={{
                  background: `var(--v2-divider-color, ${theme.colors.accent})`,
                  opacity: 0.6,
                }}
              />
            </motion.div>

            <BookCover
              brideName={primaryName}
              groomName={secondaryName}
              theme={theme}
              onClick={() => setIsOpen(true)}
            />
          </motion.div>
        ) : (
          <motion.div
            key="open"
            initial={{ opacity: 0, scale: 0.92 }}
            animate={{
              opacity: 1,
              scale: 1,
              transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] },
            }}
            className="w-full max-w-5xl flex flex-col items-center"
          >
            {/* Book spread */}
            <div
              className="relative w-full rounded-2xl overflow-hidden"
              style={{ boxShadow: theme.shadows.book }}
            >
              <AnimatePresence initial={false} custom={dir} mode="wait">
                <motion.div
                  key={`page-${currentPage}`}
                  custom={dir}
                  variants={spreadVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="w-full"
                >
                  {isFinal ? (
                    <FinalSpread
                      brideName={primaryName}
                      groomName={secondaryName}
                      theme={theme}
                    />
                  ) : (
                    <>
                      {/* Desktop: two-page book spread */}
                      <div className="hidden lg:block">
                        <DesktopBookSpread
                          slide={currentSlide!}
                          slideIndex={currentPage}
                          pageNum={pageNum}
                          imageOnLeft={imageOnLeft}
                          theme={theme}
                          editablePreview={editablePreview}
                        />
                      </div>
                      {/* Mobile / tablet: vertical card */}
                      <div className="lg:hidden">
                        <MobileStoryCard
                          slide={currentSlide!}
                          slideIndex={currentPage}
                          pageNum={pageNum}
                          theme={theme}
                          editablePreview={editablePreview}
                        />
                      </div>
                    </>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <PageControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPrev={goPrev}
              onNext={goNext}
              onDotClick={goTo}
              theme={theme}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
