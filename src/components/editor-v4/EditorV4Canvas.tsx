'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import type { SerializedRect } from './editor-v4-events';
import {
  EDITOR_V4_SECTION_HOVER,
  EDITOR_V4_SECTION_HOVER_END,
} from './editor-v4-events';

export type EditorV4CanvasMode = 'normal' | 'intro';

export interface EditorV4CanvasHandle {
  refresh: () => void;
  scrollToSection: (sectionId: string) => void;
  /** Push a field value change into the live iframe without reloading */
  sendFieldUpdate: (fieldPath: string, value: string) => void;
}

interface EditorV4CanvasProps {
  invitationId: string;
  mode?: EditorV4CanvasMode;
  /** When true, renders without the desktop device-frame chrome so the
   *  iframe fills the full area and touch-scroll works naturally on mobile. */
  isMobile?: boolean;
}

// Inset of the device-frame wrapper (desktop normal mode).
// Must match the `inset` value in the device-frame style below.
const FRAME_TOP  = 12;
const FRAME_LEFT = 20;

/** Shared full-bleed iframe used in mobile mode and desktop intro mode */
function FullBleedIframe({
  iframeRef,
  src,
  title,
  loading,
  onLoad,
}: {
  iframeRef: React.RefObject<HTMLIFrameElement | null>;
  src: string;
  title: string;
  loading: boolean;
  onLoad: () => void;
}) {
  return (
    <>
      {loading && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#1A1410', zIndex: 10,
          fontSize: 12, color: '#9B8878',
        }}>
          Cargando…
        </div>
      )}
      <iframe
        ref={iframeRef}
        src={src}
        title={title}
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          border: 'none',
          display: 'block',
          touchAction: 'pan-y',
          overscrollBehavior: 'contain',
        } as React.CSSProperties}
        sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        onLoad={onLoad}
      />
    </>
  );
}

export const EditorV4Canvas = forwardRef<EditorV4CanvasHandle, EditorV4CanvasProps>(
  function EditorV4Canvas({ invitationId, mode = 'normal', isMobile = false }, ref) {
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const [loading, setLoading] = useState(true);
    const [hoveredSection, setHoveredSection] = useState<{ sectionId: string; rect: SerializedRect } | null>(null);

    const normalUrl = `/preview/${invitationId}?from=editor&editorPreview=1&skipIntro=1`;
    const introUrl  = `/preview/${invitationId}?from=editor&introOnly=1`;
    const currentUrl = mode === 'intro' ? introUrl : normalUrl;

    useEffect(() => {
      const iframe = iframeRef.current;
      if (!iframe) return;
      setLoading(true);
      iframe.src = currentUrl;
    }, [currentUrl]);

    // Listen for section hover/end events fired by the iframe's hover bridge
    useEffect(() => {
      function handleMessage(e: MessageEvent) {
        if (e.origin !== window.location.origin) return;
        if (e.data?.type === EDITOR_V4_SECTION_HOVER) {
          setHoveredSection({ sectionId: e.data.sectionId, rect: e.data.rect });
        } else if (e.data?.type === EDITOR_V4_SECTION_HOVER_END) {
          setHoveredSection(null);
        }
      }
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }, []);

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
      sendFieldUpdate(fieldPath: string, value: string) {
        iframeRef.current?.contentWindow?.postMessage(
          { type: 'EDITOR_V4_FIELD_SAVED', fieldPath, value },
          window.location.origin,
        );
      },
    }));

    const isFullBleed = isMobile || mode === 'intro';

    // Bounding-box overlay — positioned relative to the canvas container.
    // Coordinates from the iframe are viewport-relative; we add the iframe's
    // inset within the canvas to translate them to canvas-relative coords.
    const overlay = hoveredSection ? (
      <div
        aria-hidden
        style={{
          position: 'absolute',
          pointerEvents: 'none',
          zIndex: 20,
          top:    (isFullBleed ? 0 : FRAME_TOP)  + hoveredSection.rect.top,
          left:   (isFullBleed ? 0 : FRAME_LEFT) + hoveredSection.rect.left,
          width:  hoveredSection.rect.width,
          height: hoveredSection.rect.height,
          border: '1.5px solid rgba(200,167,93,0.55)',
          borderRadius: 4,
          background: 'rgba(200,167,93,0.04)',
          transition: 'top 60ms ease, left 60ms ease, width 60ms ease, height 60ms ease',
        }}
      />
    ) : null;

    // ── Mobile OR desktop intro: full-bleed — no device frame, no radius, no clip ──
    if (isFullBleed) {
      return (
        <div style={{ position: 'relative', width: '100%', height: '100%', background: '#1A1410' }}>
          <FullBleedIframe
            iframeRef={iframeRef}
            src={currentUrl}
            title={mode === 'intro' ? 'Editor V4 — Intro Cinematográfico' : 'Editor V4 — Vista previa móvil'}
            loading={loading}
            onLoad={() => setLoading(false)}
          />
          {overlay}
        </div>
      );
    }

    // ── Desktop normal: device-frame chrome ───────────────────────────────────
    return (
      <div style={{ position: 'relative', width: '100%', height: '100%', background: '#F0EBE3' }}>
        <div style={{
          position: 'absolute',
          inset: `${FRAME_TOP}px ${FRAME_LEFT}px`,
          borderRadius: 16,
          boxShadow: '0 0 0 1px rgba(200,167,93,0.2), 0 8px 32px rgba(116,84,38,0.12)',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          background: '#fff',
        }}>
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
            src={currentUrl}
            title="Editor V4 — Vista previa"
            style={{ flex: 1, border: 'none', display: 'block' }}
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
            onLoad={() => setLoading(false)}
          />
        </div>
        {overlay}
      </div>
    );
  }
);
