'use client';

import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';

const T = {
  dark:      '#0D0A07',
  mid:       '#1A1612',
  light:     '#6B4A35',
  gold:      '#C4A962',
  cream:     '#F1E3C8',
  border:    '#EAD7A3',
  white:     '#F1E3C8',
} as const;

interface Props {
  publicUrl: string;
  eventSlug: string;
}

export default function QrCard({ publicUrl, eventSlug }: Props) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // fallback: prompt
      window.prompt('Copia el link:', publicUrl);
    }
  }

  async function handleDownloadQr() {
    const svgEl = qrRef.current?.querySelector('svg');
    if (!svgEl) return;

    const size = 320;
    const svgData = new XMLSerializer().serializeToString(svgEl);
    const canvas  = document.createElement('canvas');
    canvas.width  = size + 40;
    canvas.height = size + 40;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const img = new Image();
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
    <div style={{
      background:   T.white,
      border:       `1px solid ${T.border}`,
      borderRadius: '1.25rem',
      padding:      '1.5rem',
      textAlign:    'center',
      boxShadow:    '0 2px 8px rgba(15,12,9,0.03)',
    }}>
      <p style={{ margin: '0 0 1.25rem', fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold }}>
        Código QR de tu invitación
      </p>

      {/* QR */}
      <div
        ref={qrRef}
        style={{
          display:      'inline-flex',
          background:   '#ffffff',
          padding:      '1rem',
          borderRadius: '.75rem',
          border:       `1px solid ${T.border}`,
          marginBottom: '1rem',
        }}
      >
        <QRCode value={publicUrl} size={180} level="M" />
      </div>

      {/* Public link text */}
      <p style={{
        margin:       '0 0 1.25rem',
        fontSize:     '.75rem',
        color:        T.light,
        wordBreak:    'break-all',
        lineHeight:   1.5,
        padding:      '0 .25rem',
      }}>
        {publicUrl}
      </p>

      {/* Buttons */}
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
          ⬇ Descargar QR
        </button>

        <button
          onClick={handleCopy}
          style={{
            width: '100%', minHeight: '46px',
            padding: '.75rem 1rem',
            background: copied ? '#E6F4EA' : T.cream,
            color: copied ? '#238636' : T.dark,
            border: `1px solid ${copied ? '#A7D7B0' : T.border}`,
            borderRadius: '.75rem',
            fontSize: '.875rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '.5rem',
            transition: 'background .2s, color .2s, border-color .2s',
          }}
        >
          {copied ? '✓ ¡Link copiado!' : '⎘ Copiar link'}
        </button>
      </div>
    </div>
  );
}
