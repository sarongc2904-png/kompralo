'use client';

import { useState } from 'react';

const T = {
  dark:   '#1C1713',
  gold:   '#C8A95B',
  cream:  '#FFFBF4',
  border: '#E5D2A8',
  light:  '#7A6A5B',
} as const;

interface Props {
  publicUrl: string;
  eventTitle: string;
}

export default function ShareButtons({ publicUrl, eventTitle }: Props) {
  const [copied, setCopied] = useState(false);

  const shareMessage = `Hola, queremos invitarte a nuestro evento${eventTitle ? ` "${eventTitle}"` : ''}.

Abre nuestra invitación digital aquí:
${publicUrl}

Por favor confirma tu asistencia desde la invitación. ¡Te esperamos!`;

  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(publicUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      window.prompt('Copia el link:', publicUrl);
    }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '.625rem' }}>
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
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.532 5.852L.072 23.928l6.244-1.636A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.648-.51-5.162-1.4l-.37-.22-3.807.997 1.016-3.705-.24-.382A10 10 0 112 12c0 5.514 4.486 10 10 10z"/>
        </svg>
        Compartir por WhatsApp
      </a>

      <button
        onClick={handleCopy}
        style={{
          width: '100%', minHeight: '46px',
          padding: '.75rem 1rem',
          background: copied ? '#E7F5EC' : T.cream,
          color: copied ? '#247A45' : T.dark,
          border: `1px solid ${copied ? '#B8DFC4' : T.border}`,
          borderRadius: '.75rem',
          fontSize: '.875rem', fontWeight: 700,
          cursor: 'pointer', display: 'flex',
          alignItems: 'center', justifyContent: 'center', gap: '.5rem',
          transition: 'background .2s, color .2s, border-color .2s',
          boxSizing: 'border-box',
        }}
      >
        {copied ? '✓ ¡Link copiado!' : '⎘ Copiar link de invitación'}
      </button>
    </div>
  );
}
