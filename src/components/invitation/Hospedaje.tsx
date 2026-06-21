'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { Hotel } from '@/domain/invitations/types';
import { motion } from 'framer-motion';
import { MapPin, Phone, Star } from 'lucide-react';
import SectionShell from './SectionShell';
import ElegantInvitationCard from './ElegantInvitationCard';

interface HospedajeProps {
  hotels: Hotel[];
  theme: Theme;
}

function StarRating({ count }: { count: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className="w-3 h-3"
          style={{
            color: i < count ? `var(--v2-color-accent, #C5A880)` : `var(--v2-color-border, rgba(197,168,128,0.2))`,
            fill: i < count ? `var(--v2-color-accent, #C5A880)` : 'none',
          }}
        />
      ))}
    </div>
  );
}

function PriceTag({ range }: { range: string }) {
  return (
    <span className="text-[10px] font-semibold tracking-widest" style={{ color: `var(--v2-color-accent, #C5A880)` }}>
      {range}
    </span>
  );
}

export default function Hospedaje({ hotels, theme }: HospedajeProps) {
  if (!hotels || hotels.length === 0) return null;

  return (
    <SectionShell className="select-none" contentClassName="max-w-3xl mx-auto">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-14"
        >
          <p className={`text-xs uppercase tracking-[0.28em] mb-3 ${theme.accentText} ${theme.bodyFont}`}>
            Para nuestros invitados foráneos
          </p>
          <h3 className={`text-3xl md:text-4xl font-light tracking-wide ${theme.headingFont} ${theme.bodyText}`}>
            Hospedaje
          </h3>
          <div className="flex items-center justify-center gap-3 mt-6 mb-5">
            <div className="h-px w-10" style={{ background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }} />
            <MapPin className="w-3.5 h-3.5" style={{ color: `var(--v2-color-accent, #C5A880)` }} />
            <div className="h-px w-10" style={{ background: `var(--v2-divider-color, ${theme.colors.accent})`, opacity: 0.6 }} />
          </div>
          <p className={`text-xs opacity-65 max-w-sm mx-auto leading-relaxed ${theme.bodyFont} ${theme.bodyText}`}>
            Te recomendamos reservar con anticipación. Estos hoteles están cerca del venue y cuentan con excelentes reseñas.
          </p>
        </motion.div>

        {/* Hotel cards */}
        <div className="flex flex-col gap-4">
          {hotels.map((hotel, i) => (
            <ElegantInvitationCard
              key={hotel.id}
              animateFrom={i % 2 === 0 ? 'left' : 'right'}
              animateDelay={i * 0.1}
            >
              {/* Gold left accent bar */}
              <div style={{
                position: 'absolute', left: 0, top: 0, bottom: 0, width: 3,
                background: `linear-gradient(180deg, var(--v2-color-accent, #E8D5A8), var(--v2-color-accent, #C5A880), var(--v2-color-accent-hover, #A8865A))`,
              }}/>

              <div className="flex items-center justify-between gap-4 px-6 py-5 pl-8 relative z-10">
                <div className="flex-1 min-w-0">
                  {/* Name + stars */}
                  <div className="flex items-start gap-3 mb-1 flex-wrap">
                    <h4 className="text-base font-semibold tracking-wide" style={{ color: `var(--v2-color-text-primary, #3D2B1A)` }}>
                      {hotel.name}
                    </h4>
                    <PriceTag range={hotel.priceRange} />
                  </div>
                  <div className="mb-3">
                    <StarRating count={hotel.stars} />
                  </div>

                  {/* Details */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3 h-3 flex-shrink-0" style={{ color: `var(--v2-color-accent, #C5A880)` }} />
                      <span className="text-[13px] opacity-80 truncate" style={{ color: `var(--v2-color-text-secondary, #5A4030)` }}>{hotel.address}</span>
                    </div>
                    {hotel.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3 h-3 flex-shrink-0" style={{ color: `var(--v2-color-accent, #C5A880)` }} />
                        <span className="text-[13px] opacity-80" style={{ color: `var(--v2-color-text-secondary, #5A4030)` }}>{hotel.phone}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-0.5">
                      <div className="w-3 h-3 flex-shrink-0 flex items-center justify-center">
                        <div className="w-1.5 h-1.5 rounded-full" style={{ background: '#C5A880' }} />
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: `var(--v2-color-accent, #C5A880)` }}>
                        {hotel.distance}
                      </span>
                    </div>
                  </div>
                </div>

                {/* CTA button */}
                {hotel.bookingLink && (
                  <a
                    href={hotel.bookingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-shrink-0 flex flex-col items-center justify-center gap-1 px-4 py-3 transition-all duration-300 hover:opacity-80"
                    style={{
                      background: `var(--v2-btn-bg, #C5A880)`,
                      borderRadius: `var(--v2-radius-md, 10px)`,
                      minWidth: 72,
                      boxShadow: `var(--v2-shadow-card, 0 2px 10px rgba(197,168,128,0.30))`,
                      textDecoration: 'none',
                    }}
                  >
                    <span className="text-[11px] uppercase tracking-[0.18em] font-semibold leading-tight text-center" style={{ color: `var(--v2-btn-text, #FFFFFF)` }}>
                      Reservar
                    </span>
                  </a>
                )}
              </div>
            </ElegantInvitationCard>
          ))}
        </div>

        {/* Note */}
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1, delay: 0.4 }}
          className={`text-center text-[10px] uppercase tracking-[0.2em] mt-10 opacity-50 ${theme.bodyFont} ${theme.bodyText}`}
        >
          Menciona que asistes a la boda de Sofía & Alejandro al reservar
        </motion.p>

    </SectionShell>
  );
}
