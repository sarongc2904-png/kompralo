'use client';

import { useState, useRef } from 'react';
import QRCode from 'react-qr-code';

const T = {
  dark:   '#0D0A07',
  mid:    '#1A1612',
  light:  '#6B4A35',
  gold:   '#C4A962',
  cream:  '#F1E3C8',
  border: '#EAD7A3',
  ivory:  '#F7F2E9',
} as const;

const attendanceLabel: Record<string, string> = {
  yes: 'Sí asistirá', no: 'No asistirá', maybe: 'Tal vez',
};

function formatEventDate(iso: string | null): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('es-MX', {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
    }).format(new Date(iso.includes('T') ? iso : iso + 'T12:00:00'));
  } catch { return iso; }
}

interface Props {
  guestName:   string;
  attendance:  string;
  guestCount:  number;
  eventTitle:  string;
  eventDate:   string | null;
  passToken:   string;
  passUrl:     string;
  checkedInAt: string | null;
}

export default function PassCard({
  guestName, attendance, guestCount, eventTitle, eventDate,
  passToken, passUrl, checkedInAt,
}: Props) {
  const [copied, setCopied] = useState(false);
  const cardRef             = useRef<HTMLDivElement>(null);

  const isAttending   = attendance === 'yes';
  const totalPeople   = isAttending ? Math.max(1, guestCount) : 0;
  const formattedDate = formatEventDate(eventDate);

  const shareMessage =
    `Hola, este es mi pase de entrada al evento:\n\n` +
    `Nombre: ${guestName}\n` +
    (isAttending ? `Personas confirmadas: ${totalPeople}\n` : '') +
    `\nVer pase:\n${passUrl}`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(passUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copia el link de tu pase:', passUrl);
    }
  }

  async function handleDownload() {
    try {
      const { toPng } = await import('html-to-image');
      if (!cardRef.current) return;
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: '#F7F2E9',
        pixelRatio: 2,
      });
      const a    = document.createElement('a');
      a.download = `pase-${guestName.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}.png`;
      a.href     = dataUrl;
      a.click();
    } catch (err) {
      console.error('Error al descargar pase:', err);
    }
  }

  return (
    <main style={{
      minHeight:   '100dvh',
      background:  T.ivory,
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(196,169,98,0.08) 0%, transparent 60%)',
      display:     'flex',
      flexDirection: 'column',
      alignItems:  'center',
      justifyContent: 'center',
      padding:     '2rem 1.25rem 3rem',
      fontFamily:  'system-ui, -apple-system, sans-serif',
    }}>
      {/* Pass card — this div is captured for PNG download */}
      <div
        ref={cardRef}
        style={{
          width:        '100%',
          maxWidth:     '360px',
          background:   '#ffffff',
          border:       `1px solid ${T.border}`,
          borderRadius: '1.5rem',
          overflow:     'hidden',
          boxShadow:    '0 8px 32px rgba(13,10,7,0.08)',
        }}
      >
        {/* Gold header strip */}
        <div style={{
          background:  `linear-gradient(135deg, ${T.gold} 0%, #B4966E 100%)`,
          padding:     '1.25rem 1.5rem',
          textAlign:   'center',
        }}>
          <p style={{ margin: 0, fontSize: '.625rem', fontWeight: 800, letterSpacing: '.3em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.75)' }}>
            KOMPRALO
          </p>
          <p style={{ margin: '.25rem 0 0', fontSize: '.75rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: '#ffffff' }}>
            Pase de entrada
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '1.5rem', textAlign: 'center' }}>

          {/* Event title */}
          <p style={{ margin: '0 0 .25rem', fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: T.gold }}>
            {eventTitle}
          </p>
          {formattedDate && (
            <p style={{ margin: '0 0 1.25rem', fontSize: '.8125rem', color: T.light, lineHeight: 1.4 }}>
              {formattedDate}
            </p>
          )}

          <div style={{ height: '1px', background: T.border, margin: '0 0 1.25rem' }} />

          {/* Guest name */}
          <p style={{ margin: '0 0 .25rem', fontSize: '.625rem', fontWeight: 700, letterSpacing: '.18em', textTransform: 'uppercase', color: T.light }}>
            Invitado
          </p>
          <p style={{ margin: '0 0 1rem', fontSize: '1.375rem', fontWeight: 700, color: T.dark, lineHeight: 1.2, wordBreak: 'break-word' }}>
            {guestName}
          </p>

          {/* Attendance + people */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1.5rem', marginBottom: '1.25rem' }}>
            <div style={{ textAlign: 'center' }}>
              <p style={{ margin: '0 0 .125rem', fontSize: '.625rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: T.light }}>
                Asistencia
              </p>
              <p style={{
                margin: 0, fontSize: '.875rem', fontWeight: 700,
                color: isAttending ? '#238636' : '#D32F2F',
              }}>
                {attendanceLabel[attendance] ?? attendance}
              </p>
            </div>
            {isAttending && (
              <div style={{ textAlign: 'center' }}>
                <p style={{ margin: '0 0 .125rem', fontSize: '.625rem', fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: T.light }}>
                  Personas
                </p>
                <p style={{ margin: 0, fontSize: '.875rem', fontWeight: 700, color: T.dark }}>
                  {totalPeople}
                </p>
              </div>
            )}
          </div>

          <div style={{ height: '1px', background: T.border, margin: '0 0 1.25rem' }} />

          {/* QR */}
          <div style={{ display: 'inline-flex', background: '#ffffff', padding: '.875rem', border: `1px solid ${T.border}`, borderRadius: '.75rem', marginBottom: '1rem' }}>
            <QRCode value={passUrl} size={160} level="M" />
          </div>

          <p style={{ margin: '0 0 .5rem', fontSize: '.6875rem', color: T.light, wordBreak: 'break-all', lineHeight: 1.5 }}>
            {passUrl}
          </p>

          <p style={{ margin: 0, fontSize: '.625rem', color: T.gold, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase' }}>
            Presenta este pase en la entrada
          </p>

          {/* Check-in badge if already used */}
          {checkedInAt && (
            <div style={{
              marginTop: '1rem', padding: '.5rem 1rem',
              background: '#E6F4EA', border: '1px solid #A7D7B0',
              borderRadius: '.75rem', fontSize: '.8125rem',
              color: '#238636', fontWeight: 700,
            }}>
              ✓ Pase utilizado
            </div>
          )}
        </div>
      </div>

      {/* Action buttons — outside of card ref so they don't appear in the downloaded image */}
      <div style={{ width: '100%', maxWidth: '360px', marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
        <button
          onClick={handleDownload}
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
          ⬇ Descargar pase
        </button>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            width: '100%', minHeight: '46px',
            padding: '.75rem 1rem',
            background: '#25D366', color: '#fff',
            border: 'none', borderRadius: '.75rem',
            fontSize: '.875rem', fontWeight: 700,
            cursor: 'pointer', display: 'flex',
            alignItems: 'center', justifyContent: 'center', gap: '.5rem',
            textDecoration: 'none', boxSizing: 'border-box',
          }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.532 5.852L.072 23.928l6.244-1.636A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.648-.51-5.162-1.4l-.37-.22-3.807.997 1.016-3.705-.24-.382A10 10 0 112 12c0 5.514 4.486 10 10 10z"/>
          </svg>
          Enviar pase por WhatsApp
        </a>

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
            boxSizing: 'border-box',
          }}
        >
          {copied ? '✓ Link copiado' : '⎘ Copiar link del pase'}
        </button>
      </div>

      <p style={{ marginTop: '2rem', fontSize: '.6875rem', color: T.light, opacity: 0.6 }}>
        Pase ID: {passToken.slice(0, 8)}…
      </p>
    </main>
  );
}
