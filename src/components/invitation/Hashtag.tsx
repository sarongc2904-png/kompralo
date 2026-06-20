'use client';

import React, { useState, useEffect } from 'react';
import { Theme } from '@/domain/themes/types';
import { SocialConfig } from '@/domain/invitations/types';
import { motion, AnimatePresence, useAnimation } from 'framer-motion';
import { Copy, Check, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';
import { ThemeDivider } from '@/components/theme-v2';

interface HashtagProps {
  social: SocialConfig;
  imageUrl?: string;
  theme: Theme;
}

// Instagram gradient border ring
function IGRing({ size = 56, children }: { size?: number; children: React.ReactNode }) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%', padding: 2,
      background: 'linear-gradient(45deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888)',
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

// Floating heart burst on double-tap
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

export default function Hashtag({ social, imageUrl, theme }: HashtagProps) {
  // Hide section when all social fields are empty
  const hasSocialContent =
    social.hashtag ||
    social.instagramHandle ||
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

  // Fake "loading" comments
  const comments = [
    { user: 'mama_sofia',   text: '¡El día más esperado! 😭💕' },
    { user: 'best.friend_',  text: `¡Ya quiero que llegue! ${social.hashtag}` },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(social.hashtag).then(() => {
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
      // Double tap
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

  if (!hasSocialContent) return null;

  return (
    <section className="py-20 md:py-24 px-6 md:px-8 bg-transparent select-none">
      <div className="max-w-[420px] mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="text-center mb-10"
        >
          <p className={`text-xs uppercase tracking-[0.28em] mb-3 ${theme.accentText} ${theme.bodyFont}`}>
            Comparte el momento
          </p>
          <h3 className={`text-3xl md:text-4xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}>
            #NuestroHashtag
          </h3>
          <ThemeDivider className="mt-6" />
        </motion.div>

        {/* Instagram Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.16, 1, 0.3, 1] }}
          style={{
            background: '#fff',
            borderRadius: 14,
            overflow: 'hidden',
            boxShadow: '0 8px 40px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)',
            border: '0.5px solid rgba(0,0,0,0.08)',
          }}
        >
          {/* ── Post Header ─────────────────────────────────────────── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px' }}>
            <IGRing size={40}>
              <div style={{
                width: '100%', height: '100%',
                background: 'linear-gradient(135deg, #C5A880, #A8865A)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Heart style={{ width: 16, height: 16, color: '#fff', fill: '#fff' }} />
              </div>
            </IGRing>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: '#1a1a1a', lineHeight: 1.2 }}>
                {social.instagramHandle?.replace('@', '') ?? 'sofiaYalejandro2026'}
              </p>
              <p style={{ fontSize: 11, color: '#8e8e8e', lineHeight: 1.2 }}>Hacienda San José · Morelos</p>
            </div>
            <MoreHorizontal style={{ width: 20, height: 20, color: '#1a1a1a' }} />
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
            <HeartBurst show={burst} />
          </div>

          {/* ── Action Bar ──────────────────────────────────────────── */}
          <div style={{ padding: '10px 14px 4px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
              {/* Like */}
              <motion.button
                animate={heartControls}
                onClick={handleLike}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <Heart
                  style={{
                    width: 26, height: 26,
                    color: liked ? '#ed4956' : '#1a1a1a',
                    fill: liked ? '#ed4956' : 'none',
                    transition: 'color 0.2s, fill 0.2s',
                  }}
                />
              </motion.button>

              {/* Comment */}
              <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                <MessageCircle style={{ width: 24, height: 24, color: '#1a1a1a' }} />
              </button>

              {/* Share / Copy hashtag */}
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
                        <Send style={{ width: 24, height: 24, color: '#1a1a1a' }} />
                      </motion.div>
                  }
                </AnimatePresence>
              </button>

              {/* Spacer */}
              <div style={{ flex: 1 }} />

              {/* Save */}
              <motion.button
                whileTap={{ scale: 0.85 }}
                onClick={() => setSaved((s) => !s)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                <Bookmark
                  style={{
                    width: 24, height: 24,
                    color: saved ? '#1a1a1a' : '#1a1a1a',
                    fill: saved ? '#1a1a1a' : 'none',
                    transition: 'fill 0.2s',
                  }}
                />
              </motion.button>
            </div>

            {/* Likes count */}
            <motion.p
              key={likes}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              style={{ fontSize: 13, fontWeight: 700, color: '#1a1a1a', marginBottom: 5 }}
            >
              {likes.toLocaleString()} Me gusta
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
                  <p style={{ fontSize: 13, color: '#1a1a1a', lineHeight: 1.5 }}>
                    <span style={{ fontWeight: 700 }}>
                      {social.instagramHandle?.replace('@', '') ?? 'sofiaYalejandro2026'}
                    </span>{' '}
                    {social.note ?? 'Comparte tus fotos y usa nuestro hashtag ❤️'}
                  </p>
                  <p style={{ fontSize: 13, color: '#00376b', marginTop: 3, fontWeight: 500 }}>
                    {social.hashtag}
                  </p>
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
                  style={{ fontSize: 12, color: '#1a1a1a', marginBottom: 2 }}
                >
                  <span style={{ fontWeight: 700 }}>{c.user}</span>{' '}
                  <span style={{ color: '#555' }}>{c.text}</span>
                </motion.p>
              ))}
            </div>

            {/* Timestamp */}
            <p style={{ fontSize: 10, color: '#8e8e8e', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              Hace 1 día
            </p>
          </div>

          {/* ── Copy CTA bar ─────────────────────────────────────────── */}
          <div style={{ borderTop: '0.5px solid #efefef', padding: '10px 14px' }}>
            <button
              onClick={handleCopy}
              style={{
                width: '100%', padding: '11px',
                background: `var(--v2-btn-bg, #C5A880)`,
                border: `var(--v2-btn-border, none)`, borderRadius: `var(--v2-radius-md, 8px)`, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                boxShadow: `var(--v2-shadow-card, 0 2px 10px rgba(197,168,128,0.30))`,
              }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {copied ? (
                  <motion.span key="c" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: `var(--v2-btn-text, #fff)`, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    <Check style={{ width: 15, height: 15 }} /> ¡Copiado!
                  </motion.span>
                ) : (
                  <motion.span key="d" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, color: `var(--v2-btn-text, #fff)`, fontSize: 11, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                    <Copy style={{ width: 15, height: 15 }} /> Copiar hashtag
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
            { step: '02', text: 'Súbela a Instagram o TikTok' },
            { step: '03', text: `Usa ${social.hashtag}` },
          ].map((item) => (
            <div key={item.step} className="flex flex-col items-center gap-2 text-center max-w-[100px]">
              <span className="text-[9px] font-semibold uppercase tracking-widest" style={{ color: `var(--v2-color-accent, #C5A880)` }}>
                {item.step}
              </span>
              <p className={`text-[10px] leading-snug opacity-65 ${theme.bodyFont} ${theme.bodyText}`}>
                {item.text}
              </p>
            </div>
          ))}
        </motion.div>

      </div>
    </section>
  );
}
