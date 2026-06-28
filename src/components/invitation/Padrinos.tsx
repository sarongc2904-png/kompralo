'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { Padrino } from '@/domain/invitations/types';
import { motion } from 'framer-motion';
import ElegantInvitationCard from './ElegantInvitationCard';
import { EditableText } from '@/components/visual-editor/EditableText';

interface PadrinosProps {
  padrinos: Padrino[];
  theme: Theme;
  editablePreview?: boolean;
  sectionEyebrow?: string;
  sectionTitle?: string;
}

// Icon map per rubro
function RubroIcon({ icon, size = 20, stroke = 'var(--v2-color-accent, #C8A75D)' }: { icon: Padrino['icon']; size?: number; stroke?: string }) {
  const s = size;
  const sw = 1.3;

  const paths: Record<Padrino['icon'], React.ReactNode> = {
    flowers: (
      <>
        <circle cx="12" cy="12" r="3" stroke={stroke} strokeWidth={sw} />
        <path d="M12 5a3 3 0 1 0 0 6 3 3 0 1 0 0-6Z" stroke={stroke} strokeWidth={sw} />
        <path d="M12 13a3 3 0 1 0 0 6 3 3 0 1 0 0-6Z" stroke={stroke} strokeWidth={sw} />
        <path d="M5 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z" stroke={stroke} strokeWidth={sw} />
        <path d="M13 12a3 3 0 1 0 6 0 3 3 0 1 0-6 0Z" stroke={stroke} strokeWidth={sw} />
      </>
    ),
    cake: (
      <>
        <path d="M5 20h14M6 20v-4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v4M8 15V11a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v4M10 10V7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v3" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
        <circle cx="12" cy="4" r="1.2" fill={stroke} />
      </>
    ),
    music: (
      <>
        <path d="M9 17V5l10-2v12" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="6" cy="17" r="3" stroke={stroke} strokeWidth={sw} />
        <circle cx="16" cy="15" r="3" stroke={stroke} strokeWidth={sw} />
        <path d="M9 9l10-2" stroke={stroke} strokeWidth={sw} />
      </>
    ),
    rings: (
      <>
        <circle cx="9" cy="13" r="5.5" stroke={stroke} strokeWidth={sw} />
        <circle cx="15" cy="11" r="5.5" stroke={stroke} strokeWidth={sw} />
        <path d="M17 5.5l1.5 1.5M18.5 5.5L17 7" stroke={stroke} strokeWidth={sw} strokeLinecap="round" />
      </>
    ),
    photo: (
      <>
        <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" />
        <circle cx="12" cy="13" r="4" stroke={stroke} strokeWidth={sw} />
      </>
    ),
    video: (
      <>
        <path d="m15 10 7-5v14l-7-5z" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <rect x="1" y="6" width="14" height="12" rx="2" stroke={stroke} strokeWidth={sw} />
      </>
    ),
    lights: (
      <>
        <path d="M12 3c.2 2.5 1.5 3.8 4 4-2.5.2-3.8 1.5-4 4-.2-2.5-1.5-3.8-4-4 2.5-.2 3.8-1.5 4-4Z" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M18 14c.1 1.5.9 2.3 2.4 2.4-1.5.1-2.3.9-2.4 2.4-.1-1.5-.9-2.3-2.4-2.4 1.5-.1 2.3-.9 2.4-2.4Z" stroke={stroke} strokeWidth={sw} />
        <path d="M6 13c.1 1.2.7 1.8 1.8 1.9-1.1.1-1.7.7-1.8 1.8-.1-1.1-.7-1.7-1.8-1.8 1.1-.1 1.7-.7 1.8-1.8Z" stroke={stroke} strokeWidth={sw} />
      </>
    ),
    bar: (
      <>
        <path d="M12 22v-9M8 22h8M12 13a7 7 0 0 1-7-7V3h14v3a7 7 0 0 1-7 7ZM5 6h14" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="10" cy="8" r="0.5" fill={stroke} />
        <circle cx="12" cy="9" r="0.5" fill={stroke} />
        <circle cx="14" cy="7" r="0.5" fill={stroke} />
      </>
    ),
    car: (
      <>
        <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12.5V16c0 .6.4 1 1 1h2" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="7" cy="17" r="3" stroke={stroke} strokeWidth={sw} />
        <circle cx="17" cy="17" r="3" stroke={stroke} strokeWidth={sw} />
        <path d="M5 11h14M9 11v6M13 11v6" stroke={stroke} strokeWidth={sw} />
      </>
    ),
    church: (
      <>
        <path d="M12 2v4M10 4h4M4 22V10l8-5 8 5v12H4Z" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 22v-5a2 2 0 0 1 4 0v5M12 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 1 0 0-3Z" stroke={stroke} strokeWidth={sw} />
      </>
    ),
    dress: (
      <>
        <path d="M8 2 5 22h14L16 2M8 2l4 6 4-6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </>
    ),
    gift: (
      <>
        <rect x="3" y="8" width="18" height="13" rx="1" stroke={stroke} strokeWidth={sw} />
        <path d="M3 12h18M12 8V21M8 8c0-2 2-4 4-2 2-2 4 0 4 2" stroke={stroke} strokeWidth={sw} />
      </>
    ),
  };

  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[icon]}
    </svg>
  );
}

