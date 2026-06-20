'use client';

import { useActionState } from 'react';
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
  const [state, formAction, pending] = useActionState<UpdatePasswordResult | null, FormData>(
    updatePassword, null,
  );

  return (
    <>
      <style>{styles}</style>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.25em', textTransform: 'uppercase', color: T.gold, margin: '0 0 1.125rem' }}>
          KOMPRALO
        </p>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.dark, margin: '0 0 .5rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
          Crea tu contraseña
        </h1>
        <p style={{ color: T.mid, fontSize: '.875rem', margin: 0, lineHeight: 1.6 }}>
          Crea una contraseña para acceder a tu invitación cuando lo necesites.
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

        {state?.error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#991B1B', fontSize: '.8125rem' }}>
            {state.error}
          </div>
        )}

        <button type="submit" disabled={pending} className="up-btn"
          style={{ background: pending ? T.light : T.dark, color: '#F1E3C8' }}>
          {pending ? 'Guardando…' : 'Guardar contraseña y entrar'}
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
