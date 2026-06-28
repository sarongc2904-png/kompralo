'use client';

import React from 'react';
import type { ThemeCatalogEntry } from '@/domain/themes-v2/themesCatalog';
import { TemplateCard } from './TemplateCard';

type FilterMode = 'featured' | 'all';

interface TemplateGridProps {
  entries: ThemeCatalogEntry[];
  featuredEntries: ThemeCatalogEntry[];
  currentThemeId?: string;
  selectedThemeId?: string;
  filter: FilterMode;
  onSelect: (themeId: string) => void;
}

export function TemplateGrid({
  entries,
  featuredEntries,
  currentThemeId,
  selectedThemeId,
  filter,
  onSelect,
}: TemplateGridProps) {
  const visible = filter === 'featured' ? featuredEntries : entries;

  if (visible.length === 0) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#9B8878', fontSize: 13 }}>
        No hay plantillas disponibles.
      </div>
    );
  }

  return (
    <>
      <style>{`
        .template-grid-inner {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
          padding: 20px 24px;
        }
        @media (max-width: 900px) {
          .template-grid-inner { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .template-grid-inner { grid-template-columns: 1fr; }
        }
      `}</style>
      <div className="template-grid-inner">
      {visible.map((entry) => (
        <TemplateCard
          key={entry.id}
          entry={entry}
          isCurrent={entry.id === currentThemeId}
          isSelected={entry.id === selectedThemeId}
          onClick={() => onSelect(entry.id)}
        />
      ))}
      </div>
    </>
  );
}
