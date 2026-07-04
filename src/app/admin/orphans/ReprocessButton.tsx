'use client';

import { useState } from 'react';

/**
 * Reprocesa una sesión de Stripe huérfana vía el recovery existente
 * (/api/admin/recovery), que recrea orden + invitación y envía el email.
 * Confirmación antes de ejecutar, como toda escritura del admin.
 */
export function ReprocessButton({ sessionId, email }: { sessionId: string; email: string | null }) {
  const [state, setState] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg] = useState<string | null>(null);

  async function handleClick() {
    const ok = window.confirm(
      `¿Reprocesar la sesión ${sessionId}?\n\n` +
      `Se recreará la orden + invitación y se enviará el email de acceso` +
      `${email ? ` a ${email}` : ''}. Esta acción es idempotente.`,
    );
    if (!ok) return;

    setState('loading');
    setMsg(null);
    try {
      const res = await fetch('/api/admin/recovery', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ stripe_session_id: sessionId }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok || data.success === false) {
        throw new Error(typeof data.error === 'string' ? data.error : `Error ${res.status}`);
      }
      setState('done');
      setMsg('Reprocesada ✓');
    } catch (e) {
      setState('error');
      setMsg(e instanceof Error ? e.message : 'Error inesperado');
    }
  }

  if (state === 'done') {
    return <span style={{ fontSize: '.75rem', color: '#247A45', fontWeight: 700 }}>{msg}</span>;
  }

  return (
    <span style={{ display: 'inline-flex', flexDirection: 'column', gap: '.25rem', alignItems: 'flex-end' }}>
      <button
        type="button"
        onClick={handleClick}
        disabled={state === 'loading'}
        style={{
          padding: '.35rem .75rem', borderRadius: 8, border: 'none', cursor: state === 'loading' ? 'not-allowed' : 'pointer',
          background: '#1C1713', color: '#FFF7EA', fontSize: '.75rem', fontWeight: 700, whiteSpace: 'nowrap',
          opacity: state === 'loading' ? 0.6 : 1,
        }}
      >
        {state === 'loading' ? 'Reprocesando…' : '↺ Reprocesar'}
      </button>
      {state === 'error' && msg && (
        <span style={{ fontSize: '.7rem', color: '#B43232', maxWidth: 200, textAlign: 'right' }}>{msg}</span>
      )}
    </span>
  );
}
