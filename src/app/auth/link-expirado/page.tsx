'use client';

/**
 * /auth/link-expirado — landing for expired/used auth links.
 * Lets the customer request a fresh password-setup link (rate limited
 * server-side to 3/hour per email). Email may be prefilled via ?email=.
 */

import { Suspense, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { resendPasswordLink } from '@/app/actions/resend-password-link';

const T = {
  dark:   '#0D0A07',
  mid:    '#1A1612',
  light:  '#6B4A35',
  gold:   '#C4A962',
  border: '#EAD7A3',
  cream:  '#F1E3C8',
} as const;

function ExpiredLinkForm() {
  const searchParams = useSearchParams();
  const [email, setEmail]     = useState(searchParams.get('email') ?? '');
  const [pending, setPending] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setPending(true);
    try {
      const result = await resendPasswordLink(email);
      if (result.success) {
        setSent(true);
      } else {
        setError(result.error ?? 'No se pudo enviar el enlace. Intenta de nuevo.');
      }
    } catch {
      setError('Error de red. Intenta de nuevo.');
    }
    setPending(false);
  }

  if (sent) {
    return (
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📬</div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: T.dark, margin: '0 0 .75rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
          Revisa tu correo
        </h1>
        <p style={{ color: T.mid, fontSize: '.875rem', lineHeight: 1.65, margin: '0 0 1.5rem' }}>
          Si <strong>{email}</strong> está registrado, te enviamos un nuevo enlace.
          Revisa también tu carpeta de spam.
        </p>
        <p style={{ margin: 0, fontSize: '.8125rem', color: T.light }}>
          ¿Ya tienes contraseña?{' '}
          <Link href="/login" style={{ color: T.gold, fontWeight: 700, textDecoration: 'none' }}>
            Iniciar sesión →
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <div style={{ textAlign: 'center', marginBottom: '1.75rem' }}>
        <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔗</div>
        <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: T.dark, margin: '0 0 .75rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
          Tu enlace expiró
        </h1>
        <p style={{ color: T.mid, fontSize: '.875rem', lineHeight: 1.65, margin: 0 }}>
          El enlace ya expiró o fue utilizado. Ingresa tu correo y te enviamos uno nuevo.
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
          {pending ? 'Enviando…' : 'Reenviar enlace'}
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
  );
}

export default function LinkExpiradoPage() {
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
          position: 'relative',
        }}
      >
        <p style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.25em', textTransform: 'uppercase', color: T.gold, margin: '0 0 1.125rem', textAlign: 'center' }}>
          KOMPRALO
        </p>
        <Suspense fallback={null}>
          <ExpiredLinkForm />
        </Suspense>
      </div>
    </main>
  );
}
