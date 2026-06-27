'use client';

import { INVITATION_SECTIONS } from './editor-v4-events';

interface EditorV4LayersPanelProps {
  /** Scroll the canvas iframe to a section by id */
  onScrollTo?: (sectionId: string) => void;
  activeSection?: string | null;
  hiddenSections?: string[];
}

export function EditorV4LayersPanel({ onScrollTo, activeSection, hiddenSections = [] }: EditorV4LayersPanelProps) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflowY: 'auto' }}>
      {/* Header */}
      <div style={{
        padding: '14px 16px 10px',
        borderBottom: '1px solid rgba(200,167,93,0.15)',
        flexShrink: 0,
      }}>
        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#5C4A3E' }}>
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
                background: isActive ? 'rgba(200,167,93,0.12)' : 'transparent',
                border: 'none',
                borderLeft: isActive ? '2px solid #C5A880' : '2px solid transparent',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 120ms',
                opacity: isHidden ? 0.45 : 1,
              }}
              onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'rgba(200,167,93,0.06)'; }}
              onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ fontSize: 14, width: 20, textAlign: 'center', flexShrink: 0 }}>
                {section.icon}
              </span>
              <span style={{
                fontSize: 12,
                color: isActive ? '#C5A880' : '#5C4A3E',
                fontWeight: isActive ? 600 : 400,
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

      {/* Footer hint */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(200,167,93,0.1)', flexShrink: 0 }}>
        <p style={{ fontSize: 10, color: '#9B8878', lineHeight: 1.5 }}>
          Haz clic en una sección para navegar
        </p>
      </div>
    </div>
  );
}
