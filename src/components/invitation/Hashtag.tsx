'use client';

import React, { useState, useEffect } from 'react';
import { Theme } from '@/domain/themes/types';
import { SocialConfig } from '@/domain/invitations/types';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Copy, Check, Heart, MessageCircle, Bookmark, MoreHorizontal, ThumbsUp, Share2, Play } from 'lucide-react';
import SectionShell from './SectionShell';
import SectionHeader from './SectionHeader';
import { EditableText } from '@/components/visual-editor/EditableText';

interface HashtagProps {
  social: SocialConfig;
  imageUrl?: string;
  theme: Theme;
  editablePreview?: boolean;
  brideName?: string;
  groomName?: string;
  venueName?: string;
}

// Demo fixture values — treat these as "not configured" for real invitations.
const FIXTURE_HASHTAG  = 'SofíaYAlejandro';
const FIXTURE_INSTAGRAM = 'sofiaYalejandro2026';
const FIXTURE_TIKTOK    = 'sofiaYalejandro2026';

/**
 * Returns a cleaned SocialConfig where fixture demo values are replaced by
 * meaningful defaults (hashtag auto-generated from names, handles cleared).
 * A value set by the user (different from the fixture) is kept as-is.
 */
function sanitizeSocial(social: SocialConfig, brideName?: string, groomName?: string): SocialConfig {
  const cleaned: SocialConfig = { ...social };

  // Hashtag: auto-generate from names if stored value is empty or the fixture default
  const storedHashtag = stripHash(social.hashtag);
  if (!storedHashtag || storedHashtag === FIXTURE_HASHTAG) {
    const n1 = (brideName ?? '').replace(/\s+/g, '');
    const n2 = (groomName ?? '').replace(/\s+/g, '');
    cleaned.hashtag = n1 && n2 ? `${n1}Y${n2}` : (n1 || n2 || '');
  }

  // Instagram handle: replace fixture value with auto-generated handle from names
  const storedInsta = social.instagramHandle?.replace('@', '') ?? '';
  if (!storedInsta || storedInsta === FIXTURE_INSTAGRAM) {
    const n1 = (brideName ?? '').replace(/\s+/g, '').toLowerCase();
    const n2 = (groomName ?? '').replace(/\s+/g, '').toLowerCase();
    cleaned.instagramHandle = n1 || n2 ? `${n1}Y${n2}` : undefined;
  }

  // TikTok handle: same pattern
  const storedTiktok = social.tiktokHandle?.replace('@', '') ?? '';
  if (!storedTiktok || storedTiktok === FIXTURE_TIKTOK) {
    const n1 = (brideName ?? '').replace(/\s+/g, '').toLowerCase();
    const n2 = (groomName ?? '').replace(/\s+/g, '').toLowerCase();
    cleaned.tiktokHandle = n1 || n2 ? `${n1}Y${n2}` : undefined;
  }

  return cleaned;
}


// Strip a leading '#' so values stored with or without it display the same way.
function stripHash(tag: string | null | undefined): string {
  if (!tag) return '';
  return tag.startsWith('#') ? tag.slice(1) : tag;
}

// ─── Platform detection ───────────────────────────────────────────────────────

type SocialPlatform = 'instagram' | 'tiktok' | 'facebook' | 'youtube';

function getPrimarySocialPlatform(social: SocialConfig): SocialPlatform {
  const hasInsta    = !!social.instagramHandle;
  const hasTiktok   = !!social.tiktokHandle;
  const hasFacebook = !!social.facebookUrl;
  const hasYoutube  = !!social.youtubeUrl;

  const count = [hasInsta, hasTiktok, hasFacebook, hasYoutube].filter(Boolean).length;

  if (count !== 1) return 'instagram';
  if (hasInsta)    return 'instagram';
  if (hasTiktok)   return 'tiktok';
  if (hasFacebook) return 'facebook';
  if (hasYoutube)  return 'youtube';
  return 'instagram';
}

