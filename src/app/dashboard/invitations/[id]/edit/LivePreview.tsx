'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface Props {
  invitationId: string;
}

const MSG_TYPE = 'KOMPRALO_PREVIEW_REFRESH';

export function LivePreview({ invitationId }: Props) {
  const iframeRef        = useRef<HTMLIFrameElement>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  const previewUrl = `/preview/${invitationId}`;

  // ── Refresh the iframe ───────────────────────────────────────────────────
  const refresh = useCallback(() => {
    const iframe = iframeRef.current;
    if (!iframe) return;
    setLoading(true);
    // Re-assign src to force a full reload (works cross-origin too).
    iframe.src = previewUrl;
  }, [previewUrl]);

  // ── Listen for postMessage from sibling form components ───────────────────
  useEffect(() => {
    function handleMessage(event: MessageEvent) {
      // Only trust same-origin messages.
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === MSG_TYPE) {
        refresh();
      }
    }
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refresh]);

  // ── Copy preview URL ─────────────────────────────────────────────────────
  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(window.location.origin + previewUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: no-op if clipboard unavailable
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-t-xl border-b flex-shrink-0"
        style={{ background: '#1A1410', borderColor: '#2D2420' }}
      >
        {/* Dot decorations */}
        <div className="flex gap-1.5 mr-2">
          <div className="w-2.5 h-2.5 rounded-full bg-red-500 opacity-70" />
          <div className="w-2.5 h-2.5 rounded-full bg-yellow-500 opacity-70" />
          <div className="w-2.5 h-2.5 rounded-full bg-green-500 opacity-70" />
        </div>

        {/* URL pill */}
        <div
          className="flex-1 text-xs rounded px-2 py-1 truncate font-mono"
          style={{ background: '#2D2420', color: '#9B8878' }}
        >
          {previewUrl}
        </div>

        {/* Actions */}
        <button
          type="button"
          onClick={refresh}
          title="Refrescar preview"
          className="text-xs px-2 py-1 rounded transition-colors"
          style={{ color: '#A89080' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C5A880')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#A89080')}
        >
          ↻
        </button>

        <button
          type="button"
          onClick={handleCopy}
          title="Copiar URL"
          className="text-xs px-2 py-1 rounded transition-colors whitespace-nowrap"
          style={{ color: '#A89080' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C5A880')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#A89080')}
        >
          {copied ? '✓ Copiado' : 'Copiar'}
        </button>

        <a
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          title="Abrir en nueva pestaña"
          className="text-xs px-2 py-1 rounded transition-colors whitespace-nowrap"
          style={{ color: '#A89080' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#C5A880')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#A89080')}
        >
          ↗ Nueva pestaña
        </a>
      </div>

      {/* iframe container */}
      <div className="relative flex-1 rounded-b-xl overflow-hidden border border-t-0" style={{ borderColor: '#E8E2DA' }}>
        {loading && (
          <div
            className="absolute inset-0 flex items-center justify-center text-xs z-10"
            style={{ background: '#F5F3F0', color: '#9B8878' }}
          >
            Cargando preview…
          </div>
        )}
        <iframe
          ref={iframeRef}
          src={previewUrl}
          title="Vista previa de la invitación"
          className="w-full h-full border-0"
          style={{ minHeight: 600 }}
          onLoad={() => setLoading(false)}
          // Allow same-origin scripts inside the iframe
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  );
}
