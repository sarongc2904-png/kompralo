'use client';

interface EditorV4ToolbarProps {
  invitationTitle: string;
  slug: string;
  invitationId: string;
  onRefresh: () => void;
  /** URL to go back to the classic editor */
  classicEditorUrl: string;
}

export function EditorV4Toolbar({
  invitationTitle,
  slug,
  invitationId,
  onRefresh,
  classicEditorUrl,
}: EditorV4ToolbarProps) {
  const btnBase: React.CSSProperties = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 5,
    padding: '5px 12px',
    borderRadius: 7,
    fontSize: 11,
    fontWeight: 600,
    cursor: 'pointer',
    border: 'none',
    whiteSpace: 'nowrap',
    textDecoration: 'none',
    transition: 'opacity 150ms',
  };

  return (
    <div
      style={{
        height: 48,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '0 16px',
        borderBottom: '1px solid rgba(200,167,93,0.2)',
        background: '#1A1410',
        flexShrink: 0,
        zIndex: 50,
      }}
    >
      {/* Logo/brand mark */}
      <span style={{ fontSize: 13, fontWeight: 700, color: '#C5A880', letterSpacing: '0.08em', marginRight: 4 }}>
        KOMPRALO
      </span>
      <span style={{ width: 1, height: 20, background: 'rgba(200,167,93,0.2)', flexShrink: 0 }} />

      {/* Invitation title */}
      <span style={{ fontSize: 12, color: '#F5EDD8', flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        {invitationTitle}
      </span>
      <span style={{ fontSize: 11, color: '#9B8878', fontFamily: 'monospace', flexShrink: 0 }}>
        /{slug}
      </span>

      <span style={{ width: 1, height: 20, background: 'rgba(200,167,93,0.2)', flexShrink: 0 }} />

      {/* Refresh */}
      <button
        type="button"
        onClick={onRefresh}
        style={{ ...btnBase, background: 'rgba(200,167,93,0.12)', color: '#C5A880' }}
        title="Refrescar preview"
      >
        ↻ Refrescar
      </button>

      {/* Preview link */}
      <a
        href={`/preview/${invitationId}`}
        target="_blank"
        rel="noopener noreferrer"
        style={{ ...btnBase, background: 'rgba(200,167,93,0.12)', color: '#C5A880' }}
      >
        ↗ Vista previa
      </a>

      {/* Back to classic editor */}
      <a
        href={classicEditorUrl}
        style={{ ...btnBase, background: 'rgba(255,255,255,0.06)', color: '#9B8878' }}
      >
        ← Editor clásico
      </a>
    </div>
  );
}
