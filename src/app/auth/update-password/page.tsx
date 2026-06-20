'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { updatePassword } from '@/app/login/actions';
import type { UpdatePasswordResult } from '@/app/login/actions';

const T = {
  ivory:     '#E8D7B8',
  cream:     '#F1E3C8',
  dark:      '#0D0A07',
  mid:       '#1A1612',
  light:     '#6B4A35',
  gold:      '#C4A962',
  border:    '#EAD7A3',
  white:     '#F1E3C8',
} as const;

const styles = `
  @keyframes up-in {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  .up-card { animation: up-in .6s cubic-bezier(0.65,0,.35,1) .1s both; }
  .up-input {
    width: 100%; padding: .75rem 1.125rem;
    border: 1.5px solid #E5DDD2; border-radius: .625rem;
    font-size: .875rem; color: #0F0C09;
    background: #FFFFFF; box-sizing: border-box; outline: none;
    transition: border-color .18s ease, box-shadow .18s ease;
    font-family: inherit;
  }
  .up-input:focus {
    border-color: #B8966A;
    box-shadow: 0 0 0 3px rgba(184,150,106,0.12);
  }
  .up-input::placeholder { color: #C5B0A0; }
  .up-btn {
    width: 100%; padding: .875rem;
    border: none; border-radius: .625rem;
    font-size: .9375rem; font-weight: 700;
    cursor: pointer; font-family: inherit;
    transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
  }
  .up-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(15,12,9,0.12); }
  .up-btn:disabled { cursor: not-allowed; opacity: .65; }
`;

export default function UpdatePasswordPage() {
  const [state, formAction, pending] = useActionState<UpdatePasswordResult | null, FormData>(
    updatePassword, null,
  );

  return (
    <main style={{
      minHeight: '100dvh',
      background: `radial-gradient(ellipse at 30% 20%, rgba(196,169,98,0.09) 0%, transparent 55%), linear-gradient(160deg, #E8D7B8 0%, #F1E3C8 100%)`,
      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      padding: '2rem 1.25rem',
      fontFamily: 'var(--font-inter, system-ui, sans-serif)',
      position: 'relative',
    }}>
      <div className="paper-noise" />
      <style>{styles}</style>

      <div aria-hidden style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,169,98,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div className="up-card" style={{
        width: '100%', maxWidth: '420px',
        background: T.white, borderRadius: '1.375rem', padding: '2.75rem 2.375rem',
        boxShadow: '0 10px 48px rgba(15,12,9,0.08), 0 2px 0 rgba(229,221,210,1)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '3rem', height: '3px', background: T.gold, borderRadius: '0 0 3px 3px' }} />

        {/* Header */}
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
      </div>
    </main>
  );
}
