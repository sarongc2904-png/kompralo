'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import ElegantInvitationCard from './ElegantInvitationCard';
import SectionShell from './SectionShell';
import SectionHeader from './SectionHeader';

interface DressCodeProps {
  dressCode: {
    type: string;
    description: string;
    suggestions: string;
    colors?: string[];
  };
  theme: Theme;
}

function getColorLabel(hex: string): string {
  const clean = hex.toUpperCase().trim();
  if (clean.startsWith('#')) {
    if (clean === '#F5ECD9' || clean === '#FAF6EE' || clean === '#FBF7EF' || clean === '#FFFDF8') return 'Ivory';
    if (clean === '#C8A75D' || clean === '#D4B870' || clean === '#C5A880') return 'Dorado';
    if (clean === '#5C4A3E' || clean === '#8A7665') return 'Marrón';
    if (clean === '#1F1A16' || clean === '#0D0A07') return 'Oscuro';
    return clean;
  }
  return hex;
}

export default function DressCode({ dressCode, theme }: DressCodeProps) {
  if (!dressCode) return null;

  return (
    <SectionShell className="text-center select-none" contentClassName="max-w-xl mx-auto">
      {/* Header */}
      <SectionHeader eyebrow="Código de Vestimenta" title="Etiqueta Requerida" theme={theme} className="mb-10" />

      {/* Info Card */}
      <ElegantInvitationCard animateFrom="bottom" animateDelay={0.1} className="p-8 md:p-12">
        <div 
          className="inline-block p-3 rounded-full mb-6" 
          style={{ 
            background: `var(--v2-color-accent-soft, rgba(200, 167, 93, 0.12))`,
            border: '1px solid var(--v2-color-border, rgba(200, 167, 93, 0.25))' 
          }}
        >
          <Sparkles className="w-5 h-5" style={{ color: 'var(--v2-color-accent, #C8A75D)' }} />
        </div>

        <h4
          className={`text-3xl md:text-4xl font-normal tracking-wide mb-4 ${theme.headingFont}`}
          style={{ fontFamily: 'var(--v2-font-heading, inherit)', color: 'var(--v2-color-text-primary, #1F1A16)' }}
        >
          {dressCode.type}
        </h4>

        <p
          className={`text-lg md:text-xl leading-relaxed mb-8 ${theme.bodyFont}`}
          style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)', opacity: 0.95 }}
        >
          {dressCode.description}
        </p>

        {/* Color Swatches — Priority: user colors > theme fallback */}
        {(() => {
          const colorsToDisplay = dressCode.colors && dressCode.colors.length > 0
            ? dressCode.colors
            : (theme.dressCodeSwatches && theme.dressCodeSwatches.length > 0 ? theme.dressCodeSwatches : null);

          return colorsToDisplay ? (
            <div className="mt-8">
              <p className={`text-[13px] md:text-[14px] uppercase tracking-[0.22em] mb-4 ${theme.bodyFont}`} style={{ color: 'var(--v2-color-text-muted, #8A7665)' }}>
                {dressCode.colors && dressCode.colors.length > 0 ? 'Paleta de Colores' : 'Sugerencia de Colores'}
              </p>

              <div className="flex flex-wrap gap-4 justify-center items-center">
                {colorsToDisplay.map((color, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      type: 'spring',
                      stiffness: 150,
                      damping: 15,
                      delay: index * 0.08,
                    }}
                    className="flex-shrink-0 flex flex-col items-center gap-1.5"
                  >
                    <div
                      className="w-10 h-10 rounded-full border border-black/10 shadow-sm"
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                    <span className="text-[11px] md:text-[12px] uppercase tracking-wider font-mono" style={{ color: 'var(--v2-color-text-muted, #8A7665)', opacity: 0.75 }}>
                      {getColorLabel(color)}
                    </span>
                  </motion.div>
                ))}
              </div>
            </div>
          ) : null;
        })()}

        {/* Important notes */}
        {dressCode.suggestions && (
          <p 
            className={`text-base md:text-lg italic mt-8 pt-6 leading-relaxed ${theme.bodyFont}`}
            style={{ 
              borderTop: `1px solid var(--v2-color-border, rgba(200, 167, 93, 0.25))`,
              color: 'var(--v2-color-text-secondary, #5C4A3E)'
            }}
          >
            * {dressCode.suggestions}
          </p>
        )}
      </ElegantInvitationCard>
    </SectionShell>
  );
}
