'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { weddingThemesCatalog, getFeaturedWeddingThemes } from '@/domain/themes-v2/themesCatalog';
import { TemplateGrid } from './TemplateGrid';

type FilterTab = 'featured' | 'all';

interface TemplateSelectorModalProps {
  currentThemeId?: string;
  onApply: (themeId: string) => void;
  onClose: () => void;
}

function TemplateSelectorModalContent({
  currentThemeId,
  onApply,
  onClose,
}: TemplateSelectorModalProps) {
  const [tab, setTab]                   = useState<FilterTab>('featured');
  const [selectedThemeId, setSelected]  = useState<string | undefined>(currentThemeId);
  const [applying, setApplying]         = useState(false);

  const allEntries      = weddingThemesCatalog;
  const featuredEntries = getFeaturedWeddingThemes();

  // Lock body scroll while open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, []);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  async function handleApply() {
    if (!selectedThemeId || selectedThemeId === currentThemeId) { onClose(); return; }
    setApplying(true);
    try {
      await onApply(selectedThemeId);
    } finally {
      setApplying(false);
    }
  }

  const tabBase: React.CSSProperties = {
    padding: '6px 16px', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: 'none', transition: 'background 150ms, color 150ms',
  };

  const canApply = selectedThemeId && selectedThemeId !== currentThemeId;

  return (
    <>
      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 2000,
          background: 'rgba(26,20,16,0.6)',
          backdropFilter: 'blur(4px)',
        }}
      />

      {/* Modal */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Seleccionar plantilla"
        style={{
          position: 'fixed',
          top: '50%', left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 2001,
          width: 'min(1100px, 95vw)',
          maxHeight: '90dvh',
          background: '#FAF7F2',
          borderRadius: 16,
          boxShadow: '0 24px 80px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Fixed header */}
        <div style={{
          flexShrink: 0,
          padding: '20px 24px 16px',
          borderBottom: '1px solid rgba(200,167,93,0.2)',
          display: 'flex', alignItems: 'center', gap: 16,
          background: '#FAF7F2',
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#1A1410' }}>
              Cambiar plantilla
            </h2>
            <p style={{ margin: '4px 0 0', fontSize: 12, color: '#9B8878' }}>
              Elige un diseño — tu contenido se mantiene intacto.
            </p>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 6 }}>
            <button
              type="button"
              onClick={() => setTab('featured')}
              style={{
                ...tabBase,
                background: tab === 'featured' ? 'rgba(200,167,93,0.15)' : 'transparent',
                color: tab === 'featured' ? '#8B6914' : '#9B8878',
                border: tab === 'featured' ? '1px solid rgba(200,167,93,0.4)' : '1px solid transparent',
              }}
            >
              Destacadas
            </button>
            <button
              type="button"
              onClick={() => setTab('all')}
              style={{
                ...tabBase,
                background: tab === 'all' ? 'rgba(200,167,93,0.15)' : 'transparent',
                color: tab === 'all' ? '#8B6914' : '#9B8878',
                border: tab === 'all' ? '1px solid rgba(200,167,93,0.4)' : '1px solid transparent',
              }}
            >
              Todas ({allEntries.length})
            </button>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              width: 32, height: 32, borderRadius: '50%',
              border: '1px solid rgba(200,167,93,0.3)',
              background: 'rgba(200,167,93,0.08)',
              color: '#9B8878', fontSize: 16, cursor: 'pointer',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* Scrollable grid */}
        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
          <TemplateGrid
            entries={allEntries}
            featuredEntries={featuredEntries}
            currentThemeId={currentThemeId}
            selectedThemeId={selectedThemeId}
            filter={tab}
            onSelect={setSelected}
          />
        </div>

        {/* Fixed footer */}
        <div style={{
          flexShrink: 0,
          padding: '14px 24px',
          borderTop: '1px solid rgba(200,167,93,0.2)',
          background: '#FAF7F2',
          display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10,
        }}>
          {selectedThemeId && selectedThemeId !== currentThemeId && (
            <span style={{ fontSize: 12, color: '#9B8878', flex: 1 }}>
              {allEntries.find((e) => e.id === selectedThemeId)?.label ?? selectedThemeId}
            </span>
          )}
          <button
            type="button"
            onClick={onClose}
            style={{
              ...tabBase,
              padding: '8px 18px',
              background: 'transparent',
              color: '#9B8878',
              border: '1px solid rgba(200,167,93,0.3)',
            }}
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleApply}
            disabled={!canApply || applying}
            style={{
              ...tabBase,
              padding: '8px 20px',
              background: canApply ? '#C8A75D' : 'rgba(200,167,93,0.2)',
              color: canApply ? '#fff' : '#A08060',
              border: 'none',
              cursor: canApply && !applying ? 'pointer' : 'default',
              opacity: applying ? 0.7 : 1,
            }}
          >
            {applying ? 'Aplicando…' : 'Aplicar plantilla'}
          </button>
        </div>
      </div>
    </>
  );
}

export function TemplateSelectorModal(props: TemplateSelectorModalProps) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;
  return createPortal(<TemplateSelectorModalContent {...props} />, document.body);
}