const PLATFORM_META: Record<SocialPlatform, {
  ringGradient: string;
  getHandle: (social: SocialConfig) => string;
  copyLabel: string;
  shareLabel: string;
  step02: string;
  step03: (social: SocialConfig) => string;
}> = {
  instagram: {
    ringGradient: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
    getHandle: (s) => s.instagramHandle?.replace('@', '') ?? 'bodakomparto2026',
    copyLabel: 'Copiar hashtag',
    shareLabel: 'Compartir',
    step02: 'Súbela a Instagram',
    step03: (s) => `Usa #${stripHash(s.hashtag) || 'nuestrohashtag'}`,
  },
  tiktok: {
    ringGradient: 'linear-gradient(135deg, #010101 0%, #fe2c55 50%, #25f4ee 100%)',
    getHandle: (s) => s.tiktokHandle?.replace('@', '') ?? 'bodakomparto2026',
    copyLabel: 'Copiar hashtag',
    shareLabel: 'Compartir',
    step02: 'Súbela a TikTok',
    step03: (s) => `Usa #${stripHash(s.hashtag) || 'nuestrohashtag'}`,
  },
  facebook: {
    ringGradient: 'linear-gradient(135deg, #1877f2, #0d6efd)',
    getHandle: (s) => s.facebookUrl ? 'Página de la boda' : 'facebook.com/boda',
    copyLabel: 'Ver en Facebook',
    shareLabel: 'Me gusta',
    step02: 'Compártela en Facebook',
    step03: (s) => s.hashtag ? `Etiqueta #${stripHash(s.hashtag)}` : 'Etiqueta nuestra página',
  },
  youtube: {
    ringGradient: 'linear-gradient(135deg, #ff0000, #cc0000)',
    getHandle: (s) => s.youtubeUrl ? 'Canal de la boda' : 'youtube.com/boda',
    copyLabel: 'Ver en YouTube',
    shareLabel: 'Compartir',
    step02: 'Compártelo en YouTube',
    step03: (s) => s.hashtag ? `Usa #${stripHash(s.hashtag)}` : 'Suscríbete al canal',
  },
};

// ─── Sub-components ───────────────────────────────────────────────────────────

function AvatarRing({ gradient, size = 40, children }: { gradient: string; size?: number; children: React.ReactNode }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%', padding: 2,
      background: gradient,
      flexShrink: 0,
    }}>
      <div style={{
        width: '100%', height: '100%', borderRadius: '50%',
        background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {children}
      </div>
    </div>
  );
}

