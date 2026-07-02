'use client';

/**
 * /recuperar-acceso — self-service access recovery for customers.
 * Enter the purchase email → server action mints fresh 7-day access tokens
 * for every paid invitation and emails the links. The response is identical
 * whether or not the email has purchases (anti-enumeration).
 */

import { useState } from 'react';
import Link from 'next/link';
import { recoverAccess } from '@/app/actions/recover-access';

const T = {
  dark:   '#0D0A07',
  mid:    '#1A1612',
  light:  '#6B4A35',
  gold:   '#C4A962',
  border: '#EAD7A3',
  cream:  '#F1E3C8',
} as const;

export default function RecuperarAccesoPage() {
  const [email, setEmail]     = useState('');
  const [pending, setPending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const result = await recoverAccess(email);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error ?? 'No se pudo procesar la solicitud. Intenta de nuevo.');
      }
    } catch {
      setError('Error de red. Intenta de nuevo.');
    }
    setPending(false);
  }

  return (
    <main
      style={{
        minHeight: '100dvh',
        background: 'radial-gradient(ellipse at 30% 20%, rgba(196,169,98,0.09) 0%, transparent 55%), linear-gradient(160deg, #E8D7B8 0%, #F1E3C8 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: '2rem 1.25rem',
        fontFamily: 'var(--font-inter, system-ui, sans-serif)',
      }}
    >
      <div
        style={{
          width: '100%', maxWidth: '420px',
          background: T.cream, borderRadius: '1.375rem', padding: '2.75rem 2.375rem',
          boxShadow: '0 10px 48px rgba(15,12,9,0.08)',
        }}
      >
        <p style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.25em', textTransform: 'uppercase', color: T.gold, margin: '0 0 1.125rem', textAlign: 'center' }}>
          KOMPRALO
        </p>

        {sent ? (
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: T.dark, margin: '0 0 .75rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
              Revisa tu correo
            </h1>
            <p style={{ color: T.mid, fontSize: '.875rem', lineHeight: 1.65, margin: '0 0 1.5rem' }}>
              Si <strong>{email}</strong> tiene una compra registrada, te enviamos un
              enlace de acceso válido por 7 días. Revisa también tu carpeta de spam.
            </p>
            <p style={{ margin: 0, fontSize: '.8125rem', color: T.light }}>
              ¿Ya tienes contraseña?{' '}
              <Link href="/login" style={{ color: T.gold, fontWeight: 700, textDecoration: 'none' }}>
                Iniciar sesión →
              </Link>
            </p>
          </div>
        ) : (
          <>
            <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔑</div>
              <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: T.dark, margin: '0 0 .75rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
                Recupera tu acceso
              </h1>
              <p style={{ color: T.mid, fontSize: '.875rem', lineHeight: 1.65, margin: 0 }}>
                Ingresa el correo con el que compraste tu invitación y te enviaremos
                un enlace nuevo para seguir editando — sin contraseña.
              </p>
            </div>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <input
                type="email"
                required
                autoFocus
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%', padding: '.75rem 1.125rem', boxSizing: 'border-box',
                  border: '1.5px solid #E5DDD2', borderRadius: '.625rem',
                  fontSize: '.875rem', color: '#0F0C09', background: '#FFFFFF',
                  outline: 'none', fontFamily: 'inherit',
                }}
              />

              {error && (
                <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#991B1B', fontSize: '.8125rem' }}>
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={pending}
                style={{
                  width: '100%', padding: '.875rem', border: 'none', borderRadius: '.625rem',
                  fontSize: '.9375rem', fontWeight: 700, fontFamily: 'inherit',
                  cursor: pending ? 'not-allowed' : 'pointer', opacity: pending ? 0.65 : 1,
                  background: T.dark, color: T.cream,
                }}
              >
                {pending ? 'Enviando…' : 'Enviarme el enlace de acceso'}
              </button>
            </form>

            <div style={{ marginTop: '1.75rem', paddingTop: '1.375rem', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
              <p style={{ fontSize: '.78rem', color: T.light, margin: 0 }}>
                ¿Ya tienes contraseña?{' '}
                <Link href="/login" style={{ color: T.gold, fontWeight: 700, textDecoration: 'none' }}>
                  Iniciar sesión →
                </Link>
              </p>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
