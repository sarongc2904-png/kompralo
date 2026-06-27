'use client';

import { forwardRef, useImperativeHandle, useRef, useState } from 'react';

export interface EditorV4CanvasHandle {
  refresh: () => void;
  scrollToSection: (sectionId: string) => void;
}

interface EditorV4CanvasProps {
  invitationId: string;
}

export const EditorV4Canvas = forwardRef<EditorV4CanvasHandle, EditorV4CanvasProps>(
  function EditorV4Canvas({ invitationId }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loading, setLoading] = useState(true);

    // Preview URL with editorPreview=1 enables editablePreview mode in InvitationRenderer
    const previewUrl = `/preview/${invitationId}?from=editor&editorPreview=1`;

    useImperativeHandle(ref, () => ({
      refresh() {
        const iframe = iframeRef.current;
        if (!iframe) return;
        setLoading(true);
        iframe.src = previewUrl;
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
              Cargando invitación…
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={previewUrl}
            title="Editor V4 — Vista previa"
            style={{ flex: 1, border: 'none', display: 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setLoading(false)}
          />
        </div>
      </div>
    );
  }
);