function HeartBurst({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.3 }}
          animate={{ opacity: [0, 1, 1, 0], scale: [0.3, 1.4, 1.2, 0.8] }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            pointerEvents: 'none', zIndex: 20,
          }}
        >
          <Heart style={{ width: 80, height: 80, color: '#fff', fill: '#fff', filter: 'drop-shadow(0 4px 16px rgba(0,0,0,0.3))' }} />
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Hashtag({ social, imageUrl, theme, editablePreview = false, brideName, groomName, venueName }: HashtagProps) {
  // socialDisplay has fixture demo values replaced with real/derived values.
  const socialDisplay = sanitizeSocial(social, brideName, groomName);
  const effectiveHashtag = stripHash(socialDisplay.hashtag);

  const hasSocialContent =
    effectiveHashtag ||
    socialDisplay.instagramHandle ||
    social.tiktokHandle ||
    social.facebookUrl ||
    social.youtubeUrl;

  const [copied, setCopied]       = useState(false);
  const [liked, setLiked]         = useState(false);
  const [saved, setSaved]         = useState(false);
  const [likes, setLikes]         = useState(2847);
  const [burst, setBurst]         = useState(false);
  const [lastTap, setLastTap]     = useState(0);
  const [showCaption, setShowCaption] = useState(false);
  const heartControls             = useAnimation();

  const platform = getPrimarySocialPlatform(socialDisplay);
  const meta     = PLATFORM_META[platform];

  const brideFirst = (brideName ?? '').split(' ')[0].toLowerCase() || 'novia';
  const comments = [
    { user: `mama_de_${brideFirst}`,  text: '¡El día más esperado! 😭💕' },
    { user: 'mejor_amiga_',           text: `¡Ya quiero que llegue! ${effectiveHashtag ? '#' + effectiveHashtag : ''}` },
  ];

  const handleCopy = () => {
    const textToCopy = effectiveHashtag
      ? `#${effectiveHashtag}`
      : social.facebookUrl || social.youtubeUrl || '';
    navigator.clipboard.writeText(textToCopy).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleLike = async () => {
    if (liked) {
      setLiked(false);
      setLikes((l) => l - 1);
    } else {
      setLiked(true);
      setLikes((l) => l + 1);
      await heartControls.start({ scale: [1, 1.4, 0.9, 1.1, 1], transition: { duration: 0.4 } });
    }
  };

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap < 350) {
      if (!liked) {
        setLiked(true);
        setLikes((l) => l + 1);
      }
      setBurst(true);
      setTimeout(() => setBurst(false), 800);
    }
    setLastTap(now);
  };

  useEffect(() => {
    const t = setTimeout(() => setShowCaption(true), 600);
    return () => clearTimeout(t);
  }, []);

  const photoUrl = imageUrl || 'https://images.unsplash.com/photo-1522673607200-164d1b6ce486?q=80&w=800';
  const handle   = meta.getHandle(socialDisplay);

  if (!hasSocialContent && !editablePreview) return null;

  return (
    <SectionShell className="select-none" contentClassName="max-w-[420px] mx-auto">
      {/* Header */}
      <SectionHeader
        eyebrow={social.sectionEyebrow ?? 'Comparte el momento'}
        title={effectiveHashtag ? `#${effectiveHashtag}` : '#NuestroHashtag'}
        theme={theme}
        className="mb-10"
        editablePreview={editablePreview}
        eyebrowFieldPath="social.sectionEyebrow"
      />

      {/* Post Card */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
        style={{
          background: platform === 'tiktok' ? '#161823' : 'var(--v2-surface-elevated, #FFFDF8)',
          borderRadius: 18,
          overflow: 'hidden',
          boxShadow: 'var(--v2-shadow-card, 0 8px 36px rgba(120, 88, 40, 0.11))',
          border: platform === 'tiktok'
            ? '1px solid rgba(255,255,255,0.08)'
            : '1px solid var(--v2-color-border, rgba(200, 167, 93, 0.28))',
        }}
      >
        {/* ── Post Header ─────────────────────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '12px 14px' }}>
          <AvatarRing gradient={meta.ringGradient} size={40}>
            <div style={{
              width: '100%', height: '100%',
              background: 'linear-gradient(135deg, var(--v2-color-accent, #C8A75D), var(--v2-color-accent-hover, #D4B870))',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Heart style={{ width: 16, height: 16, color: '#fff', fill: '#fff' }} />
            </div>
          </AvatarRing>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: 13, fontWeight: 600,
              color: platform === 'tiktok' ? '#ffffff' : 'var(--v2-color-text-primary, #1F1A16)',
              lineHeight: 1.2,
            }}>
              {handle}
            </p>
            <p style={{
              fontSize: 11,
              color: platform === 'tiktok' ? 'rgba(255,255,255,0.5)' : 'var(--v2-color-text-muted, #8A7665)',
              lineHeight: 1.2,
            }}>
              {platform === 'instagram' && (venueName || 'Tu evento especial')}
              {platform === 'tiktok'    && 'TikTok · Boda'}
              {platform === 'facebook'  && 'Facebook · Boda'}
              {platform === 'youtube'   && 'YouTube · Video de boda'}
            </p>
          </div>
          <MoreHorizontal style={{
            width: 20, height: 20,
            color: platform === 'tiktok' ? 'rgba(255,255,255,0.7)' : 'var(--v2-color-text-primary, #1F1A16)',
          }} />
        </div>

        {/* ── Photo ───────────────────────────────────────────────── */}
        <div
          style={{ position: 'relative', aspectRatio: '1/1', cursor: 'pointer', overflow: 'hidden' }}
          onClick={handleDoubleTap}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Foto de boda"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          {platform === 'youtube' && (
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(0,0,0,0.3)',
            }}>
              <div style={{
                width: 60, height: 60, borderRadius: '50%',
                background: '#ff0000',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Play style={{ width: 28, height: 28, color: '#fff', fill: '#fff', marginLeft: 3 }} />
              </div>
            </div>
          )}
          <HeartBurst show={burst} />
        </div>

        {/* ── Action Bar ──────────────────────────────────────────── */}
        <div style={{ padding: '12px 14px 4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
            {/* Like */}
            <motion.button
              animate={heartControls}
              onClick={handleLike}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              {platform === 'facebook' ? (
                <ThumbsUp
                  style={{
                    width: 26, height: 26,
                    color: liked ? '#1877f2' : 'var(--v2-color-text-primary, #1F1A16)',
                    fill: liked ? '#1877f2' : 'none',
                    transition: 'color 0.2s, fill 0.2s',
                  }}
                />
              ) : (
                <Heart
                  style={{
                    width: 26, height: 26,
                    color: liked ? '#ed4956' : (platform === 'tiktok' ? '#fff' : 'var(--v2-color-text-primary, #1F1A16)'),
                    fill: liked ? '#ed4956' : 'none',
                    transition: 'color 0.2s, fill 0.2s',
                  }}
                />
              )}
            </motion.button>

            {/* Comment */}
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
              <MessageCircle style={{
                width: 24, height: 24,
                color: platform === 'tiktok' ? '#fff' : 'var(--v2-color-text-primary, #1F1A16)',
              }} />
            </button>

            {/* Share / Copy */}
            <button
              onClick={handleCopy}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied
                  ? <motion.div key="check" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Check style={{ width: 24, height: 24, color: `var(--v2-color-accent, #C5A880)` }} />
                    </motion.div>
                  : <motion.div key="send" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                      <Share2 style={{
                        width: 24, height: 24,
                        color: platform === 'tiktok' ? '#fff' : 'var(--v2-color-text-primary, #1F1A16)',
                      }} />
                    </motion.div>
                }
              </AnimatePresence>
            </button>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Save */}
            {(platform === 'instagram' || platform === 'tiktok') && (
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setSaved((s) => !s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <Bookmark
                  style={{
                    width: 24, height: 24,
                    color: platform === 'tiktok' ? '#fff' : 'var(--v2-color-text-primary, #1F1A16)',
                    fill: saved ? (platform === 'tiktok' ? '#fff' : 'var(--v2-color-text-primary, #1F1A16)') : 'none',
                    transition: 'fill 0.2s',
                  }}
                />
              </motion.button>
            )}
          </div>

          {/* Likes count */}
          <motion.p
            key={likes}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              fontSize: 13, fontWeight: 700,
              color: platform === 'tiktok' ? '#fff' : 'var(--v2-color-text-primary, #1F1A16)',
              marginBottom: 5,
            }}
          >
            {likes.toLocaleString()} {platform === 'facebook' ? 'Me gusta' : platform === 'youtube' ? 'reproducciones' : 'Me gusta'}
          </motion.p>

          {/* Caption */}
          <AnimatePresence>
            {showCaption && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                transition={{ duration: 0.5 }}
                style={{ marginBottom: 8 }}
              >
                <p style={{
                  fontSize: 13,
                  color: platform === 'tiktok' ? 'rgba(255,255,255,0.85)' : 'var(--v2-color-text-primary, #1F1A16)',
                  lineHeight: 1.5,
                }}>
                  <span style={{ fontWeight: 700 }}>{handle}</span>{' '}
                  <EditableText
                    value={social.note ?? 'Comparte tus fotos y usa nuestro hashtag ??'}
                    fieldPath="social.note"
                    isEditable={editablePreview}
                  />
                </p>
                {(effectiveHashtag || editablePreview) && (
                  <p style={{ fontSize: 13, color: 'var(--v2-color-accent, #C8A75D)', marginTop: 3, fontWeight: 600 }}>
                    #<EditableText
                      value={effectiveHashtag}
                      fieldPath="social.hashtag"
                      isEditable={editablePreview}
                      placeholder="Hashtag"
                    />
                  </p>
                )}
                {editablePreview && (
                  <div style={{ marginTop: 8, display: 'grid', gap: 4 }}>
                    <p style={{ fontSize: 11, color: platform === 'tiktok' ? 'rgba(255,255,255,0.75)' : 'var(--v2-color-text-secondary, #5C4A3E)' }}>
                      Instagram @<EditableText value={social.instagramHandle ?? ''} fieldPath="social.instagramHandle" isEditable placeholder="usuario" />
                    </p>
                    <p style={{ fontSize: 11, color: platform === 'tiktok' ? 'rgba(255,255,255,0.75)' : 'var(--v2-color-text-secondary, #5C4A3E)' }}>
                      TikTok @<EditableText value={social.tiktokHandle ?? ''} fieldPath="social.tiktokHandle" isEditable placeholder="usuario" />
                    </p>
                    <p style={{ fontSize: 11, color: platform === 'tiktok' ? 'rgba(255,255,255,0.75)' : 'var(--v2-color-text-secondary, #5C4A3E)', wordBreak: 'break-all' }}>
                      Facebook <EditableText value={social.facebookUrl ?? ''} fieldPath="social.facebookUrl" isEditable placeholder="URL" />
                    </p>
                    <p style={{ fontSize: 11, color: platform === 'tiktok' ? 'rgba(255,255,255,0.75)' : 'var(--v2-color-text-secondary, #5C4A3E)', wordBreak: 'break-all' }}>
                      YouTube <EditableText value={social.youtubeUrl ?? ''} fieldPath="social.youtubeUrl" isEditable placeholder="URL" />
                    </p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Comments */}
          <div style={{ marginBottom: 6 }}>
            {comments.map((c, i) => (
              <motion.p
                key={i}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.15 }}
                style={{
                  fontSize: 12,
                  color: platform === 'tiktok' ? 'rgba(255,255,255,0.75)' : 'var(--v2-color-text-primary, #1F1A16)',
                  marginBottom: 2,
                }}
              >
                <span style={{ fontWeight: 700 }}>{c.user}</span>{' '}
                <span style={{ opacity: 0.9 }}>{c.text}</span>
              </motion.p>
            ))}
          </div>

          {/* Timestamp */}
          <p style={{
            fontSize: 10,
            color: platform === 'tiktok' ? 'rgba(255,255,255,0.4)' : 'var(--v2-color-text-muted, #8A7665)',
            textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12,
          }}>
            Hace 1 día
          </p>
        </div>

        {/* ── Copy CTA bar ─────────────────────────────────────────── */}
        <div style={{
          borderTop: platform === 'tiktok'
            ? '0.5px solid rgba(255,255,255,0.1)'
            : '0.5px solid var(--v2-color-border, rgba(200, 167, 93, 0.20))',
          padding: '12px 14px',
        }}>
          <button
            onClick={handleCopy}
            className="w-full py-3 text-[10px] uppercase tracking-[0.22em] font-semibold transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow hover:-translate-y-0.5"
            style={{
              borderRadius: '30px',
              border: platform === 'tiktok'
                ? '1px solid rgba(255,255,255,0.2)'
                : '1px solid var(--v2-color-border, rgba(200, 167, 93, 0.35))',
              background: platform === 'tiktok'
                ? 'rgba(255,255,255,0.08)'
                : 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,250,238,0.6) 100%)',
              color: platform === 'tiktok'
                ? '#fff'
                : 'var(--v2-color-text-primary, #1F1A16)',
              backdropFilter: 'blur(8px)',
            }}
          >
            <AnimatePresence mode="wait" initial={false}>
              {copied ? (
                <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Check style={{ width: 14, height: 14 }} /> ¡Copiado!
                </motion.span>
              ) : (
                <motion.span key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Copy style={{ width: 14, height: 14 }} /> {meta.copyLabel}
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Steps */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="flex items-start justify-center gap-8 mt-10 flex-wrap"
      >
        {[
          { step: '01', text: 'Toma tu foto favorita del día' },
          { step: '02', text: meta.step02 },
          { step: '03', text: meta.step03(socialDisplay) },
        ].map((item) => (
          <div key={item.step} className="flex flex-col items-center gap-2 text-center max-w-[100px]">
            <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: `var(--v2-color-accent, #C8A75D)` }}>
              {item.step}
            </span>
            <p className={`text-[10px] leading-snug opacity-80 ${theme.bodyFont}`} style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}>
              {item.text}
            </p>
          </div>
        ))}
      </motion.div>
    </SectionShell>
  );
}
