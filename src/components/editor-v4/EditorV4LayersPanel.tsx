'use client';

import { useState } from 'react';
import { INVITATION_SECTIONS } from './editor-v4-events';

interface EditorV4LayersPanelProps {
  /** Scroll the canvas iframe to a section by id */
  onScrollTo?: (sectionId: string) => void;
  activeSection?: string | null;
  hiddenSections?: string[];
}

export function EditorV4LayersPanel({ onScrollTo, activeSection, hiddenSections = [] }: EditorV4LayersPanelProps) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto', background: '#1a1208' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid rgba(200,167,93,0.15)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: 'rgba(255,255,255,0.9)' }}>
          Secciones
        </span>
      </div>

      {/* Section list */}
      <nav style={{ flex: 1, padding: '8px 0' }}>
        {INVITATION_SECTIONS.map((section) => {
          const isActive = activeSection === section.id;
          const isHidden = hiddenSections.includes(section.id);
          return (
            <button
              key={section.id}
              type="button"
              onClick={() => onScrollTo?.(section.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '7px 16px',
                background: isActive
                  ? 'rgba(201,169,110,0.12)'
                  : hoveredId === section.id ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '3px solid #C9A96E' : '3px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 120ms',
                opacity: isHidden ? 0.45 : 1,
              }}
              onMouseEnter={() => setHoveredId(section.id)}
              onMouseLeave={() => setHoveredId(null)}
            >
              <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>
                {section.icon}
              </span>
              <span style={{
                fontSize: 12,
                color: isActive
                  ? '#C9A96E'
                  : hoveredId === section.id ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.55)',
                fontWeight: isActive ? 500 : 400,
                flex: 1,
              }}>
                {section.label}
              </span>
              {isHidden && (
                <span style={{ fontSize: 10, color: '#9B8878' }} title="Sección oculta">🙈</span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Global tools */}
      <div style={{ padding: '8px 8px 4px', borderTop: '1px solid rgba(200,167,93,0.1)', flexShrink: 0, background: '#1a1208' }}>
        <p style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.35)', margin: '0 8px 6px' }}>
          Estilo global
        </p>
        <button
          type="button"
          onClick={() => onScrollTo?.('colors')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            width: '100%',
            padding: '7px 16px',
            background: activeSection === 'colors' ? 'rgba(201,169,110,0.12)' : 'transparent',
            border: 'none',
            borderLeft: activeSection === 'colors' ? '3px solid #C9A96E' : '3px solid transparent',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>🎨</span>
          <span style={{
            fontSize: 12,
            color: activeSection === 'colors' ? '#C9A96E' : 'rgba(255,255,255,0.55)',
            fontWeight: activeSection === 'colors' ? 500 : 400,
          }}>
            Color de textos
          </span>
        </button>
      </div>

      {/* Footer hint */}
      <div style={{ padding: '8px 16px 12px', background: '#1a1208' }}>
        <p style={{ fontSize: 10, color: 'rgba(255,255,255,0.4)', lineHeight: 1.5, margin: 0 }}>
          Haz clic en una sección para navegar
        </p>
      </div>
    </div>
  );
}
