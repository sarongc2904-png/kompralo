'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { ItineraryItem } from '@/domain/invitations/types';
import { motion, Variants } from 'framer-motion';
import { Sparkles, Church, GlassWater, Utensils, Music } from 'lucide-react';
import SectionHeader from './SectionHeader';
import SectionShell from './SectionShell';

interface ItineraryProps {
  items: ItineraryItem[];
  theme: Theme;
}

const iconMap = {
  church: Church,
  rings: Sparkles,
  glass: GlassWater,
  utensils: Utensils,
  music: Music,
};

export default function Itinerary({ items, theme }: ItineraryProps) {
  const validItems = items?.filter(
    (item) => item && (item.title || item.time || item.location),
  ) ?? [];

  if (validItems.length === 0) return null;

  // Container variants for staggered entrance
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  return (
    <SectionShell className="select-none" contentClassName="max-w-5xl mx-auto">
        
        {/* Section Header */}
        <SectionHeader eyebrow="El Gran Día" title="Itinerario del Evento" theme={theme} className="mb-16 md:mb-20" />
        {/* Itinerary Cards — flex wrap so 1 or 2 cards stay centred */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: '-50px' }}
          className="flex flex-wrap justify-center gap-6 md:gap-8"
        >
          {validItems.map((item) => {
            const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Sparkles;
            return (
              <motion.div
                key={item.id}
                variants={itemVariants}
                className="relative p-8 flex flex-col items-center text-center group w-full sm:w-[280px] md:w-[300px]"
                style={{
                  isolation: 'isolate',
                  background: 'var(--v2-card-ivory-bg, linear-gradient(145deg, rgba(255,250,238,0.96), rgba(255,244,220,0.90)))',
                  backdropFilter: 'blur(22px) saturate(150%)',
                  WebkitBackdropFilter: 'blur(22px) saturate(150%)',
                  border: '1px solid var(--v2-card-border, rgba(212, 175, 95, 0.30))',
                  borderRadius: 'var(--v2-card-radius, 28px)',
                  boxShadow: '0 8px 36px rgba(120, 88, 40, 0.11), 0 1px 4px rgba(0,0,0,0.04), inset 0 1px 0 rgba(255,255,255,0.92)',
                  overflow: 'hidden',
                }}
              >
                {/* Gold top-edge accent line */}
                <div className="absolute top-0 left-8 right-8 h-px rounded-full z-10 pointer-events-none"
                  style={{ background: `linear-gradient(to right, transparent, var(--v2-color-accent, #C5A880), transparent)`, opacity: 0.5 }} />

                {/* Icon wrapper */}
                <div className={`relative w-14 h-14 rounded-full flex items-center justify-center mb-6 ${theme.accentText} group-hover:scale-110 transition-transform duration-500`}
                  style={{
                    background: 'linear-gradient(145deg, rgba(255,255,255,0.9), rgba(245,237,220,0.7))',
                      boxShadow: 'var(--v2-shadow-card, 0 4px 14px rgba(197,168,128,0.18)), inset 0 1px 1px rgba(255,255,255,0.95)',
                  }}
                >
                  <IconComponent className="w-6 h-6" strokeWidth={1.2} />
                </div>

                {/* Time Badge */}
                <span className={`text-[13px] font-mono font-semibold tracking-[0.2em] mb-3 ${theme.accentText}`}>
                  {item.time}
                </span>

                {/* Divider */}
                <div className="w-6 mb-4" style={{ height: '1px', background: `var(--v2-divider-color, #C5A880)`, opacity: 0.35 }} />

                {/* Title */}
                <h4 className={`text-lg font-light tracking-wide mb-3 ${theme.headingFont} ${theme.cardText}`}>
                  {item.title}
                </h4>

                {/* Location */}
                <p className={`text-[13px] leading-relaxed opacity-75 ${theme.bodyFont} ${theme.cardText}`}>
                  {item.location}
                </p>

                {/* Bottom subtle glow reflection */}
                <div className="absolute bottom-0 left-6 right-6 pointer-events-none"
                  style={{ height: '1px', background: `linear-gradient(to right, transparent, var(--v2-color-accent, #C5A880), transparent)`, opacity: 0.2 }} />
              </motion.div>
            );
          })}
        </motion.div>
    </SectionShell>
  );
}
