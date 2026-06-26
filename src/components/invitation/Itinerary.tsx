'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { ItineraryItem } from '@/domain/invitations/types';
import { Sparkles, Church, GlassWater, Utensils, Music } from 'lucide-react';
import SectionHeader from './SectionHeader';
import SectionShell from './SectionShell';
import ElegantInvitationCard from './ElegantInvitationCard';
import { EditableText } from '@/components/visual-editor/EditableText';

interface ItineraryProps {
  items: ItineraryItem[];
  theme: Theme;
  editablePreview?: boolean;
}

const iconMap = {
  church: Church,
  rings: Sparkles,
  glass: GlassWater,
  utensils: Utensils,
  music: Music,
};

export default function Itinerary({ items, theme, editablePreview = false }: ItineraryProps) {
  const validItems = items
    ?.map((item, originalIndex) => ({ item, originalIndex }))
    .filter(({ item }) => item && (item.title || item.time || item.location)) ?? [];

  if (validItems.length === 0) return null;

  return (
    <SectionShell className="select-none" contentClassName="max-w-5xl mx-auto">
      {/* Section Header */}
      <SectionHeader eyebrow="El Gran Día" title="Itinerario del Evento" theme={theme} className="mb-16 md:mb-20" />
      
      {/* Itinerary Cards — flex wrap so 1 or 2 cards stay centred */}
      <div className="flex flex-wrap justify-center gap-6 md:gap-8">
        {validItems.map(({ item, originalIndex }, index) => {
          const IconComponent = iconMap[item.icon as keyof typeof iconMap] || Sparkles;
          return (
            <ElegantInvitationCard
              key={item.id}
              animateDelay={index * 0.12}
              className="relative p-8 flex flex-col items-center text-center group w-full sm:w-[280px] md:w-[300px]"
              style={{ isolation: 'isolate' }}
            >
              {/* Gold top-edge accent line */}
              <div className="absolute top-0 left-8 right-8 h-px rounded-full z-10 pointer-events-none"
                style={{ background: `linear-gradient(to right, transparent, var(--v2-color-accent, #C5A880), transparent)`, opacity: 0.5 }} />

              {/* Icon wrapper */}
              <div className="relative w-14 h-14 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500"
                style={{
                  background: 'linear-gradient(145deg, rgba(255,255,255,0.95), rgba(255,250,238,0.7))',
                  border: '1px solid var(--v2-color-border, rgba(200, 167, 93, 0.35))',
                  boxShadow: '0 4px 12px rgba(116, 84, 38, 0.05), inset 0 1px 1px rgba(255, 255, 255, 0.9)',
                  color: 'var(--v2-color-accent, #C8A75D)',
                }}
              >
                <IconComponent className="w-6 h-6" strokeWidth={1.2} />
                
                {/* Gold ring around icon wrapper */}
                <div 
                  className="absolute -inset-1 rounded-full pointer-events-none" 
                  style={{ border: '0.75px solid var(--v2-color-border, rgba(200, 167, 93, 0.20))', opacity: 0.8 }} 
                />
              </div>

              {/* Time Badge */}
              <span className="text-[14px] md:text-[15px] font-mono font-semibold tracking-[0.2em] mb-3" style={{ color: 'var(--v2-color-accent, inherit)' }}>
                <EditableText value={item.time} fieldPath={`itinerary.${originalIndex}.time`} isEditable={editablePreview} />
              </span>

              {/* Divider */}
              <div className="w-6 mb-4" style={{ height: '1px', background: `var(--v2-divider-color, #C5A880)`, opacity: 0.35 }} />

              {/* Title */}
              <h4 
                className={`text-xl md:text-2xl font-normal tracking-wide mb-3 ${theme.headingFont}`}
                style={{ fontFamily: 'var(--v2-font-heading, inherit)', color: 'var(--v2-color-text-primary, #1F1A16)' }}
              >
                <EditableText value={item.title} fieldPath={`itinerary.${originalIndex}.title`} isEditable={editablePreview} />
              </h4>

              {/* Location */}
              <p className={`text-sm md:text-base leading-relaxed opacity-75 ${theme.bodyFont}`} style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}>
                <EditableText value={item.location} fieldPath={`itinerary.${originalIndex}.location`} isEditable={editablePreview} />
              </p>

              {(item.description || editablePreview) && (
                <p className={`mt-2 text-xs md:text-sm leading-relaxed opacity-70 ${theme.bodyFont}`} style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}>
                  <EditableText
                    value={item.description ?? ''}
                    fieldPath={`itinerary.${originalIndex}.description`}
                    isEditable={editablePreview}
                    placeholder="Descripción…"
                  />
                </p>
              )}

              {/* Trailing ornament */}
              <div className="mt-4 text-[9px]" style={{ color: 'var(--v2-color-accent, rgba(200, 167, 93, 0.40))', opacity: 0.6 }}>
                ✦
              </div>

              {/* Bottom subtle glow reflection */}
              <div className="absolute bottom-0 left-6 right-6 pointer-events-none"
                style={{ height: '1px', background: `linear-gradient(to right, transparent, var(--v2-color-accent, #C5A880), transparent)`, opacity: 0.2 }} />
            </ElegantInvitationCard>
          );
        })}
      </div>
    </SectionShell>
  );
}
