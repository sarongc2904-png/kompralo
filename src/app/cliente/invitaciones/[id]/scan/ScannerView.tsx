'use client';

import React, { useState } from 'react';

interface GuestPassResult {
  id: string;
  guestName: string;
  allowedGuests: number;
  status: string;
  checkedInAt?: string;
}

const T = {
  dark:   '#0D0A07',
  light:  '#6B4A35',
  gold:   '#C4A962',
  cream:  '#F1E3C8',
  white:  '#FFFAF3',
  border: '#EAD7A3',
} as const;

const statusLabels: Record<string, string> = {
  pending:   'Sin confirmar',
  confirmed: 'Confirmado',
  declined:  'Declinado',
  used:      'Usado',
};
const statusColors: Record<string, string> = {
  pending:   '#8A6D3B',
  confirmed: '#238636',
  declined:  '#D32F2F',
  used:      '#555',
};
const statusBg: Record<string, string> = {
  pending:   '#FCF8E3',
  confirmed: '#E6F4EA',
  declined:  '#FCE8E6',
  used:      '#F0F0F0',
};

function formatDateTime(iso: string): string {
  try {
    return new Intl.DateTimeFormat('es-MX', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(iso));
  } catch { return iso; }
}

interface Props {
  invitationId: string;
}

type UIState = 'idle' | 'searching' | 'found' | 'checking-in' | 'done' | 'already-in' | 'not-found' | 'error';

