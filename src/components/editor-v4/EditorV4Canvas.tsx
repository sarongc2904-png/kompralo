'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

export type EditorV4CanvasMode = 'normal' | 'intro';

export interface EditorV4CanvasHandle {
  refresh: () => void;
  scrollToSection: (sectionId: string) => void;
}

interface EditorV4CanvasProps {
  invitationId: string;
  mode?: EditorV4CanvasMode;
}

export const EditorV4Canvas = forwardRef<EditorV4CanvasHandle, EditorV4CanvasProps>(
  function EditorV4Canvas({ invitationId, mode = 'normal' }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loading, setLoading] = useState(true);

    const normalUrl = `/preview/${invitationId}?from=editor&editorPreview=1&skipIntro=1`;
    const introUrl  = `/preview/${invitationId}?from=editor&introOnly=1`;

    const currentUrl = mode === 'intro' ? introUrl : normalUrl;

    // Reload iframe when mode switches
    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      setLoading(true);
      iframe.src = currentUrl;
    }, [currentUrl]);

    useImperativeHandle(ref, () => ({
      refresh() {
        const iframe = iframeRef.current;
        if (!iframe) return;
        setLoading(true);
        iframe.src = currentUrl;
      },
      scrollToSection(sectionId: string) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'KOMPRALO_SCROLL_TO_SECTION', sectionId },
          window.location.origin,
        );
      },
    }));

    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#F0EBE3' }}>
        {/* Device frame hint */}
        <div style={{
          position: 'absolute',
          inset: '12px 20px',
          borderRadius: 16,
          boxShadow: '0 0 0 1px rgba(200,167,93,0.2), 0 8px 32px rgba(116,84,38,0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
        }}>
          {/* Loading overlay */}
          {loading && (
            <div style={{
              position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
              justifyContent: 'center', background: '#FAF7F2', zIndex: 10,
              fontSize: 12, color: '#9B8878',
            }}>
              {mode === 'intro' ? 'Cargando intro…' : 'Cargando invitación…'}
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={currentUrl}
            title={mode === 'intro' ? 'Editor V4 — Intro Cinematográfico' : 'Editor V4 — Vista previa'}
            style={{ flex: 1, border: 'none', display: 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    );
  }
);
