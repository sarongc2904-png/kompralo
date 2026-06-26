'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { Hotel } from '@/domain/invitations/types';
import { motion } from 'framer-motion';
import { MapPin, Phone, Star } from 'lucide-react';
import SectionShell from './SectionShell';
import SectionHeader from './SectionHeader';
import ElegantInvitationCard from './ElegantInvitationCard';
import { EditableText } from '@/components/visual-editor/EditableText';

interface HospedajeProps {
  hotels: Hotel[];
  theme: Theme;
  editablePreview?: boolean;
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-3 h-3"
          style={{
            color: i < count ? `var(--v2-color-accent, #C8A75D)` : `var(--v2-color-border, rgba(200, 167, 93, 0.15))`,
            fill: i < count ? `var(--v2-color-accent, #C8A75D)` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function PriceTag({ range, fieldPath, editablePreview }: { range: string; fieldPath: string; editablePreview: boolean }) {
  return (
    <span className="text-[10px] font-semibold tracking-widest" style={{ color: `var(--v2-color-accent, #C8A75D)` }}>
      <EditableText value={range} fieldPath={fieldPath} isEditable={editablePreview} />
    </span>
  );
}

export default function Hospedaje({ hotels, theme, editablePreview = false }: HospedajeProps) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <SectionShell className="select-none" contentClassName="max-w-3xl mx-auto">
      {/* Header */}
      <SectionHeader 
        eyebrow="Para nuestros invitados foráneos" 
        title="Hospedaje" 
        subtitle="Te recomendamos reservar con anticipación. Estos hoteles están cerca del venue y cuentan con excelentes reseñas."
        theme={theme}
        className="mb-14"
      />

      {/* Hotel cards */}
      <div className="flex flex-col gap-5">
        {hotels.map((hotel, i) => (
          <ElegantInvitationCard
            key={hotel.id}
            animateFrom={i % 2 === 0 ? 'left' : 'right'}
            animateDelay={i * 0.08}
            style={{
              backgroundPosition: 'left center',
              backgroundSize: '55% auto',
            }}
          >
            {/* Semi-transparent overlay so text is always legible */}
            <div aria-hidden="true" style={{
              position: 'absolute', inset: 0,
              background: 'linear-gradient(to right, rgba(255,252,245,0.45) 0%, rgba(255,252,245,0.82) 40%, rgba(255,252,245,0.96) 100%)',
              pointerEvents: 'none', zIndex: 1,
            }} />
            {/* Mobile: vertical stack. Desktop (sm+): horizontal row */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-6 py-6 relative z-20">
              <div className="flex-1 min-w-0">
                {/* Name + price tag */}
                <div className="flex items-start gap-3 mb-1 flex-wrap">
                  <h4
                    className="text-base font-normal tracking-wide break-words"
                    style={{ fontFamily: 'var(--v2-font-heading, inherit)', color: `var(--v2-color-text-primary, #1F1A16)` }}
                  >
                    <EditableText value={hotel.name} fieldPath={`hotels.${i}.name`} isEditable={editablePreview} />
                  </h4>
                  <PriceTag range={hotel.priceRange} fieldPath={`hotels.${i}.priceRange`} editablePreview={editablePreview} />
                </div>

                {/* Stars */}
                <div className="mb-3">
                  <StarRating count={hotel.stars} />
                </div>

                {/* Details */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-start gap-2">
                    <MapPin className="w-3 h-3 flex-shrink-0 mt-0.5" style={{ color: `var(--v2-color-accent, #C8A75D)` }} />
                    <span className="text-[13px] opacity-90 leading-relaxed break-words" style={{ color: `var(--v2-color-text-secondary, #5C4A3E)` }}>
                      <EditableText value={hotel.address} fieldPath={`hotels.${i}.address`} isEditable={editablePreview} />
                    </span>
                  </div>
                  {hotel.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3 h-3 flex-shrink-0" style={{ color: `var(--v2-color-accent, #C8A75D)` }} />
                      <span className="text-[13px] opacity-90" style={{ color: `var(--v2-color-text-secondary, #5C4A3E)` }}>{hotel.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="w-3 h-3 flex-shrink-0 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--v2-color-accent, #C8A75D)' }} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: `var(--v2-color-accent, #C8A75D)` }}>
                      <EditableText value={hotel.distance} fieldPath={`hotels.${i}.distance`} isEditable={editablePreview} />
                    </span>
                  </div>
                </div>
              </div>

              {/* CTA button — bottom-centered on mobile, right-aligned on desktop */}
              {hotel.bookingLink && (
                <div className="flex justify-center sm:justify-end sm:flex-shrink-0">
                  <a
                    href={hotel.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center justify-center gap-2 py-2.5 px-8 sm:px-5 border transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5 ${theme.bodyFont}`}
                    style={{
                      borderRadius: '30px',
                      borderColor: 'var(--v2-color-border, rgba(200, 167, 93, 0.35))',
                      background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,250,238,0.6) 100%)',
                      backdropFilter: 'blur(8px)',
                      textDecoration: 'none',
                    }}
                  >
                    <span className="text-[10px] uppercase tracking-[0.22em] font-semibold" style={{ color: 'var(--v2-color-text-primary, #1F1A16)' }}>
                      Reservar
                    </span>
                  </a>
                </div>
              )}
            </div>
          </ElegantInvitationCard>
        ))}
      </div>

      {/* Note */}
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 0.8 }}
        viewport={{ once: true }}
        transition={{ duration: 1, delay: 0.4 }}
        className={`text-center text-[10px] uppercase tracking-[0.25em] mt-10 ${theme.bodyFont}`}
        style={{ color: 'var(--v2-color-text-muted, #8A7665)' }}
      >
        Menciona el evento al realizar tu reservación
      </motion.p>
    </SectionShell>
  );
}
