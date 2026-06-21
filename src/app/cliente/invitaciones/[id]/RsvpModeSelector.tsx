'use client';

import React, { useState, useTransition } from 'react';

type RsvpMode = 'open' | 'passes_only';

interface Props {
  invitationId: string;
  initialMode: RsvpMode;
  publicUrl: string;
  eventTitle: string;
}

const T = {
  dark:   '#0D0A07',
  mid:    '#1A1612',
  light:  '#6B4A35',
  gold:   '#C4A962',
  cream:  '#F1E3C8',
  white:  '#FFFAF3',
  border: '#EAD7A3',
  green:  '#238636',
} as const;

function buildInviteWaMsg(publicUrl: string, eventTitle: string): string {
  return `Hola, te compartimos nuestra invitación digital${eventTitle ? ` para "${eventTitle}"` : ''}.\n\nVer invitación:\n${publicUrl}\n\nPor favor confirma tu asistencia desde la invitación.`;
}

export default function RsvpModeSelector({ invitationId, initialMode, publicUrl, eventTitle }: Props) {
  const [mode, setMode]       = useState<RsvpMode>(initialMode);
  const [saved, setSaved]     = useState(false);
  const [error, setError]     = useState('');
  const [isPending, startTransition] = useTransition();

  async function handleChange(next: RsvpMode) {
    if (next === mode) return;
    setError('');
    setSaved(false);

    startTransition(async () => {
      try {
        const res = await fetch(`/api/invitations/${invitationId}/rsvp-mode`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rsvpMode: next }),
        });
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          throw new Error(j.error ?? 'Error al guardar');
        }
        setMode(next);
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Error al guardar');
      }
    });
  }

  const waInviteUrl = `https://wa.me/?text=${encodeURIComponent(buildInviteWaMsg(publicUrl, eventTitle))}`;

  return (
    <div style={{ marginBottom: '1.5rem' }}>
      {/* Section header */}
      <div style={{ marginBottom: '.875rem' }}>
        <p style={{ margin: '0 0 .2rem', fontSize: '.6875rem', fontWeight: 700, letterSpacing: '.2em', textTransform: 'uppercase', color: T.gold }}>
          Modo de confirmación
        </p>
        <p style={{ margin: 0, fontSize: '.8125rem', color: T.light }}>
          Elige cómo quieres que tus invitados confirmen asistencia.
        </p>
      </div>

      {/* Two mode cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '.75rem', marginBottom: '.75rem' }}>
        <ModeCard
          value="open"
          current={mode}
          label="Invitación con RSVP"
          description="Comparte la invitación y tus invitados confirmarán asistencia directamente desde ella."
          icon="✉️"
          disabled={isPending}
          onClick={handleChange}
        />
        <ModeCard
          value="passes_only"
          current={mode}
          label="Invitación + pase QR"
          description="Crea pases personalizados para controlar cuántas personas puede confirmar cada invitado o familia."
          icon="🎟️"
          disabled={isPending}
          onClick={handleChange}
        />
      </div>

      {/* Feedback */}
      {error && (
        <p style={{ margin: '.25rem 0 0', fontSize: '.8125rem', color: '#D32F2F', fontWeight: 600 }}>{error}</p>
      )}
      {saved && (
        <p style={{ margin: '.25rem 0 0', fontSize: '.8125rem', color: T.green, fontWeight: 600 }}>✓ Modo guardado</p>
      )}
      {isPending && (
        <p style={{ margin: '.25rem 0 0', fontSize: '.8125rem', color: T.light }}>Guardando…</p>
      )}

      {/* Action area — changes based on active mode */}
      {mode === 'open' && (
        <div style={{ marginTop: '.875rem', padding: '.875rem 1rem', background: T.white, border: `1px solid ${T.border}`, borderRadius: '.875rem' }}>
          <p style={{ margin: '0 0 .625rem', fontSize: '.8rem', color: T.light, fontWeight: 600 }}>
            Comparte la invitación con RSVP
          </p>
          <a
            href={waInviteUrl}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '.375rem',
              padding: '.625rem 1.125rem', minHeight: 42,
              background: '#25D366', color: '#fff',
              border: 'none', borderRadius: '.75rem',
              fontSize: '.875rem', fontWeight: 700,
              textDecoration: 'none',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
              <path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.558 4.12 1.532 5.852L.072 23.928l6.244-1.636A11.94 11.94 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.885 0-3.648-.51-5.162-1.4l-.37-.22-3.807.997 1.016-3.705-.24-.382A10 10 0 112 12c0 5.514 4.486 10 10 10z"/>
            </svg>
            Enviar invitación con RSVP
          </a>
        </div>
      )}

      {mode === 'passes_only' && (
        <div style={{ marginTop: '.875rem', padding: '.75rem 1rem', background: '#FCF8E3', border: '1px solid #EAD7A3', borderRadius: '.875rem' }}>
          <p style={{ margin: 0, fontSize: '.8125rem', color: T.mid, lineHeight: 1.55 }}>
            <strong>Modo pases activo.</strong> La invitación pública no mostrará el formulario RSVP. Tus invitados confirmarán desde su pase personal. Crea los pases en la sección <strong>&quot;Pases de entrada&quot;</strong> debajo.
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Mode card subcomponent ───────────────────────────────────────────────────
function ModeCard({
  value, current, label, description, icon, disabled, onClick,
}: {
  value: RsvpMode;
  current: RsvpMode;
  label: string;
  description: string;
  icon: string;
  disabled: boolean;
  onClick: (v: RsvpMode) => void;
}) {
  const isActive = value === current;

  return (
    <button
      type="button"
      onClick={() => onClick(value)}
      disabled={disabled || isActive}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
        gap: '.375rem', textAlign: 'left',
        padding: '1rem', width: '100%',
        background: isActive ? T.dark : T.white,
        border: `2px solid ${isActive ? T.gold : T.border}`,
        borderRadius: '1rem',
        cursor: isActive || disabled ? 'default' : 'pointer',
        transition: 'border-color .2s, background .2s',
        outline: 'none',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem', width: '100%' }}>
        <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{icon}</span>
        <span style={{ flex: 1, fontSize: '.9rem', fontWeight: 700, color: isActive ? T.cream : T.dark }}>
          {label}
        </span>
        {/* Radio indicator */}
        <span style={{
          width: 16, height: 16, borderRadius: '50%', flexShrink: 0,
          border: `2px solid ${isActive ? T.gold : T.border}`,
          background: isActive ? T.gold : 'transparent',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {isActive && <span style={{ width: 6, height: 6, borderRadius: '50%', background: T.dark }} />}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '.8rem', color: isActive ? '#EAD7A3' : T.light, lineHeight: 1.5 }}>
        {description}
      </p>
    </button>
  );
}
