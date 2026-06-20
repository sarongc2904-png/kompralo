'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { updatePassword } from '@/app/login/actions';
import type { UpdatePasswordResult } from '@/app/login/actions';

const T = {
  dark:   '#0D0A07',
  mid:    '#1A1612',
  light:  '#6B4A35',
  gold:   '#C4A962',
  border: '#EAD7A3',
  white:  '#F1E3C8',
} as const;

const styles = `
  .up-input {
    width: 100%; padding: .75rem 1.125rem;
    border: 1.5px solid #E5DDD2; border-radius: .625rem;
    font-size: .875rem; color: #0F0C09;
    background: #FFFFFF; box-sizing: border-box; outline: none;
    transition: border-color .18s ease, box-shadow .18s ease;
    font-family: inherit;
  }
  .up-input:focus { border-color: #B8966A; box-shadow: 0 0 0 3px rgba(184,150,106,0.12); }
  .up-input::placeholder { color: #C5B0A0; }
  .up-btn {
    width: 100%; padding: .875rem; border: none; border-radius: .625rem;
    font-size: .9375rem; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
  }
  .up-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(15,12,9,0.12); }
  .up-btn:disabled { cursor: not-allowed; opacity: .65; }
`;

export default function UpdatePasswordForm() {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<UpdatePasswordResult | null, FormData>(
    updatePassword, null,
  );

  // Redirect to /cliente after successful password update.
  useEffect(() => {
    if (state?.success) {
      router.push('/cliente');
      router.refresh();
    }
  }, [state?.success, router]);

  // Session lost while on this page — show expired message instead of the form.
  if (state?.error === 'NO_SESSION') {
    return (
      <>
        <style>{styles}</style>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔗</div>
          <p style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.25em', textTransform: 'uppercase', color: T.gold, margin: '0 0 1.125rem' }}>
            KOMPRALO
          </p>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: T.dark, margin: '0 0 .75rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
            Tu enlace expiró
          </h1>
          <p style={{ color: T.mid, fontSize: '.875rem', lineHeight: 1.65, margin: '0 0 1.75rem' }}>
            La sesión ya no es válida. Solicita un nuevo enlace para crear tu contraseña.
          </p>
          <Link href="/login?mode=forgot" style={{
            display: 'inline-block', padding: '.75rem 1.75rem',
            background: T.dark, color: '#F5EDD8',
            borderRadius: '.625rem', fontSize: '.875rem', fontWeight: 700, textDecoration: 'none',
          }}>
            Solicitar nuevo enlace
          </Link>
        </div>
      </>
    );
  }

  return (
    <>
      <style>{styles}</style>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.25em', textTransform: 'uppercase', color: T.gold, margin: '0 0 1.125rem' }}>
          KOMPRALO
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.dark, margin: '0 0 .5rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
          Crea tu nueva contraseña
        </h1>
        <p style={{ color: T.mid, fontSize: '.875rem', margin: 0, lineHeight: 1.6 }}>
          Esta contraseña te servirá para entrar a tu panel cuando quieras.
        </p>
      </div>

      <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor="up-password" style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: T.dark, marginBottom: '.5rem' }}>
            Nueva contraseña
          </label>
          <input id="up-password" name="password" type="password" required autoFocus
            minLength={8} placeholder="Mínimo 8 caracteres" className="up-input" />
        </div>

        <div>
          <label htmlFor="up-confirm" style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: T.dark, marginBottom: '.5rem' }}>
            Confirmar contraseña
          </label>
          <input id="up-confirm" name="confirm" type="password" required
            minLength={8} placeholder="Repite tu contraseña" className="up-input" />
        </div>

        {state?.error && state.error !== 'NO_SESSION' && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#991B1B', fontSize: '.8125rem' }}>
            {state.error}
          </div>
        )}

        {state?.success && (
          <div style={{ background: '#E6F4EA', border: '1px solid #C8E6C9', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#388E3C', fontSize: '.8125rem' }}>
            Contraseña guardada. Redirigiendo a tu panel…
          </div>
        )}

        <button type="submit" disabled={pending || !!state?.success} className="up-btn"
          style={{ background: pending || state?.success ? T.light : T.dark, color: '#F1E3C8' }}>
          {pending ? 'Guardando…' : state?.success ? 'Redirigiendo…' : 'Guardar contraseña'}
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
