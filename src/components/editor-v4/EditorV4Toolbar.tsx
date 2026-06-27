'use client';

export type SaveStatus = 'idle' | 'saved';

interface EditorV4ToolbarProps {
  invitationTitle: string;
  slug: string;
  invitationId: string;
  onRefresh: () => void;
  classicEditorUrl: string;
  isMobile?: boolean;
  saveStatus?: SaveStatus;
}

export function EditorV4Toolbar({
  invitationTitle,
  slug,
  invitationId,
  onRefresh,
  classicEditorUrl,
  isMobile = false,
  saveStatus = 'idle',
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

        <button type="button" onClick={onRefresh} style={{ ...btnBase, background: 'rgba(200,167,93,0.12)', color: '#C5A880' }} title="Refrescar preview">
          ↻ Refrescar
        </button>
        <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnBase, background: 'rgba(200,167,93,0.12)', color: '#C5A880' }}>
          ↗ Vista previa
        </a>
        <a href={classicEditorUrl} style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: '#9B8878' }}>
          ← Editor clásico
        </a>
      </div>
    );
  }

  // ── Mobile toolbar ────────────────────────────────────────────────────────
  const iconBtn: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    gap: 4, padding: '6px 10px', borderRadius: 8,
    fontSize: 12, fontWeight: 600, cursor: 'pointer',
    border: 'none', textDecoration: 'none',
    background: 'rgba(200,167,93,0.12)', color: '#C5A880',
    whiteSpace: 'nowrap', flexShrink: 0,
    WebkitTapHighlightColor: 'transparent',
  };

  return (
    <div style={{
      height: 48, display: 'flex', alignItems: 'center', gap: 8,
      padding: '0 12px',
      borderBottom: '1px solid rgba(200,167,93,0.2)',
      background: '#1A1410', flexShrink: 0, zIndex: 50,
    }}>
      {/* Back */}
      <a
        href={classicEditorUrl}
        style={{ ...iconBtn, background: 'rgba(255,255,255,0.06)', color: '#9B8878', padding: '6px 8px' }}
        aria-label="Volver"
      >
        ←
      </a>

      {/* Save status — fills remaining space */}
      <span style={{ flex: 1, fontSize: 11, color: saveStatus === 'saved' ? '#C5A880' : 'rgba(200,167,93,0.35)', textAlign: 'center', letterSpacing: '0.02em', transition: 'color 300ms' }}>
        {saveStatus === 'saved' ? '✓ Guardado' : '—'}
      </span>

      {/* Preview */}
      <a href={previewUrl} target="_blank" rel="noopener noreferrer" style={iconBtn} aria-label="Vista previa">
        ↗
      </a>

      {/* Share */}
      <button type="button" onClick={handleShare} style={iconBtn} aria-label="Compartir">
        ⬆
      </button>
    </div>
  );
}
