'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { Padrino } from '@/domain/invitations/types';
import { motion } from 'framer-motion';
import ElegantInvitationCard from './ElegantInvitationCard';

interface PadrinosProps {
  padrinos: Padrino[];
  theme: Theme;
}

// Icon map per rubro
function RubroIcon({ icon, size = 20, stroke = 'var(--v2-color-accent, #EDD8A0)' }: { icon: Padrino['icon']; size?: number; stroke?: string }) {
  const s = size;
  const sw = 1.3;

  const paths: Record<Padrino['icon'], React.ReactNode> = {
    flowers: <><circle cx="12" cy="8" r="3" stroke={stroke} strokeWidth={sw}/><path d="M12 2c0 3-3 3-3 6s3 3 3 6M12 2c0 3 3 3 3 6s-3 3-3 6" stroke={stroke} strokeWidth={sw}/><path d="M6 8c3 0 3 3 6 3s3-3 6-3M6 8c3 0 3-3 6-3s3 3 6 3" stroke={stroke} strokeWidth={sw}/></>,
    cake: <><rect x="3" y="11" width="18" height="9" rx="1" stroke={stroke} strokeWidth={sw}/><path d="M3 11V9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2" stroke={stroke} strokeWidth={sw}/><path d="M8 7V5M12 7V4M16 7V5" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/></>,
    music: <><path d="M9 18V5l12-2v13" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/><circle cx="6" cy="18" r="3" stroke={stroke} strokeWidth={sw}/><circle cx="18" cy="16" r="3" stroke={stroke} strokeWidth={sw}/></>,
    rings: <><circle cx="8" cy="12" r="5" stroke={stroke} strokeWidth={sw}/><circle cx="16" cy="12" r="5" stroke={stroke} strokeWidth={sw}/></>,
    photo: <><rect x="3" y="5" width="18" height="14" rx="2" stroke={stroke} strokeWidth={sw}/><circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth={sw}/><path d="M3 9h1M20 9h1" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/></>,
    video: <><rect x="2" y="7" width="14" height="10" rx="1" stroke={stroke} strokeWidth={sw}/><path d="m16 11 6-4v10l-6-4Z" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/></>,
    lights: <><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/><circle cx="12" cy="12" r="4" stroke={stroke} strokeWidth={sw}/></>,
    bar: <><path d="M8 22V12L3 3h18l-5 9v10" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/><path d="M8 22h8" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/></>,
    car: <><path d="M5 17H3a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h1l3-4h10l3 4h1a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/><circle cx="7.5" cy="17" r="2.5" stroke={stroke} strokeWidth={sw}/><circle cx="16.5" cy="17" r="2.5" stroke={stroke} strokeWidth={sw}/></>,
    church: <><path d="M12 2v6M9 5h6" stroke={stroke} strokeWidth={sw} strokeLinecap="round"/><path d="M4 22V10l8-6 8 6v12" stroke={stroke} strokeWidth={sw} strokeLinejoin="round"/><path d="M9 22v-6h6v6" stroke={stroke} strokeWidth={sw}/></>,
    dress: <><path d="M8 2 5 22h14L16 2M8 2l4 6 4-6" stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round"/></>,
    gift: <><rect x="3" y="8" width="18" height="13" rx="1" stroke={stroke} strokeWidth={sw}/><path d="M3 12h18" stroke={stroke} strokeWidth={sw}/><path d="M12 8V21" stroke={stroke} strokeWidth={sw}/><path d="M8 8c0-2 2-4 4-2 2-2 4 0 4 2" stroke={stroke} strokeWidth={sw}/></>,
  };

  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {paths[icon]}
    </svg>
  );
}

export default function Padrinos({ padrinos, theme }: PadrinosProps) {
  if (!padrinos || padrinos.length === 0) return null;

  return (
    <section className="py-20 md:py-28 px-6 md:px-8 bg-transparent select-none">
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
            Quienes hacen posible este día
          </p>
          <h3 className={`text-3xl md:text-4xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}>
            Nuestros Padrinos
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
              className="flex flex-col items-center text-center w-[140px] sm:w-[160px]"
              style={{ padding: '22px 14px 18px' }}
            >
              {/* Icon medallion */}
              <div style={{
                width: 48, height: 48, borderRadius: '50%',
                background: 'linear-gradient(135deg, #2A2418 0%, #1C1509 100%)',
                border: `1px solid var(--v2-color-border-strong, rgba(197,168,128,0.45))`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                marginBottom: 12, flexShrink: 0,
                boxShadow: `0 4px 12px rgba(0,0,0,0.22), 0 0 0 3px var(--v2-color-accent-soft, rgba(197,168,128,0.10))`,
              }}>
                <RubroIcon icon={p.icon} size={20} />
              </div>

              {/* Rubro */}
              <p className="text-[11px] uppercase tracking-[0.2em] font-semibold mb-2" style={{ color: `var(--v2-color-accent, #C5A880)` }}>
                {p.rubro}
              </p>

              {/* Divider */}
              <div style={{ width: 24, height: 1, background: `var(--v2-divider-color, #C5A880)`, opacity: 0.35, marginBottom: 10 }} />

              {/* Names */}
              {p.names.map((name, ni) => (
                <p key={ni} className="text-[14px] font-light leading-snug" style={{ color: `var(--v2-color-text-primary, #3D2B1A)` }}>
                  {name}
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