export default function Padrinos({ padrinos, theme, editablePreview = false, sectionEyebrow, sectionTitle }: PadrinosProps) {
  if (!padrinos || padrinos.length === 0) return null;

  return (
    <section
      className="py-20 md:py-28 px-6 md:px-8 select-none"
      style={{
        backgroundImage: 'url(https://djztbgidfrhpkmyvhuyo.supabase.co/storage/v1/object/public/invitation-assets/backgrounds/fondo_3.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className={`text-xs uppercase tracking-[0.28em] mb-3 ${theme.accentText} ${theme.bodyFont}`}>
            <EditableText
              value={sectionEyebrow ?? 'Quienes hacen posible este día'}
              fieldPath="hero.padrinosSectionEyebrow"
              isEditable={editablePreview}
            />
          </p>
          <h3 className={`text-3xl md:text-4xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}>
            <EditableText
              value={sectionTitle ?? 'Nuestros Padrinos'}
              fieldPath="hero.padrinosSectionTitle"
              isEditable={editablePreview}
            />
          </h3>
          <div className="flex items-center justify-center gap-3 mt-6 mb-5">
            <div className="h-px w-10" style={{ background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }} />
            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true" style={{ fill: `var(--v2-color-accent, #C5A880)` }}>
              <path d="M12 2l2.4 7.4H22l-6.2 4.5 2.4 7.4L12 17l-6.2 4.3 2.4-7.4L2 9.4h7.6z"/>
            </svg>
            <div className="h-px w-10" style={{ background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }} />
          </div>
          <p className={`text-xs opacity-65 max-w-sm mx-auto leading-relaxed ${theme.bodyFont} ${theme.bodyText}`}>
            Con gratitud eterna a las familias que nos acompañan y hacen posible nuestra celebración.
          </p>
        </motion.div>

        {/* Cards — flex wrap so 1 or 2 cards stay centred */}
        <div className="flex flex-wrap justify-center gap-4">
          {padrinos.map((p, i) => (
            <ElegantInvitationCard
              key={p.id}
              animateFrom="bottom"
              animateDelay={i * 0.06}
              className="flex flex-col items-center text-center w-[150px] sm:w-[170px]"
              style={{ padding: '24px 16px 20px' }}
            >
              {/* Icon medallion */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, rgba(255, 251, 242, 0.9) 0%, rgba(245, 235, 210, 0.75) 100%)',
                border: `1px solid var(--v2-color-border-strong, rgba(200,167,93,0.45))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12, flexShrink: 0,
                boxShadow: `inset 0 1px 3px rgba(255,255,255,0.85), 0 3px 8px rgba(116,84,38,0.04), 0 0 0 3px var(--v2-color-accent-soft, rgba(200,167,93,0.08))`,
              }}>
                <RubroIcon icon={p.icon} size={20} stroke="var(--v2-color-accent, #C8A75D)" />
              </div>

              {/* Rubro */}
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.18em] font-bold mb-2" style={{ color: `var(--v2-color-accent, #C8A75D)` }}>
                <EditableText value={p.rubro} fieldPath={`padrinos.${i}.rubro`} isEditable={editablePreview} />
              </p>

              {/* Divider */}
              <div style={{ width: 24, height: 1, background: `var(--v2-divider-color, #C8A75D)`, opacity: 0.35, marginBottom: 10 }} />

              {/* Names */}
              {p.names.map((name, ni) => (
                <p key={ni} className="text-[13px] sm:text-[14px] font-medium leading-snug" style={{ color: `var(--v2-color-text-primary, #1F1A16)` }}>
                  <EditableText value={name} fieldPath={`padrinos.${i}.names.${ni}`} isEditable={editablePreview} />
                </p>
              ))}
            </ElegantInvitationCard>
          ))}
        </div>

        {/* Bottom ornament */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.3 }}
          className="flex justify-center mt-14"
        >
          <svg width="180" height="20" viewBox="0 0 180 20" fill="none" aria-hidden="true" style={{ opacity: 0.30, color: `var(--v2-color-accent, #C5A880)` }}>
            <line x1="0" y1="10" x2="72" y2="10" stroke="currentColor" strokeWidth="0.7"/>
            <circle cx="79" cy="10" r="2.5" fill="currentColor"/>
            <circle cx="90" cy="10" r="5" stroke="currentColor" strokeWidth="0.7" fill="none"/>
            <circle cx="101" cy="10" r="2.5" fill="currentColor"/>
            <line x1="108" y1="10" x2="180" y2="10" stroke="currentColor" strokeWidth="0.7"/>
          </svg>
        </motion.div>

      </div>
    </section>
  );
}
