'use client';

import { useState } from 'react';

const box: React.CSSProperties = {
  background: '#FFFBF4', border: '1px solid #E5D2A8', borderRadius: 12, padding: '1rem',
};
const label: React.CSSProperties = {
  fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.1em', color: '#7A6A5B', fontWeight: 700, margin: '0 0 .625rem',
};
const btn: React.CSSProperties = {
  padding: '.5rem .875rem', borderRadius: 8, border: 'none', cursor: 'pointer',
  background: '#1C1713', color: '#FFF7EA', fontSize: '.8rem', fontWeight: 700, width: '100%',
};
const input: React.CSSProperties = {
  width: '100%', padding: '.5rem .625rem', borderRadius: 8, border: '1px solid #E5D2A8',
  background: '#FAF3E6', color: '#241A14', fontSize: '.8rem', boxSizing: 'border-box',
};

// ─── Corregir customer_email ────────────────────────────────────────────────
function EmailFixer({ orderId, currentEmail, hasInvitation }: { orderId: string; currentEmail: string | null; hasInvitation: boolean }) {
  const [email, setEmail]   = useState(currentEmail ?? '');
  const [state, setState]   = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const [msg, setMsg]       = useState<string | null>(null);

  async function save() {
    const next = email.trim();
    if (!next || next.toLowerCase() === (currentEmail ?? '').toLowerCase()) return;
    const ok = window.confirm(
      `¿Cambiar el correo de la orden a "${next}"?` +
      (hasInvitation ? '\n\nSe propagará también a la invitación vinculada.' : ''),
    );
    if (!ok) return;
    setState('loading'); setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_email: next }),
      });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok) throw new Error(typeof data.error === 'string' ? data.error : `Error ${res.status}`);
      setState('done'); setMsg('Correo actualizado ✓');
    } catch (e) {
      setState('error'); setMsg(e instanceof Error ? e.message : 'Error inesperado');
    }
  }

  return (
    <div style={box}>
      <p style={label}>Corregir correo del cliente</p>
      <input style={input} type="email" value={email} onChange={(e) => { setEmail(e.target.value); setState('idle'); }} placeholder="correo@ejemplo.com" />
      <button type="button" style={{ ...btn, marginTop: '.5rem', opacity: state === 'loading' ? 0.6 : 1 }} disabled={state === 'loading'} onClick={save}>
        {state === 'loading' ? 'Guardando…' : 'Guardar correo'}
      </button>
      {msg && <p style={{ margin: '.5rem 0 0', fontSize: '.75rem', fontWeight: 600, color: state === 'error' ? '#B43232' : '#247A45' }}>{msg}</p>}
    </div>
  );
}

// ─── Copiar link de acceso nuevo (sin email) ────────────────────────────────
function AccessLinkCopier({ orderId }: { orderId: string }) {
  const [state, setState] = useState<'idle' | 'loading' | 'copied' | 'error'>('idle');
  const [msg, setMsg]     = useState<string | null>(null);

  async function generate() {
    setState('loading'); setMsg(null);
    try {
      const res = await fetch(`/api/admin/orders/${orderId}/access-link`, { method: 'POST' });
      const data = await res.json() as Record<string, unknown>;
      if (!res.ok || typeof data.url !== 'string') throw new Error(typeof data.error === 'string' ? data.error : `Error ${res.status}`);
      await navigator.clipboard.writeText(data.url);
      setState('copied'); setMsg('Link copiado al portapapeles ✓ (válido 7 días, sin email)');
    } catch (e) {
      setState('error'); setMsg(e instanceof Error ? e.message : 'Error inesperado');
    }
  }

  return (
    <div style={box}>
      <p style={label}>Link de acceso</p>
      <button type="button" style={{ ...btn, opacity: state === 'loading' ? 0.6 : 1 }} disabled={state === 'loading'} onClick={generate}>
        {state === 'loading' ? 'Generando…' : state === 'copied' ? '✓ Copiado' : '📋 Copiar link de acceso nuevo'}
      </button>
      {msg && <p style={{ margin: '.5rem 0 0', fontSize: '.72rem', fontWeight: 600, color: state === 'error' ? '#B43232' : '#247A45' }}>{msg}</p>}
    </div>
  );
}

export function OrderActions({ orderId, currentEmail, hasInvitation }: { orderId: string; currentEmail: string | null; hasInvitation: boolean }) {
  return (
    <>
      <EmailFixer orderId={orderId} currentEmail={currentEmail} hasInvitation={hasInvitation} />
      {hasInvitation && <AccessLinkCopier orderId={orderId} />}
    </>
  );
}
