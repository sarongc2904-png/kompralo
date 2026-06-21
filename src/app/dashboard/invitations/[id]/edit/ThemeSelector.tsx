'use client';

import React, { useState } from 'react';
import { getFeaturedWeddingThemes, getThemeCatalogEntry } from '@/domain/themes-v2/themesCatalog';
import type { ThemeIdV2 } from '@/domain/themes-v2/types';

interface ThemeSelectorProps {
  currentThemeId?: string | null;
  onSelectTheme: (themeId: ThemeIdV2) => Promise<void>;
  isLoading?: boolean;
}

export default function ThemeSelector({
  currentThemeId,
  onSelectTheme,
  isLoading = false,
}: ThemeSelectorProps) {
  const [selectedId, setSelectedId] = useState<ThemeIdV2 | null>((currentThemeId as ThemeIdV2) || null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const themes = getFeaturedWeddingThemes();

  async function handleSelectTheme(themeId: ThemeIdV2) {
    setSelectedId(themeId);
    setIsSubmitting(true);
    try {
      await onSelectTheme(themeId);
    } catch (err) {
      console.error('Error selecting theme:', err);
      setSelectedId(currentThemeId as ThemeIdV2 | null);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ marginBottom: '2rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h3
          style={{
            fontSize: '0.875rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            marginBottom: '0.5rem',
            color: '#6B5B4E',
          }}
        >
          Diseño y Tema
        </h3>
        <p style={{ fontSize: '0.8125rem', color: '#9B8B7B', margin: 0 }}>
          Elige un tema visual para tu invitación. Puedes cambiar cuando quieras.
        </p>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.5rem',
        }}
      >
        {themes.map((theme) => {
          const catalogEntry = getThemeCatalogEntry(theme.id);
          if (!catalogEntry) return null;

          const isSelected = selectedId === theme.id;
          const isDisabled = isSubmitting || isLoading;

          return (
            <button
              key={theme.id}
              onClick={() => !isDisabled && handleSelectTheme(theme.id)}
              disabled={isDisabled}
              style={{
                padding: '1rem',
                border: isSelected ? '2px solid #C5A880' : '1px solid #E8E2DA',
                borderRadius: '12px',
                background: '#FFF',
                cursor: isDisabled ? 'not-allowed' : 'pointer',
                transition: 'all 200ms ease',
                opacity: isDisabled ? 0.6 : 1,
                textAlign: 'left',
              }}
              onMouseEnter={(e) => {
                if (!isDisabled && !isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#C5A880';
                  (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 12px rgba(197,168,128,0.15)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isDisabled && !isSelected) {
                  (e.currentTarget as HTMLElement).style.borderColor = '#E8E2DA';
                  (e.currentTarget as HTMLElement).style.boxShadow = 'none';
                }
              }}
            >
              {/* Color preview bar */}
              <div
                style={{
                  width: '100%',
                  height: '80px',
                  borderRadius: '8px',
                  background: catalogEntry.previewColor,
                  border: `2px solid ${catalogEntry.accentColor}`,
                  marginBottom: '0.75rem',
                }}
              />

              {/* Theme info */}
              <div>
                <h4
                  style={{
                    margin: '0 0 0.25rem',
                    fontSize: '0.875rem',
                    fontWeight: 700,
                    color: '#1A1410',
                  }}
                >
                  {catalogEntry.label}
                </h4>
                <p
                  style={{
                    margin: '0',
                    fontSize: '0.75rem',
                    color: '#8B7B6B',
                    lineHeight: 1.4,
                  }}
                >
                  {catalogEntry.description}
                </p>
              </div>

              {/* Selection indicator */}
              {isSelected && (
                <div
                  style={{
                    marginTop: '0.75rem',
                    padding: '0.375rem 0.75rem',
                    background: 'rgba(197,168,128,0.10)',
                    borderRadius: '4px',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    color: '#C5A880',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                  }}
                >
                  ✓ Seleccionado
                </div>
              )}
            </button>
          );
        })}
      </div>

      {isSubmitting && (
        <div
          style={{
            marginTop: '1rem',
            padding: '0.75rem 1rem',
            background: '#FFF8F0',
            border: '1px solid #E8D4A0',
            borderRadius: '8px',
            fontSize: '0.8125rem',
            color: '#6B5A48',
          }}
        >
          Guardando tema...
        </div>
      )}
    </div>
  );
}