export default function ScannerView({ invitationId }: Props) {
  const [input,       setInput]       = useState('');
  const [uiState,     setUiState]     = useState<UIState>('idle');
  const [pass,        setPass]        = useState<GuestPassResult | null>(null);
  const [errorMsg,    setErrorMsg]    = useState('');
  const [checkedInAt, setCheckedInAt] = useState<string | null>(null);

  function extractToken(raw: string): string {
    const trimmed = raw.trim();
    if (trimmed.includes('/pass/')) {
      return trimmed.split('/pass/').pop()?.split('?')[0].trim() ?? trimmed;
    }
    return trimmed;
  }

  async function handleSearch() {
    const token = extractToken(input);
    if (!token) return;
    setUiState('searching');
    setPass(null);
    setErrorMsg('');
    try {
      const res = await fetch(
        `/api/invitations/${invitationId}/guest-passes/by-token?token=${encodeURIComponent(token)}`,
      );
      const json = await res.json() as { pass?: GuestPassResult; error?: string };
      if (!res.ok || !json.pass) {
        setErrorMsg(res.status === 404 ? 'No se encontró ningún pase con ese código.' : (json.error ?? 'Error al buscar el pase.'));
        setUiState('not-found');
        return;
      }
      setPass(json.pass);
      setUiState(json.pass.checkedInAt ? 'already-in' : 'found');
      if (json.pass.checkedInAt) setCheckedInAt(json.pass.checkedInAt);
    } catch {
      setErrorMsg('Error de red. Verifica tu conexión.');
      setUiState('error');
    }
  }

  async function handleCheckIn() {
    if (!pass) return;
    setUiState('checking-in');
    try {
      const res = await fetch(
        `/api/invitations/${invitationId}/guest-passes/${pass.id}/checkin`,
        { method: 'POST' },
      );
      const json = await res.json() as { pass?: GuestPassResult; alreadyCheckedIn?: boolean; error?: string };
      if (!res.ok) {
        setErrorMsg(json.error ?? 'Error al registrar la entrada.');
        setUiState('error');
        return;
      }
      if (json.alreadyCheckedIn) {
        setCheckedInAt(json.pass?.checkedInAt ?? new Date().toISOString());
        setUiState('already-in');
        return;
      }
      setCheckedInAt(json.pass?.checkedInAt ?? new Date().toISOString());
      setUiState('done');
    } catch {
      setErrorMsg('Error de red. Verifica tu conexión.');
      setUiState('error');
    }
  }

  function reset() {
    setInput('');
    setPass(null);
    setErrorMsg('');
    setCheckedInAt(null);
    setUiState('idle');
  }

  const searching   = uiState === 'searching';
  const checkingIn  = uiState === 'checking-in';

  return (
    <div style={{ maxWidth: '480px', margin: '0 auto', padding: '1.5rem 1rem 3rem' }}>

      {/* ── Search box ── */}
      <div style={{
        background: T.white, border: `1px solid ${T.border}`,
        borderRadius: '1.25rem', padding: '1.25rem',
        marginBottom: '1.25rem',
      }}>
        <p style={{ margin: '0 0 .75rem', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: T.gold }}>
          Buscar pase
        </p>
        <p style={{ margin: '0 0 .875rem', fontSize: '.875rem', color: T.light, lineHeight: 1.55 }}>
          Pega la URL o el código del pase del invitado.
        </p>
        <textarea
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void handleSearch(); } }}
          placeholder="https://kompralo.vercel.app/pass/abc123… o solo el token"
          rows={3}
          style={{
            width: '100%', padding: '.75rem .875rem',
            background: T.cream, border: `1px solid ${T.border}`,
            borderRadius: '.75rem', fontSize: '.875rem', color: T.dark,
            outline: 'none', resize: 'none', boxSizing: 'border-box',
            lineHeight: 1.5, fontFamily: 'inherit',
          }}
        />
        <button
          onClick={() => void handleSearch()}
          disabled={!input.trim() || searching}
          style={{
            marginTop: '.75rem', width: '100%', padding: '.75rem',
            background: (!input.trim() || searching) ? T.border : T.dark,
            color: T.cream, border: 'none', borderRadius: '.75rem',
            fontSize: '.9375rem', fontWeight: 700, cursor: (!input.trim() || searching) ? 'not-allowed' : 'pointer',
          }}
        >
          {searching ? 'Buscando…' : 'Buscar pase'}
        </button>
      </div>

      {/* ── Not found / error ── */}
      {(uiState === 'not-found' || uiState === 'error') && (
        <div style={{
          background: '#FCE8E6', border: '1px solid #F5C6C6',
          borderRadius: '1.25rem', padding: '1.25rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '1.75rem', marginBottom: '.5rem' }}>❌</div>
          <p style={{ margin: '0 0 .25rem', fontWeight: 700, color: '#D32F2F', fontSize: '.9375rem' }}>
            {uiState === 'not-found' ? 'Pase no encontrado' : 'Error'}
          </p>
          <p style={{ margin: '0 0 1rem', fontSize: '.8125rem', color: '#9F2A2A', lineHeight: 1.5 }}>{errorMsg}</p>
          <button onClick={reset} style={secondaryBtn}>Intentar de nuevo</button>
        </div>
      )}

      {/* ── Pass found — ready to check in ── */}
      {(uiState === 'found' || uiState === 'checking-in') && pass && (
        <div style={{
          background: T.white, border: `1px solid ${T.border}`,
          borderRadius: '1.25rem', padding: '1.25rem',
        }}>
          <p style={{ margin: '0 0 1rem', fontSize: '.75rem', fontWeight: 800, letterSpacing: '.15em', textTransform: 'uppercase', color: T.gold }}>
            Pase encontrado
          </p>
          <PassInfo pass={pass} />
          <button
            onClick={() => void handleCheckIn()}
            disabled={checkingIn}
            style={{
              marginTop: '1.25rem', width: '100%', padding: '.875rem',
              background: checkingIn ? T.border : '#238636',
              color: '#fff', border: 'none', borderRadius: '.75rem',
              fontSize: '1rem', fontWeight: 800,
              cursor: checkingIn ? 'not-allowed' : 'pointer',
            }}
          >
            {checkingIn ? 'Registrando…' : '✓ Marcar entrada'}
          </button>
          <button onClick={reset} style={{ ...secondaryBtn, marginTop: '.5rem', width: '100%' }}>
            Cancelar
          </button>
        </div>
      )}

      {/* ── Success ── */}
      {uiState === 'done' && pass && (
        <div style={{
          background: '#E6F4EA', border: '1px solid #A7D7B0',
          borderRadius: '1.25rem', padding: '1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '.625rem' }}>✅</div>
          <p style={{ margin: '0 0 .25rem', fontWeight: 800, color: '#238636', fontSize: '1.0625rem' }}>
            Entrada registrada
          </p>
          <p style={{ margin: '0 0 .125rem', fontSize: '1rem', fontWeight: 700, color: T.dark }}>
            {pass.guestName}
          </p>
          <p style={{ margin: '0 0 1rem', fontSize: '.875rem', color: T.light }}>
            {pass.allowedGuests} {pass.allowedGuests === 1 ? 'persona' : 'personas'}
          </p>
          {checkedInAt && (
            <p style={{ margin: '0 0 1.25rem', fontSize: '.75rem', color: '#238636', fontWeight: 600 }}>
              {formatDateTime(checkedInAt)}
            </p>
          )}
          <button onClick={reset} style={{
            padding: '.75rem 1.5rem', background: T.dark, color: T.cream,
            border: 'none', borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700, cursor: 'pointer',
          }}>
            Escanear otro pase
          </button>
        </div>
      )}

      {/* ── Already checked in ── */}
      {uiState === 'already-in' && pass && (
        <div style={{
          background: '#FCF8E3', border: '1px solid #EAD7A3',
          borderRadius: '1.25rem', padding: '1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '2rem', marginBottom: '.625rem' }}>⚠️</div>
          <p style={{ margin: '0 0 .25rem', fontWeight: 800, color: '#8A6D3B', fontSize: '1.0625rem' }}>
            Este invitado ya ingresó
          </p>
          <p style={{ margin: '0 0 .125rem', fontSize: '1rem', fontWeight: 700, color: T.dark }}>
            {pass.guestName}
          </p>
          <p style={{ margin: '0 0 .125rem', fontSize: '.875rem', color: T.light }}>
            {pass.allowedGuests} {pass.allowedGuests === 1 ? 'persona' : 'personas'}
          </p>
          {checkedInAt && (
            <p style={{ margin: '0 0 1.25rem', fontSize: '.75rem', color: '#8A6D3B', fontWeight: 600 }}>
              Ingresó el {formatDateTime(checkedInAt)}
            </p>
          )}
          <button onClick={reset} style={{
            padding: '.75rem 1.5rem', background: T.dark, color: T.cream,
            border: 'none', borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700, cursor: 'pointer',
          }}>
            Escanear otro pase
          </button>
        </div>
      )}
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────

function PassInfo({ pass }: { pass: GuestPassResult }) {
  return (
    <div style={{
      background: '#FFFAF3', border: `1px solid #EAD7A3`,
      borderRadius: '1rem', padding: '1rem',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem', marginBottom: '.375rem' }}>
        <p style={{ margin: 0, fontWeight: 700, color: T.dark, fontSize: '1.0625rem' }}>{pass.guestName}</p>
        <span style={{
          padding: '.2rem .625rem', borderRadius: '2rem', flexShrink: 0,
          fontSize: '.6875rem', fontWeight: 700, whiteSpace: 'nowrap',
          color: statusColors[pass.status] ?? T.light,
          background: statusBg[pass.status] ?? T.cream,
        }}>
          {statusLabels[pass.status] ?? pass.status}
        </span>
      </div>
      <p style={{ margin: 0, fontSize: '.875rem', color: T.light }}>
        {pass.allowedGuests} {pass.allowedGuests === 1 ? 'persona permitida' : 'personas permitidas'}
      </p>
    </div>
  );
}

const T_ref = T;
const secondaryBtn: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
  padding: '.625rem 1.25rem',
  background: T_ref.white, border: `1px solid ${T_ref.border}`,
  borderRadius: '.75rem', fontSize: '.875rem', fontWeight: 700,
  cursor: 'pointer', color: T_ref.dark,
};
