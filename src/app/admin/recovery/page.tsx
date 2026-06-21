'use client';

import { useState } from 'react';
import Link from 'next/link';

interface RecoveryResult {
  success: boolean;
  error?: string;
  orderId?: string;
  invitationId?: string;
  emailSentTo?: string;
}

export default function AdminRecoveryPage() {
  const [sessionId, setSessionId] = useState<string>(() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('session') ?? '';
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult]   = useState<RecoveryResult | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    setLoading(true);

    const res = await fetch('/api/admin/recovery', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ stripe_session_id: sessionId.trim() }),
    });

    const data = await res.json();
    setLoading(false);
    setResult(data);
  }

  return (
    <div style={{ maxWidth: 640 }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <Link href="/admin" style={{ fontSize: '.8rem', color: '#8a8580', textDecoration: 'none' }}>← Resumen</Link>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#1a1610', margin: '.5rem 0 .25rem' }}>Recovery de compra</h1>
        <p style={{ fontSize: '.8125rem', color: '#8a8580', margin: 0 }}>
          Ingresa el Stripe Session ID para recuperar una compra pagada que no generó invitación o cuyo email no llegó.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ background: '#fff', border: '1px solid #e5e2dc', borderRadius: 12, padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '.75rem', fontWeight: 700, color: '#4a4742', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: '.375rem' }}>
            Stripe Session ID
          </label>
          <input
            value={sessionId}
            onChange={e => setSessionId(e.target.value)}
            placeholder="cs_live_..."
            required
            style={{ padding: '.625rem .875rem', border: '1px solid #e5e2dc', borderRadius: 8, fontSize: '.875rem', fontFamily: 'monospace', color: '#1a1610', background: '#fafaf8', width: '100%', boxSizing: 'border-box' }}
          />
          <p style={{ margin: '.375rem 0 0', fontSize: '.7rem', color: '#8a8580' }}>
            Debe comenzar con <code>cs_</code>. Solo sesiones con <strong>payment_status=paid</strong> funcionan.
          </p>
        </div>

        <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, padding: '.75rem 1rem', fontSize: '.8rem', color: '#92400e', lineHeight: 1.5 }}>
          <strong>¿Qué hace esto?</strong> Verifica la sesión en Stripe, crea la orden y/o invitación si no existen, y reenvía el email de acceso al cliente. No genera ningún cobro adicional.
        </div>

        <button type="submit" disabled={loading} style={{ padding: '.875rem', background: loading ? '#8a8580' : '#1a1610', color: '#f1e3c8', border: 'none', borderRadius: 10, fontSize: '.9375rem', cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 700 }}>
          {loading ? 'Procesando...' : 'Ejecutar recovery'}
        </button>
      </form>

      {result && (
        <div style={{ marginTop: '1.25rem', padding: '1.25rem 1.5rem', background: result.success ? '#f0fdf4' : '#fef2f2', border: `1px solid ${result.success ? '#bbf7d0' : '#fecaca'}`, borderRadius: 12 }}>
          {result.success ? (
            <>
              <p style={{ margin: '0 0 .75rem', fontWeight: 700, color: '#16a34a', fontSize: '1rem' }}>✓ Recovery completado</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '.375rem', fontSize: '.875rem', color: '#1a1610' }}>
                {result.orderId && <p style={{ margin: 0 }}><strong>Orden:</strong> <code style={{ fontFamily: 'monospace', fontSize: '.8rem' }}>{result.orderId}</code></p>}
                {result.invitationId && (
                  <p style={{ margin: 0 }}>
                    <strong>Invitación:</strong>{' '}
                    <Link href={`/admin/invitations/${result.invitationId}`} style={{ color: '#2563eb' }}>{result.invitationId}</Link>
                  </p>
                )}
                {result.emailSentTo && <p style={{ margin: 0 }}><strong>Email enviado a:</strong> {result.emailSentTo}</p>}
              </div>
            </>
          ) : (
            <>
              <p style={{ margin: '0 0 .5rem', fontWeight: 700, color: '#dc2626', fontSize: '.9375rem' }}>Error en recovery</p>
              <p style={{ margin: 0, fontSize: '.875rem', color: '#dc2626' }}>{result.error}</p>
            </>
          )}
        </div>
      )}
    </div>
  );
}
