'use client';

import React from 'react';

export type SaveStatus = 'idle' | 'saved';
export type EditorDevice = 'desktop' | 'tablet' | 'mobile';

const ZOOM_LEVELS = [0.5, 0.75, 1, 1.25, 1.5];

interface EditorV4ToolbarProps {
  invitationTitle: string;
  slug: string;
  invitationId: string;
  onRefresh: () => void;
  onHelp: () => void;
  classicEditorUrl: string;
  isMobile?: boolean;
  saveStatus?: SaveStatus;
  zoom?: number;
  device?: EditorDevice;
  onZoomChange?: (z: number) => void;
  onDeviceChange?: (d: EditorDevice) => void;
}

export function EditorV4Toolbar({
  invitationTitle,
  slug,
  invitationId,
  onRefresh,
  onHelp,
  classicEditorUrl,
  isMobile = false,
  saveStatus = 'idle',
  zoom = 1,
  device = 'desktop',
  onZoomChange,
  onDeviceChange,
}: EditorV4ToolbarProps) {
  const previewUrl = `/preview/${invitationId}`;
  const publicUrl  = typeof window !== 'undefined'
    ? `${window.location.origin}/i/${slug}`
    : `/i/${slug}`;

  async function handleShare() {
    if (typeof navigator === 'undefined') return;
    if (navigator.share) {
      try { await navigator.share({ title: invitationTitle, url: publicUrl }); } catch { /* cancelled */ }
    } else {
      try { await navigator.clipboard.writeText(publicUrl); } catch { /* no clipboard */ }
    }
  }

  // ── Desktop toolbar ───────────────────────────────────────────────────────
  if (!isMobile) {
    const btnBase: React.CSSProperties = {
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '5px 12px', borderRadius: 7,
      fontSize: 11, fontWeight: 600, cursor: 'pointer',
      border: 'none', whiteSpace: 'nowrap',
      textDecoration: 'none', transition: 'opacity 150ms',
    };

    return (
      <div style={{
        height: 48, display: 'flex', alignItems: 'center', gap: 10,
        padding: '0 16px',
        borderBottom: '1px solid rgba(200,167,93,0.2)',
        background: '#1A1410', flexShrink: 0, zIndex: 50,
      }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#C5A880', letterSpacing: '0.08em', marginRight: 4 }}>
          KOMPRALO
        </span>
        <span style={{ width: 1, height: 20, background: 'rgba(200,167,93,0.2)', flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#F5EDD8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {invitationTitle}
        </span>
        <span style={{ fontSize: 11, color: '#9B8878', fontFamily: 'monospace', flexShrink: 0 }}>
          /{slug}
        </span>

        {saveStatus === 'saved' && (
          <span style={{ fontSize: 11, color: '#C5A880', flexShrink: 0, letterSpacing: '0.02em' }}>
            ✓ Guardado
          </span>
        )}

        <span style={{ width: 1, height: 20, background: 'rgba(200,167,93,0.2)', flexShrink: 0 }} />

        {/* Device switch */}
        {([
          { key: 'desktop' as EditorDevice, icon: '🖥' },
          { key: 'tablet'  as EditorDevice, icon: '⬜' },
          { key: 'mobile'  as EditorDevice, icon: '📱' },
        ]).map(({ key, icon }) => (
          <button
            key={key}
            type="button"
            title={key.charAt(0).toUpperCase() + key.slice(1)}
            onClick={() => onDeviceChange?.(key)}
            style={{
              background: device === key ? 'rgba(201,169,110,0.2)' : 'transparent',
              color: device === key ? '#C9A96E' : 'rgba(255,255,255,0.4)',
              border: 'none', cursor: 'pointer', borderRadius: 6,
              width: 28, height: 28, fontSize: 14, flexShrink: 0,
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            }}
          >
            {icon}
          </button>
        ))}

        <span style={{ width: 1, height: 20, background: 'rgba(200,167,93,0.2)', flexShrink: 0 }} />

        {/* Zoom controls */}
        <button
          type="button"
          onClick={() => {
            const idx = ZOOM_LEVELS.indexOf(zoom);
            if (idx > 0) onZoomChange?.(ZOOM_LEVELS[idx - 1]);
          }}
          disabled={zoom <= 0.5}
          style={{
            background: 'transparent', border: 'none', color: '#C9A96E',
            fontSize: 16, cursor: zoom <= 0.5 ? 'default' : 'pointer',
            opacity: zoom <= 0.5 ? 0.35 : 1, flexShrink: 0,
            width: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >−</button>
        <span style={{ fontSize: 11, color: '#C9A96E', fontFamily: 'monospace', flexShrink: 0, minWidth: 34, textAlign: 'center' }}>
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => {
            const idx = ZOOM_LEVELS.indexOf(zoom);
            if (idx < ZOOM_LEVELS.length - 1) onZoomChange?.(ZOOM_LEVELS[idx + 1]);
          }}
          disabled={zoom >= 1.5}
          style={{
            background: 'transparent', border: 'none', color: '#C9A96E',
            fontSize: 16, cursor: zoom >= 1.5 ? 'default' : 'pointer',
            opacity: zoom >= 1.5 ? 0.35 : 1, flexShrink: 0,
            width: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          }}
        >＋</button>

        <span style={{ width: 1, height: 20, background: 'rgba(200,167,93,0.2)', flexShrink: 0 }} />

        <button type="button" onClick={onRefresh} style={{ ...btnBase, background: 'rgba(200,167,93,0.12)', color: '#C5A880' }} title="Refrescar preview">
          ↻ Refrescar
        </button>
        <a id="editor-v4-preview-btn" href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnBase, background: 'rgba(200,167,93,0.12)', color: '#C5A880' }}>
          ↗ Vista previa
        </a>
        <button id="editor-v4-share-btn" type="button" onClick={handleShare} style={{ ...btnBase, background: 'rgba(200,167,93,0.12)', color: '#C5A880' }}>
          Compartir
        </button>
        <a href={classicEditorUrl} style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: '#9B8878' }}>
          ← Editor clásico
        </a>
        <button
          id="editor-v4-help-btn"
          type="button"
          onClick={onHelp}
          title="Guía del editor"
          aria-label="Abrir guía del editor"
          style={{
            width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
            border: '1px solid rgba(200,167,93,0.4)',
            background: 'rgba(200,167,93,0.1)',
            color: '#C9A96E', fontSize: 14, fontWeight: 700,
            cursor: 'pointer', display: 'inline-flex',
            alignItems: 'center', justifyContent: 'center',
          }}
        >
          ?
        </button>
      </div>
    );
  }

  // ── Mobile toolbar ────────────────────────────────────────────────────────
  const mBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    padding: '6px 11px', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: 'none', textDecoration: 'none',
    background: 'rgba(200,167,93,0.12)', color: '#C5A880',
    whiteSpace: 'nowrap', flexShrink: 0,
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div style={{
      height: 48, display: 'flex', alignItems: 'center', gap: 6,
      padding: '0 10px',
      borderBottom: '1px solid rgba(200,167,93,0.2)',
      background: '#1A1410', flexShrink: 0, zIndex: 50,
    }}>
      {/* Back */}
      <a href={classicEditorUrl} style={{ ...mBtn, background: 'rgba(255,255,255,0.06)', color: '#9B8878' }}>
        Salir
      </a>

      {/* Save status — fills remaining space */}
      <span style={{
        flex: 1, fontSize: 11, textAlign: 'center', letterSpacing: '0.02em',
        color: saveStatus === 'saved' ? '#C5A880' : 'rgba(200,167,93,0.3)',
        transition: 'color 300ms',
      }}>
        {saveStatus === 'saved' ? '✓ Guardado' : '·'}
      </span>

      {/* Preview */}
      <a id="editor-v4-preview-btn" href={previewUrl} target="_blank" rel="noopener noreferrer" style={mBtn}>
        Preview
      </a>

      {/* Share */}
      <button id="editor-v4-share-btn" type="button" onClick={handleShare} style={mBtn}>
        Compartir
      </button>

      {/* Help */}
      <button
        id="editor-v4-help-btn"
        type="button"
        onClick={onHelp}
        aria-label="Abrir guía del editor"
        style={{ ...mBtn, width: 36, padding: '6px', fontWeight: 700, fontSize: 14 }}
      >
        ?
      </button>
    </div>
  );
}
