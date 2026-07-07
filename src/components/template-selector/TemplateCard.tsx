'use client';

import React from 'react';
import Image from 'next/image';
import type { ThemeCatalogEntry } from '@/domain/themes-v2/themesCatalog';
import { themeRegistryV2 } from '@/domain/themes-v2/registry';

interface TemplateCardProps {
  entry: ThemeCatalogEntry;
  isCurrent?: boolean;
  isSelected?: boolean;
  onClick: () => void;
}

export function TemplateCard({ entry, isCurrent = false, isSelected = false, onClick }: TemplateCardProps) {
  const showBadge = isCurrent || entry.isNewTheme;

  // Fondo real del tema (assets.texture del registry) con fallback al catálogo
  // legacy; si el tema no usa imagen, la tarjeta muestra un gradiente de paleta.
  const previewImage = themeRegistryV2[entry.id]?.previewImage ?? entry.previewImageUrl;
  const paletteGradient = `linear-gradient(135deg, ${entry.previewColor} 0%, ${entry.previewColor} 45%, ${entry.accentColor}55 100%)`;

  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        width: '100%',
        background: '#fff',
        border: isSelected
          ? '2px solid #C8A75D'
          : isCurrent
          ? '2px solid rgba(200,167,93,0.4)'
          : '2px solid transparent',
        borderRadius: 12,
        padding: 0,
        cursor: 'pointer',
        textAlign: 'left',
        boxShadow: isSelected
          ? '0 0 0 3px rgba(200,167,93,0.25)'
          : '0 2px 8px rgba(0,0,0,0.07)',
        transition: 'box-shadow 150ms, border-color 150ms',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        height: 320,
      }}
    >
      {/* Preview header — imagen real del tema o gradiente de paleta */}
      <div
        style={{
          backgroundColor: entry.previewColor,
          backgroundImage: previewImage ? undefined : paletteGradient,
          flex: '0 0 180px',
          position: 'relative',
          overflow: 'hidden',
          display: 'flex',
          alignItems: 'flex-end',
          justifyContent: 'flex-end',
          padding: 10,
        }}
      >
        {previewImage && (
          <>
            <Image
              src={previewImage}
              alt={`Vista previa de ${entry.label}`}
              fill
              sizes="(max-width: 600px) 86vw, (max-width: 900px) 44vw, 400px"
              style={{ objectFit: 'cover' }}
            />
            {/* Scrim suave para que swatches y badges sigan legibles */}
            <div
              aria-hidden
              style={{
                position: 'absolute',
                inset: 0,
                pointerEvents: 'none',
                background:
                  'linear-gradient(180deg, rgba(26,20,16,0.10) 0%, transparent 32%, transparent 58%, rgba(26,20,16,0.22) 100%)',
              }}
            />
          </>
        )}

        {/* Accent swatch row */}
        <div style={{ position: 'absolute', bottom: 12, left: 12, display: 'flex', gap: 6, zIndex: 1 }}>
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: entry.previewColor,
            border: '2px solid rgba(0,0,0,0.1)',
            display: 'inline-block',
          }} />
          <span style={{
            width: 18, height: 18, borderRadius: '50%',
            background: entry.accentColor,
            border: '2px solid rgba(0,0,0,0.1)',
            display: 'inline-block',
          }} />
        </div>

        {/* Badges */}
        <div style={{ position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-end' }}>
          {isCurrent && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              padding: '3px 7px', borderRadius: 6,
              background: '#C8A75D', color: '#fff',
            }}>
              ACTUAL
            </span>
          )}
          {!isCurrent && entry.isNewTheme && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              padding: '3px 7px', borderRadius: 6,
              background: 'rgba(200,167,93,0.15)',
              color: '#8B6914',
              border: '1px solid rgba(200,167,93,0.3)',
            }}>
              NUEVO
            </span>
          )}
          {isSelected && !isCurrent && (
            <span style={{
              fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
              padding: '3px 7px', borderRadius: 6,
              background: '#C8A75D', color: '#fff',
            }}>
              ✓
            </span>
          )}
        </div>
      </div>

      {/* Info area */}
      <div style={{ padding: '12px 14px', flex: 1, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1410', lineHeight: 1.3 }}>
          {entry.label}
        </span>
        <span style={{ fontSize: 11, color: '#7A6858', lineHeight: 1.5, flex: 1 }}>
          {entry.description}
        </span>
        <span style={{
          fontSize: 10, color: '#A08060', textTransform: 'capitalize', letterSpacing: '0.04em',
        }}>
          {entry.category}
        </span>
      </div>
    </button>
  );
}
