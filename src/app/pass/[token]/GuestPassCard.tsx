'use client';

import React, { useRef, useState } from 'react';
import QRCode from 'react-qr-code';

interface Props {
  passId: string;
  invitationId: string;
  guestName: string;
  allowedGuests: number;
  passToken: string;
  passUrl: string;
  status: string;
  checkedInAt: string | null;
  eventTitle: string;
  eventDate: string | null;
}

const T = {
  dark:   '#0D0A07',
  gold:   '#C4A962',
  cream:  '#F1E3C8',
  light:  '#6B4A35',
  border: '#EAD7A3',
  mid:    '#1A1612',
} as const;

function formatDate(iso?: string | null): string {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('es-MX', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      .format(new Date(iso.includes('T') ? iso : iso + 'T12:00:00'));
  } catch { return iso; }
}

function buildWaUrl(message: string, phone?: string): string {
  const encoded = encodeURIComponent(message);
  if (!phone) return `https://wa.me/?text=${encoded}`;
  const clean = phone.replace(/\D/g, '');
  const normalized = clean.length === 10 ? `52${clean}` : clean;
  return `https://wa.me/${normalized}?text=${encoded}`;
}

type Phase = 'view' | 'rsvp' | 'done';

export default function GuestPassCard({
  invitationId, guestName, allowedGuests, passToken, passUrl,
  status, checkedInAt, eventTitle, eventDate,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied,   setCopied]   = useState(false);
  const [phase,    setPhase]    = useState<Phase>(
    status === 'confirmed' || status === 'declined' ? 'done' : 'view',
  );
  const [rsvpName, setRsvpName] = useState(guestName);
  const [totalPpl, setTotalPpl] = useState(1);
  const [attending, setAttending] = useState<'yes' | 'no'>('yes');
  const [saving,   setSaving]   = useState(false);
  const [rsvpErr,  setRsvpErr]  = useState('');
  const [doneMsg,  setDoneMsg]  = useState('');

  const isUsed = status === 'used' || !!checkedInAt;

  async function handleDownload() {
    if (!cardRef.current) return;
    try {
      const { toPng } = await import('html-to-image');
      const url = await toPng(cardRef.current, { pixelRatio: 2 });
      const a = document.createElement('a');
      a.href = url;
      a.download = `pase-${guestName.replace(/\s+/g, '-').toLowerCase()}.png`;
      a.click();
    } catch { /* silent */ }
  }

  function handleCopy() {
    navigator.clipboard.writeText(passUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }).catch(() => prompt('Copia este enlace:', passUrl));
  }

  async function handleConfirm() {
    const name = rsvpName.trim();
    if (!name) { setRsvpErr('El nombre es requerido.'); return; }
    if (totalPpl < 1 || totalPpl > allowedGuests) {
      setRsvpErr(`Este pase permite máximo ${allowedGuests} persona${allowedGuests !== 1 ? 's' : ''}.`);
      return;
    }
    setSaving(true);
    setRsvpErr('');
    try {
      // guests_count = companions = totalPpl - 1
      const res = await fetch('/api/rsvp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          invitationId,
          name,
          attendance: attending,
          guestCount: attending === 'yes' ? totalPpl - 1 : 0,
          guestPassToken: passToken,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setRsvpErr(json.error ?? 'Error al confirmar.');
        return;
      }
      setDoneMsg(attending === 'yes'
        ? `¡Confirmado! ${name} asistirá con ${totalPpl} persona${totalPpl !== 1 ? 's' : ''}.`
        : `Confirmado. ${name} no podrá asistir.`);
      setPhase('done');
    } catch {
      setRsvpErr('Error de red. Intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  const waShareMsg = `¡Aquí está tu pase de entrada!\n\nInvitado: ${guestName}\nPase para: ${allowedGuests} persona${allowedGuests !== 1 ? 's' : ''}\n\nEvento: ${eventTitle}\n\nAbre tu pase aquí:\n${passUrl}\n\nPor favor confirma tu asistencia.`;

  return (
    <main style={{
      minHeight: '100dvh',
      background: '#0D0A07',
      backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(196,169,98,0.10) 0%, transparent 60%)',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '2rem 1rem 3rem',
      fontFamily: 'var(--font-inter, system-ui, sans-serif)',
    }}>

      {/* ── Capturable card ── */}
      <div ref={cardRef} style={{
        background: '#1A1612',
        border: `1px solid ${T.border}`,
        borderRadius: '1.5rem',
        padding: '2rem 1.5rem',
        width: '100%',
        maxWidth: '380px',
        textAlign: 'center',
        boxShadow: '0 24px 80px rgba(0,0,0,0.5)',
      }}>
        <p style={{ margin: '0 0 .125rem', fontSize: '.625rem', letterSpacing: '.25em', textTransform: 'uppercase', color: T.gold, fontWeight: 800 }}>KOMPRALO</p>
        <p style={{ margin: '0 0 1.25rem', fontSize: '.75rem', letterSpacing: '.15em', textTransform: 'uppercase', color: T.cream, opacity: 0.55 }}>Pase de entrada</p>

        <div style={{ background: '#fff', borderRadius: '1rem', padding: '1rem', display: 'inline-block', marginBottom: '1.25rem' }}>
          <QRCode value={passUrl} size={170} />
        </div>

        <p style={{ margin: '0 0 .25rem', fontSize: '1.375rem', fontWeight: 800, color: T.cream, fontFamily: 'var(--font-playfair, Georgia, serif)', lineHeight: 1.2 }}>
          {guestName}
        </p>
        <p style={{ margin: '0 0 1.25rem', fontSize: '.9375rem', color: T.gold, fontWeight: 700 }}>
          Pase para {allowedGuests} persona{allowedGuests !== 1 ? 's' : ''}
        </p>

        <div style={{ borderTop: `1px solid rgba(234,215,163,0.2)`, paddingTop: '.875rem', display: 'flex', flexDirection: 'column', gap: '.2rem' }}>
          <p style={{ margin: 0, fontSize: '.9375rem', fontWeight: 700, color: T.cream }}>{eventTitle}</p>
          {eventDate && (
            <p style={{ margin: 0, fontSize: '.8125rem', color: T.cream, opacity: 0.55, textTransform: 'capitalize' }}>{formatDate(eventDate)}</p>
          )}
        </div>

        {isUsed && (
          <div style={{ marginTop: '.875rem', padding: '.4rem .875rem', background: 'rgba(35,134,54,0.15)', border: '1px solid rgba(35,134,54,0.4)', borderRadius: '2rem', display: 'inline-block' }}>
            <span style={{ fontSize: '.8125rem', color: '#4EC970', fontWeight: 700 }}>✓ Pase utilizado</span>
          </div>
        )}

        {status === 'confirmed' && !isUsed && (
          <div style={{ marginTop: '.875rem', padding: '.4rem .875rem', background: 'rgba(35,134,54,0.15)', border: '1px solid rgba(35,134,54,0.4)', borderRadius: '2rem', display: 'inline-block' }}>
            <span style={{ fontSize: '.8125rem', color: '#4EC970', fontWeight: 700 }}>✓ Asistencia confirmada</span>
          </div>
        )}

        {status === 'declined' && (
          <div style={{ marginTop: '.875rem', padding: '.4rem .875rem', background: 'rgba(211,47,47,0.12)', border: '1px solid rgba(211,47,47,0.35)', borderRadius: '2rem', display: 'inline-block' }}>
            <span style={{ fontSize: '.8125rem', color: '#ff6b6b', fontWeight: 700 }}>✗ No asistirá</span>
          </div>
        )}
      </div>

      {/* ── Action buttons ── */}
      <div style={{ width: '100%', maxWidth: '380px', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
          <button
            onClick={handleDownload}
            style={btnStyle(T.gold, T.dark)}
          >
            ⬇ Descargar pase
          </button>
          <button
            onClick={handleCopy}
            style={btnStyle(copied ? 'rgba(35,134,54,0.15)' : 'rgba(241,227,200,0.08)', copied ? '#4EC970' : T.cream, copied ? 'rgba(35,134,54,0.4)' : 'rgba(234,215,163,0.25)')}
          >
            {copied ? '✓ Copiado' : '🔗 Copiar enlace'}
          </button>
        </div>

        <a
          href={buildWaUrl(waShareMsg)}
          target="_blank"
          rel="noopener noreferrer"
          style={{ ...btnStyle('#25D366', '#fff'), display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '.5rem', textDecoration: 'none' }}
        >
          📲 Compartir por WhatsApp
        </a>
      </div>

      {/* ── RSVP section ── */}
      <div style={{ width: '100%', maxWidth: '380px', marginTop: '1.5rem' }}>
        {phase === 'view' && (
          <div style={{
            background: 'rgba(241,227,200,0.06)',
            border: `1px solid rgba(234,215,163,0.18)`,
            borderRadius: '1.25rem', padding: '1.5rem',
          }}>
            <p style={{ margin: '0 0 .25rem', fontSize: '.6875rem', letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold, fontWeight: 700 }}>Confirma tu asistencia</p>
            <p style={{ margin: '0 0 1.25rem', fontSize: '.875rem', color: T.cream, opacity: 0.7, lineHeight: 1.5 }}>
              Este pase es para máximo <strong style={{ color: T.gold }}>{allowedGuests} persona{allowedGuests !== 1 ? 's' : ''}</strong>. Confirma si asistirás al evento.
            </p>
            <button
              onClick={() => setPhase('rsvp')}
              style={{ ...btnStyle(T.gold, T.dark), width: '100%' }}
            >
              Confirmar asistencia
            </button>
          </div>
        )}

        {phase === 'rsvp' && (
          <div style={{
            background: 'rgba(241,227,200,0.06)',
            border: `1px solid rgba(234,215,163,0.18)`,
            borderRadius: '1.25rem', padding: '1.5rem',
          }}>
            <p style={{ margin: '0 0 1.125rem', fontSize: '.6875rem', letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold, fontWeight: 700 }}>Confirmación de asistencia</p>

            {/* Name */}
            <label style={{ display: 'block', marginBottom: '1rem' }}>
              <span style={labelStyle}>Tu nombre</span>
              <input
                type="text"
                value={rsvpName}
                onChange={(e) => setRsvpName(e.target.value)}
                style={inputStyle}
              />
            </label>

            {/* ¿Asistirás? */}
            <fieldset style={{ border: 'none', padding: 0, margin: '0 0 1rem' }}>
              <legend style={{ ...labelStyle, display: 'block', marginBottom: '.5rem' }}>¿Asistirás?</legend>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
                {(['yes', 'no'] as const).map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setAttending(val)}
                    style={{
                      padding: '.625rem',
                      background: attending === val
                        ? (val === 'yes' ? 'rgba(35,134,54,0.2)' : 'rgba(211,47,47,0.15)')
                        : 'rgba(241,227,200,0.04)',
                      border: `1px solid ${attending === val
                        ? (val === 'yes' ? 'rgba(35,134,54,0.5)' : 'rgba(211,47,47,0.4)')
                        : 'rgba(234,215,163,0.2)'}`,
                      borderRadius: '.75rem', cursor: 'pointer',
                      color: attending === val
                        ? (val === 'yes' ? '#4EC970' : '#ff6b6b')
                        : T.cream,
                      fontSize: '.875rem', fontWeight: 700,
                    }}
                  >
                    {val === 'yes' ? '✓ Sí asistiré' : '✗ No podré ir'}
                  </button>
                ))}
              </div>
            </fieldset>

            {/* Number of people — only if attending */}
            {attending === 'yes' && (
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={labelStyle}>Total de personas</span>
                <span style={{ display: 'block', fontSize: '.75rem', color: T.cream, opacity: 0.5, marginBottom: '.375rem' }}>
                  Máximo {allowedGuests} persona{allowedGuests !== 1 ? 's' : ''} con este pase.
                </span>
                <div style={{ display: 'flex', gap: '.375rem', flexWrap: 'wrap' }}>
                  {Array.from({ length: allowedGuests }, (_, i) => i + 1).map((n) => (
                    <button
                      key={n}
                      type="button"
                      onClick={() => setTotalPpl(n)}
                      style={{
                        minWidth: '2.75rem', padding: '.5rem',
                        background: totalPpl === n ? T.gold : 'rgba(241,227,200,0.06)',
                        border: `1px solid ${totalPpl === n ? T.gold : 'rgba(234,215,163,0.2)'}`,
                        borderRadius: '.625rem', cursor: 'pointer',
                        color: totalPpl === n ? T.dark : T.cream,
                        fontSize: '.9375rem', fontWeight: 700,
                      }}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </label>
            )}

            {rsvpErr && (
              <p style={{ margin: '0 0 .875rem', fontSize: '.8125rem', color: '#ff6b6b', fontWeight: 600 }}>{rsvpErr}</p>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '.5rem' }}>
              <button
                onClick={() => { setPhase('view'); setRsvpErr(''); }}
                style={{ ...btnStyle('rgba(241,227,200,0.06)', T.cream, 'rgba(234,215,163,0.2)'), padding: '.625rem' }}
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirm}
                disabled={saving}
                style={{ ...btnStyle(T.gold, T.dark), padding: '.625rem', opacity: saving ? 0.7 : 1 }}
              >
                {saving ? 'Guardando…' : 'Confirmar'}
              </button>
            </div>
          </div>
        )}

        {phase === 'done' && (
          <div style={{
            background: 'rgba(35,134,54,0.08)',
            border: `1px solid rgba(35,134,54,0.3)`,
            borderRadius: '1.25rem', padding: '1.5rem', textAlign: 'center',
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '.5rem' }}>{attending === 'yes' ? '🎉' : '💌'}</div>
            <p style={{ margin: '0 0 .375rem', fontWeight: 800, color: '#4EC970', fontSize: '1rem' }}>
              {doneMsg || (status === 'confirmed' ? '¡Asistencia confirmada!' : 'Respuesta registrada')}
            </p>
            <p style={{ margin: 0, fontSize: '.8125rem', color: T.cream, opacity: 0.65, lineHeight: 1.5 }}>
              Guarda o comparte tu pase y preséntalo el día del evento.
            </p>
          </div>
        )}
      </div>

    </main>
  );
}

// ── Style helpers ─────────────────────────────────────────────────────────────

function btnStyle(bg: string, color: string, borderColor?: string): React.CSSProperties {
  return {
    padding: '.75rem 1rem',
    minHeight: '46px',
    background: bg,
    color,
    border: borderColor ? `1px solid ${borderColor}` : 'none',
    borderRadius: '.875rem',
    fontSize: '.875rem',
    fontWeight: 700,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '.375rem',
    lineHeight: 1.3,
    whiteSpace: 'normal' as const,
    wordBreak: 'break-word' as const,
  };
}

const labelStyle: React.CSSProperties = {
  fontSize: '.8125rem', fontWeight: 700,
  color: '#F1E3C8', opacity: 0.8, marginBottom: '.375rem',
};

const inputStyle: React.CSSProperties = {
  width: '100%', padding: '.625rem .875rem',
  background: 'rgba(241,227,200,0.08)',
  border: '1px solid rgba(234,215,163,0.25)',
  borderRadius: '.75rem', fontSize: '.9375rem',
  color: '#F1E3C8', outline: 'none', boxSizing: 'border-box',
};
