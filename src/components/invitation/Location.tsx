'use client';

import React from 'react';
import { Theme } from '@/domain/themes/types';
import { MapPin, Navigation } from 'lucide-react';
import SectionHeader from './SectionHeader';
import SectionShell from './SectionShell';
import { EditableText } from '@/components/visual-editor/EditableText';

interface LocationProps {
  location: {
    venueName: string;
    address: string;
    googleMapsLink: string;
    wazeLink: string;
    sectionEyebrow?: string;
    sectionTitle?: string;
  };
  theme: Theme;
  editablePreview?: boolean;
}

// Cycle: 0-39% draw, 39-82% hold+circle travels, 82-93% erase, 93-100% pause
// Total = 14s. Path length ≈ 620 units (overestimate is safe).
const PATH_LEN = 650;
const ROUTE_D = `M 35 218 C 100 180, 120 280, 180 230 C 225 190, 130 90, 180 80 C 220 70, 280 120, 310 70 C 322 50, 330 35, 340 45`;

const svgStyles = `
  @keyframes route-draw {
    0%          { stroke-dashoffset: ${PATH_LEN}; }
    39%         { stroke-dashoffset: 0; }
    82%         { stroke-dashoffset: 0; }
    93%         { stroke-dashoffset: ${PATH_LEN}; }
    100%        { stroke-dashoffset: ${PATH_LEN}; }
  }
  @keyframes dot-fade {
    0%   { opacity: 0; }
    38%  { opacity: 0; }
    42%  { opacity: 1; }
    80%  { opacity: 1; }
    86%  { opacity: 0; }
    100% { opacity: 0; }
  }
  .route-clip-path {
    stroke-dasharray: ${PATH_LEN};
    stroke-dashoffset: ${PATH_LEN};
    animation: route-draw 14s ease-in-out infinite;
  }
  .traveler-dot {
    opacity: 0;
    animation: dot-fade 14s ease-in-out infinite;
  }
`;

function isValidNavUrl(url: string | null | undefined): boolean {
  if (!url) return false;
  const t = url.trim();
  if (!t || t === '#' || t === '/' || t === 'undefined' || t === 'null') return false;
  return /^https?:\/\//i.test(t);
}

