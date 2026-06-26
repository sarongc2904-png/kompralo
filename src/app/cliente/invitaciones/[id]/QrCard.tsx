'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'react-qr-code';

const T = {
  dark:   '#1C1713',
  mid:    '#1C1713',
  light:  '#7A6A5B',
  gold:   '#C8A95B',
  cream:  '#FFFBF4',
  border: '#E5D2A8',
} as const;

interface Props {
  publicUrl: string;
  eventSlug: string;
}

export default function QrCard({ publicUrl, eventSlug }: Props) {
  const [open, setOpen]     = useState(false);
  const [copied, setCopied] = useState(false);
  const qrRef               = useRef<HTMLDivElement>(null);

  const close = useCallback(() => setOpen(false), []);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) { if (e.key === 'Escape') close(); }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, close]);

  // Scroll lock while open
  useEffect(() => {
    if (open) document.body.style.overflow = 'hidden';
    else document.body.style.overflow = '';
    return () => { document.body.style.overflow = ''; };
  }, [open]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copia el link:', publicUrl);
    }
  }

  async function handleDownloadQr() {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;

    const size    = 320;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas  = document.createElement('canvas');
    canvas.width  = size + 40;
    canvas.height = size + 40;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img  = new Image();
    const blob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
    const url  = URL.createObjectURL(blob);

    img.onload = () => {
      ctx.drawImage(img, 20, 20, size, size);
      URL.revokeObjectURL(url);
      const a    = document.createElement('a');
      a.download = `qr-invitacion-${eventSlug}.png`;
      a.href     = canvas.toDataURL('image/png');
      a.click();
    };
    img.src = url;
  }

  return (
    <>
      {/* ── Trigger button ── */}
      <button
        onClick={() => setOpen(true)}
        style={{
          width: '100%', minHeight: '46px',
          padding: '.75rem 1rem',
          background: T.dark, color: T.cream,
          border: 'none', borderRadius: '.75rem',
          fontSize: '.875rem', fontWeight: 700,
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '.5rem',
          boxSizing: 'border-box',
        }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M3 3h6v6H3V3zm2 2v2h2V5H5zm8-2h6v6h-6V3zm2 2v2h2V5h-2zM3 13h6v6H3v-6zm2 2v2h2v-2H5zm13-2h2v2h-2v-2zm-4 0h2v2h-2v-2zm4 4h2v4h-6v-2h2v-2h2zm-4 2h2v2h-2v-2z"/>
        </svg>
        Ver código QR
      </button>

      {/* ── Modal ── */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            onClick={close}
            aria-hidden="true"
            style={{
              position: 'fixed', inset: 0,
              background: 'rgba(28,23,19,0.72)',
              backdropFilter: 'blur(4px)',
              WebkitBackdropFilter: 'blur(4px)',
              zIndex: 9998,
            }}
          />

          {/* Dialog */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Código QR de tu invitación"
            style={{
              position: 'fixed',
              top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 'min(380px, calc(100vw - 2rem))',
              maxHeight: 'calc(100dvh - 2rem)',
              overflowY: 'auto',
              background: T.cream,
              border: `1px solid ${T.border}`,
              borderRadius: '1.5rem',
              padding: '1.5rem',
              zIndex: 9999,
              boxShadow: '0 20px 60px rgba(28,23,19,0.28)',
              textAlign: 'center',
              boxSizing: 'border-box',
            }}
          >
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: '1.25rem',
            }}>
              <p style={{
                margin: 0, fontSize: '.6875rem', fontWeight: 700,
                letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold,
              }}>
                Código QR de tu invitación
              </p>
              <button
                onClick={close}
                aria-label="Cerrar"
                style={{
                  background: 'none', border: `1px solid ${T.border}`,
                  cursor: 'pointer', padding: '.25rem .6rem',
                  color: T.mid, fontSize: '1.25rem', lineHeight: 1,
                  borderRadius: '.5rem', fontWeight: 700,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                ×
              </button>
            </div>

            {/* QR Code */}
            <div
              ref={qrRef}
              style={{
                display: 'inline-flex',
                background: '#ffffff',
                padding: '1rem',
                borderRadius: '.75rem',
                border: `1px solid ${T.border}`,
                marginBottom: '1rem',
              }}
            >
              <QRCode value={publicUrl} size={200} level="M" />
            </div>

            {/* Public link */}
            <p style={{
              margin: '0 0 1.25rem',
              fontSize: '.75rem',
              color: T.light,
              wordBreak: 'break-all',
              lineHeight: 1.5,
              padding: '0 .25rem',
            }}>
              {publicUrl}
            </p>

            {/* Action buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
              <button
                onClick={handleDownloadQr}
                style={{
                  width: '100%', minHeight: '46px',
                  padding: '.75rem 1rem',
                  background: T.dark, color: T.cream,
                  border: 'none', borderRadius: '.75rem',
                  fontSize: '.875rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                }}
              >
                ⬇ Descargar QR como imagen
              </button>

              <button
                onClick={handleCopy}
                style={{
                  width: '100%', minHeight: '46px',
                  padding: '.75rem 1rem',
                  background: copied ? '#E7F5EC' : '#ffffff',
                  color: copied ? '#247A45' : T.dark,
                  border: `1px solid ${copied ? '#B8DFC4' : T.border}`,
                  borderRadius: '.75rem',
                  fontSize: '.875rem', fontWeight: 700,
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', gap: '.5rem',
                  transition: 'background .2s, color .2s, border-color .2s',
                }}
              >
                {copied ? '✓ ¡Link copiado!' : '⎘ Copiar link de invitación'}
              </button>

              <button
                onClick={close}
                style={{
                  width: '100%', minHeight: '46px',
                  padding: '.75rem 1rem',
                  background: 'transparent', color: T.light,
                  border: `1px solid ${T.border}`, borderRadius: '.75rem',
                  fontSize: '.875rem', fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