export default function Location({ location, theme, editablePreview = false }: LocationProps) {
  if (!location) return null;

  const hasGoogleMaps = isValidNavUrl(location.googleMapsLink);
  const hasWaze       = isValidNavUrl(location.wazeLink);

  // V2 CSS var with v1 fallback — resolves to correct accent for each theme
  const accentVar = `var(--v2-color-accent, ${theme.colors.accent})`;
  const borderVar = `var(--v2-color-border, ${theme.colors.border})`;
  const surfaceVar = `var(--v2-color-surface, ${theme.colors.surface})`;
  const surfaceAltVar = `var(--v2-color-surface-alt, ${theme.colors.surfaceAlt || '#FAF6EE'})`;
  const textSecondaryVar = `var(--v2-color-text-secondary, ${theme.colors.textSecondary})`;
  const textPrimaryVar = `var(--v2-color-text-primary, ${theme.colors.textPrimary})`;

  return (
    <SectionShell className="select-none" contentClassName="max-w-4xl mx-auto">
      {/* Header */}
      <SectionHeader
        eyebrow={location.sectionEyebrow ?? 'Ubicación'}
        title={location.sectionTitle ?? '¿Dónde y Cuándo?'}
        theme={theme}
        editablePreview={editablePreview}
        eyebrowFieldPath="location.sectionEyebrow"
        titleFieldPath="location.sectionTitle"
      />
      
      {/* Location Info & Map Panel */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center mt-12">
        {/* Info Details */}
        <div className="md:col-span-5 flex flex-col justify-center text-center md:text-left">
          <h4 
            className={`text-3xl md:text-4xl font-normal tracking-wide mb-4 ${theme.headingFont}`}
            style={{ fontFamily: 'var(--v2-font-heading, inherit)', color: 'var(--v2-color-text-primary, #1F1A16)' }}
          >
            <EditableText value={location.venueName} fieldPath="location.venueName" isEditable={editablePreview} />
          </h4>
          <p 
            className={`text-base md:text-lg leading-relaxed opacity-85 mb-8 max-w-sm mx-auto md:mx-0 ${theme.bodyFont}`}
            style={{ color: 'var(--v2-color-text-secondary, #5C4A3E)' }}
          >
            <EditableText value={location.address} fieldPath="location.address" isEditable={editablePreview} />
          </p>

          {(hasGoogleMaps || hasWaze) && (
            <div className="flex flex-col gap-3.5 w-full max-w-xs mx-auto md:mx-0">
              {hasGoogleMaps && (
                <a
                  href={location.googleMapsLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-3 w-full py-3.5 px-6 border transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5 group ${theme.bodyFont}`}
                  style={{ 
                    borderRadius: '30px', 
                    borderColor: 'var(--v2-color-border, rgba(200, 167, 93, 0.35))', 
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,250,238,0.6) 100%)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <MapPin className="w-4 h-4 transition-colors duration-300 flex-shrink-0 text-amber-800/60 group-hover:text-amber-800" style={{ color: 'var(--v2-color-accent, currentColor)' }} />
                  <span className="text-[12px] md:text-[13px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300" style={{ color: 'var(--v2-color-text-primary, #1F1A16)' }}>
                    Abrir Google Maps
                  </span>
                </a>
              )}
              {hasWaze && (
                <a
                  href={location.wazeLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`flex items-center justify-center gap-3 w-full py-3.5 px-6 border transition-all duration-300 shadow-sm hover:shadow hover:-translate-y-0.5 group ${theme.bodyFont}`}
                  style={{ 
                    borderRadius: '30px', 
                    borderColor: 'var(--v2-color-border, rgba(200, 167, 93, 0.35))', 
                    background: 'linear-gradient(180deg, rgba(255,255,255,0.85) 0%, rgba(255,250,238,0.6) 100%)',
                    backdropFilter: 'blur(8px)',
                  }}
                >
                  <Navigation className="w-4 h-4 transition-colors duration-300 flex-shrink-0 text-amber-800/60 group-hover:text-amber-800" style={{ color: 'var(--v2-color-accent, currentColor)' }} />
                  <span className="text-[12px] md:text-[13px] uppercase tracking-[0.25em] font-semibold transition-colors duration-300" style={{ color: 'var(--v2-color-text-primary, #1F1A16)' }}>
                    Abrir Waze GPS
                  </span>
                </a>
              )}
            </div>
          )}
        </div>

        {/* Animated SVG Map */}
        <div className="md:col-span-7">
          <div 
            className="relative aspect-video md:aspect-[4/3] p-3 overflow-hidden group" 
            style={{ 
              background: 'var(--v2-card-ivory-bg, #FFFDF8)', 
              border: '1px solid var(--v2-card-border, rgba(200, 167, 93, 0.35))',
              borderRadius: 'var(--v2-card-radius, 24px)',
              boxShadow: 'var(--v2-shadow-card, 0 8px 36px rgba(120, 88, 40, 0.11))',
            }}
          >
            {/* Inner frame/border */}
            <div 
              className="absolute inset-2 border pointer-events-none z-20 rounded-[calc(var(--v2-card-radius,24px)-6px)]" 
              style={{ borderColor: 'var(--v2-color-border, rgba(200, 167, 93, 0.20))', opacity: 0.6 }} 
            />

            <div
              className="w-full h-full relative z-10 rounded-[calc(var(--v2-card-radius,24px)-8px)] overflow-hidden"
              style={{
                backgroundImage: "url('/images/invitaciones/mapa.png')",
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            >
              <svg
                className="w-full h-full select-none relative"
                style={{ background: 'transparent' }}
                viewBox="0 0 400 300"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <style>{svgStyles}</style>

                  {/* Clip path uses a solid stroke animated via CSS dashoffset */}
                  <clipPath id="route-clip">
                    <path
                      d={ROUTE_D}
                      stroke="white"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="route-clip-path"
                    />
                  </clipPath>
                </defs>

                {/* Background roads */}
                <path d="M-20 160 C 60 155, 120 165, 180 150 C 240 135, 290 170, 430 158"
                  stroke="var(--v2-color-border, rgba(200, 167, 93, 0.22))" strokeWidth="6" strokeLinecap="round" />
                <path d="M-20 160 C 60 155, 120 165, 180 150 C 240 135, 290 170, 430 158"
                  stroke="#FFFDF8" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
                
                <path d="M200 -20 C 210 50, 190 100, 200 160 C 212 215, 195 255, 205 330"
                  stroke="var(--v2-color-border, rgba(200, 167, 93, 0.22))" strokeWidth="5" strokeLinecap="round" />
                <path d="M200 -20 C 210 50, 190 100, 200 160 C 212 215, 195 255, 205 330"
                  stroke="#FFFDF8" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                
                <path d="M380 280 C 340 240, 300 220, 270 190 C 235 155, 220 120, 200 160"
                  stroke="var(--v2-color-border, rgba(200, 167, 93, 0.18))" strokeWidth="4" strokeLinecap="round" />
                <path d="M40 -10 C 55 60, 70 110, 60 200 C 52 260, 80 290, 70 330"
                  stroke="var(--v2-color-border, rgba(200, 167, 93, 0.15))" strokeWidth="2" strokeLinecap="round" strokeDasharray="5 5" opacity="0.5" />
                <path d="M-10 240 C 80 220, 140 235, 200 220 C 265 205, 310 240, 430 225"
                  stroke="var(--v2-color-border, rgba(200, 167, 93, 0.12))" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="4 4" opacity="0.4" />

                {/* Compass */}
                <g transform="translate(58, 58)">
                  <circle cx="0" cy="0" r="26" stroke={accentVar} strokeWidth="0.5" strokeDasharray="2 3" opacity="0.35" />
                  <circle cx="0" cy="0" r="18" stroke={accentVar} strokeWidth="0.3" opacity="0.2" />
                  <path d="M0 -28 L 0 28 M -28 0 L 28 0 M -16 -16 L 16 16 M -16 16 L 16 -16"
                    stroke={accentVar} strokeWidth="0.4" opacity="0.25" />
                  <path d="M0 -18 L 4 -4 L 18 0 L 4 4 L 0 18 L -4 4 L -18 0 L -4 -4 Z"
                    fill={accentVar} fillOpacity="0.9" stroke={textSecondaryVar} strokeWidth="0.8" />
                  <circle cx="0" cy="0" r="3" fill="#FFFDF8" />
                </g>

                {/* Route glow — clipped */}
                <path
                  d={ROUTE_D}
                  stroke={accentVar}
                  strokeWidth="8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity={0.30}
                  clipPath="url(#route-clip)"
                />

                {/* Dashed route — revealed by clip */}
                <path
                  d={ROUTE_D}
                  stroke={accentVar}
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="6 6"
                  clipPath="url(#route-clip)"
                />

                {/* Traveler dot — appears after line is drawn, travels the full route */}
                <circle r="4.5" fill={accentVar} stroke={surfaceAltVar} strokeWidth="2" className="traveler-dot">
                  <animateMotion
                    dur="14s"
                    repeatCount="indefinite"
                    calcMode="linear"
                    keyTimes="0;0.39;0.82;1"
                    keyPoints="0;0;1;1"
                    path={ROUTE_D}
                  />
                </circle>

                {/* INICIO marker */}
                <g transform="translate(35, 218)">
                  <circle cx="0" cy="0" r="6" fill="#8D7D64" stroke="#FFFDF8" strokeWidth="1.5" />
                  <circle cx="0" cy="0" r="3" fill="#FFFDF8" />
                  <text x="14" y="3" fill="#8D7D64" fontSize="8" fontWeight="bold"
                    fontFamily="sans-serif" letterSpacing="0.12em">INICIO</text>
                </g>

                {/* CENTRO checkpoint */}
                <g transform="translate(165, 140)">
                  <circle cx="0" cy="0" r="3.5" fill={accentVar} fillOpacity="0.6" stroke={surfaceAltVar} strokeWidth="1" />
                  <text x="9" y="3" fill={textSecondaryVar} fontSize="7" fontFamily="sans-serif"
                    letterSpacing="0.08em" opacity="0.8">CENTRO</text>
                </g>

                {/* Distance label */}
                <text x="200" y="175" fill={textSecondaryVar} fontSize="7" fontFamily="sans-serif"
                  letterSpacing="0.1em" opacity="0.6">~ 2.4 km</text>

                {/* HACIENDA destination */}
                <g transform="translate(340, 45)">
                  <circle cx="0" cy="0" r="14" fill={accentVar} fillOpacity="0.15">
                    <animate attributeName="r" values="8;20;8" dur="2.2s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.7;0;0.7" dur="2.2s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="0" r="10" fill={accentVar} fillOpacity="0.1">
                    <animate attributeName="r" values="5;14;5" dur="2.2s" begin="0.4s" repeatCount="indefinite" />
                    <animate attributeName="opacity" values="0.5;0;0.5" dur="2.2s" begin="0.4s" repeatCount="indefinite" />
                  </circle>
                  <circle cx="0" cy="0" r="9" fill={accentVar} stroke={surfaceAltVar} strokeWidth="2" />
                  <path d="M-3.5 -2.5 L0 -6 L3.5 -2.5 L3.5 2.5 L-3.5 2.5 Z" fill="white" />
                  <rect x="-0.75" y="-2.5" width="1.5" height="5" fill={accentVar} />
                  <rect x="-2.5" y="-0.75" width="5" height="1.5" fill={accentVar} />
                  <text x="-16" y="3" textAnchor="end" fill="#8D7D64" fontSize="9" fontWeight="bold"
                    fontFamily="sans-serif" letterSpacing="0.15em">HACIENDA</text>
                </g>

              </svg>
            </div>

            {/* Overlay label */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent flex items-end p-8 z-10 pointer-events-none">
              <span className="text-white text-[10px] uppercase tracking-[0.25em] font-medium flex items-center gap-2" style={{ textShadow: '0 1px 4px rgba(0,0,0,0.2)' }}>
                <MapPin className="w-4 h-4 animate-bounce" />
                Ruta al Evento
              </span>
            </div>
          </div>
        </div>

      </div>
    </SectionShell>
  );
}
