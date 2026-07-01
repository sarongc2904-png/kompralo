'use client';

/**
 * /auth/set-password — universal password-setup landing page.
 *
 * Supabase invite and recovery links send the user here after clicking the
 * email button. Depending on the Supabase project's auth configuration the
 * redirect may carry:
 *
 *   • PKCE code:  ?code=XXX  (newer Supabase PKCE flow)
 *   • OTP hash:   ?token_hash=XXX&type=invite|recovery  (OTP / admin generateLink)
 *   • Implicit:   #access_token=XXX&refresh_token=YYY  (legacy implicit flow)
 *
 * This client component detects whichever case is present, establishes the
 * Supabase session, and then shows the "set your password" form.
 *
 * After the password is saved the user is redirected to /cliente where they
 * can see their invitation.
 */

import { useEffect, useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';
import Link from 'next/link';
import { Eye, EyeOff } from 'lucide-react';

// ─── Styles ──────────────────────────────────────────────────────────────────

const T = {
  dark:   '#0D0A07',
  mid:    '#1A1612',
  light:  '#6B4A35',
  gold:   '#C4A962',
  border: '#EAD7A3',
  cream:  '#F1E3C8',
} as const;

const inputCss = `
  .sp-input {
    width: 100%; padding: .75rem 1.125rem;
    border: 1.5px solid #E5DDD2; border-radius: .625rem;
    font-size: .875rem; color: #0F0C09;
    background: #FFFFFF; box-sizing: border-box; outline: none;
    transition: border-color .18s ease, box-shadow .18s ease;
    font-family: inherit;
  }
  .sp-input:focus { border-color: #B8966A; box-shadow: 0 0 0 3px rgba(184,150,106,0.12); }
  .sp-input::placeholder { color: #C5B0A0; }
  .sp-password-wrap { position: relative; }
  .sp-password-wrap .sp-input { padding-right: 3rem; }
  .sp-password-toggle {
    position: absolute; right: .85rem; top: 50%; transform: translateY(-50%);
    border: 0; background: transparent; color: #6B4A35; cursor: pointer;
    display: inline-flex; align-items: center; justify-content: center;
    padding: .25rem;
  }
  .sp-btn {
    width: 100%; padding: .875rem; border: none; border-radius: .625rem;
    font-size: .9375rem; font-weight: 700; cursor: pointer; font-family: inherit;
    transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
  }
  .sp-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 8px 24px rgba(15,12,9,0.12); }
  .sp-btn:disabled { cursor: not-allowed; opacity: .65; }
`;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Brand() {
  return (
    <p style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.25em', textTransform: 'uppercase', color: T.gold, margin: '0 0 1.125rem', textAlign: 'center' }}>
      KOMPRALO
    </p>
  );
}

function Loading() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem 0' }}>
      <Brand />
      <p style={{ color: T.mid, fontSize: '.875rem' }}>Verificando enlace…</p>
    </div>
  );
}

function Expired() {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔗</div>
      <Brand />
      <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: T.dark, margin: '0 0 .75rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
        Tu enlace expiró
      </h1>
      <p style={{ color: T.mid, fontSize: '.875rem', lineHeight: 1.65, margin: '0 0 1.75rem' }}>
        El enlace para crear tu contraseña ya expiró o fue utilizado.
        Puedes solicitar uno nuevo a continuación.
      </p>
      <Link
        href="/login?mode=forgot"
        style={{
          display: 'inline-block', padding: '.75rem 1.75rem',
          background: T.dark, color: '#F5EDD8',
          borderRadius: '.625rem', fontSize: '.875rem', fontWeight: 700, textDecoration: 'none',
          marginBottom: '1.25rem',
        }}
      >
        Solicitar nuevo enlace
      </Link>
      <p style={{ margin: 0, fontSize: '.8125rem', color: T.light }}>
        ¿Ya tienes contraseña?{' '}
        <Link href="/login" style={{ color: T.gold, fontWeight: 700, textDecoration: 'none' }}>
          Iniciar sesión →
        </Link>
      </p>
    </div>
  );
}

function PasswordForm({ supabase }: { supabase: SupabaseClient }) {
  const [password, setPassword]     = useState('');
  const [confirm, setConfirm]       = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm]   = useState(false);
  const [pending, setPending]       = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');

    if (password.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres.');
      return;
    }
    if (password !== confirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    setPending(true);
    const { error: updateErr } = await supabase.auth.updateUser({ password });
    setPending(false);

    if (updateErr) {
      setError('No pudimos guardar tu contraseña. Intenta nuevamente o solicita un nuevo enlace.');
      return;
    }

    setSuccess(true);
    // Redirect after short delay so user sees the confirmation.
    setTimeout(() => { window.location.href = '/cliente'; }, 1200);
  }

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '.75rem' }}>✅</div>
        <Brand />
        <p style={{ fontWeight: 700, color: '#16a34a', fontSize: '1rem', margin: '0 0 .5rem' }}>
          ¡Contraseña creada!
        </p>
        <p style={{ color: T.mid, fontSize: '.875rem' }}>Redirigiendo a tu panel…</p>
      </div>
    );
  }

  return (
    <>
      <style>{inputCss}</style>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <Brand />
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: T.dark, margin: '0 0 .5rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
          Crea tu contraseña
        </h1>
        <p style={{ color: T.mid, fontSize: '.875rem', margin: 0, lineHeight: 1.6 }}>
          Esta contraseña te servirá para entrar a tu panel cuando quieras.
        </p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div>
          <label htmlFor="sp-pw" style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: T.dark, marginBottom: '.5rem' }}>
            Nueva contraseña
          </label>
          <div className="sp-password-wrap">
            <input
              id="sp-pw"
              type={showPassword ? 'text' : 'password'}
              required
              autoFocus
              minLength={8}
              placeholder="Mínimo 8 caracteres"
              className="sp-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
            <button
              type="button"
              className="sp-password-toggle"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showPassword}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label htmlFor="sp-confirm" style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: T.dark, marginBottom: '.5rem' }}>
            Confirmar contraseña
          </label>
          <div className="sp-password-wrap">
            <input
              id="sp-confirm"
              type={showConfirm ? 'text' : 'password'}
              required
              minLength={8}
              placeholder="Repite tu contraseña"
              className="sp-input"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
            />
            <button
              type="button"
              className="sp-password-toggle"
              onClick={() => setShowConfirm((value) => !value)}
              aria-label={showConfirm ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              aria-pressed={showConfirm}
            >
              {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {error && (
          <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#991B1B', fontSize: '.8125rem' }}>
            {error}
          </div>
        )}

        <button type="submit" disabled={pending} className="sp-btn"
          style={{ background: pending ? T.light : T.dark, color: T.cream }}>
          {pending ? 'Guardando…' : 'Crear contraseña'}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

type Phase = 'loading' | 'form' | 'expired';

export default function SetPasswordPage() {
  const [phase, setPhase]         = useState<Phase>('loading');
  const [client, setClient]       = useState<SupabaseClient | null>(null);

  useEffect(() => {
    const url     = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

    const supabase = createBrowserClient(url, anonKey);

    async function boot() {
      const hash   = window.location.hash;
      const params = new URLSearchParams(window.location.search);

      // ── Case 1: Implicit flow — tokens in hash fragment ──────────────────
      if (hash.includes('access_token')) {
        const hashParams    = new URLSearchParams(hash.replace(/^#/, ''));
        const accessToken   = hashParams.get('access_token')  ?? '';
        const refreshToken  = hashParams.get('refresh_token') ?? '';

        if (accessToken && refreshToken) {
          const { data, error } = await supabase.auth.setSession({ access_token: accessToken, refresh_token: refreshToken });
          if (!error && data.session) {
            // Clean hash from URL without reloading the page.
            window.history.replaceState(null, '', window.location.pathname + window.location.search);
            setClient(supabase);
            setPhase('form');
            return;
          }
        }
        setPhase('expired');
        return;
      }

      // ── Case 2: PKCE code ─────────────────────────────────────────────────
      const code = params.get('code');
      if (code) {
        const { data, error } = await supabase.auth.exchangeCodeForSession(code);
        if (!error && data.session) {
          window.history.replaceState(null, '', window.location.pathname);
          setClient(supabase);
          setPhase('form');
          return;
        }
        setPhase('expired');
        return;
      }

      // ── Case 3: OTP token_hash (admin generateLink) ───────────────────────
      const tokenHash = params.get('token_hash');
      const type      = params.get('type') as 'invite' | 'recovery' | 'email' | 'signup' | null;
      if (tokenHash && type) {
        const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });
        if (!error && data.session) {
          window.history.replaceState(null, '', window.location.pathname);
          setClient(supabase);
          setPhase('form');
          return;
        }
        setPhase('expired');
        return;
      }

      // ── Case 4: Already have a session (e.g. redirected from /auth/callback) ──
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setClient(supabase);
        setPhase('form');
        return;
      }

      // No usable auth params — link is expired or invalid.
      setPhase('expired');
    }

    void boot();
  }, []);

  const pageStyle: React.CSSProperties = {
    minHeight: '100dvh',
    background: 'radial-gradient(ellipse at 30% 20%, rgba(196,169,98,0.09) 0%, transparent 55%), linear-gradient(160deg, #E8D7B8 0%, #F1E3C8 100%)',
    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
    padding: '2rem 1.25rem',
    fontFamily: 'var(--font-inter, system-ui, sans-serif)',
    position: 'relative',
  };

  const cardStyle: React.CSSProperties = {
    width: '100%', maxWidth: '420px',
    background: T.cream, borderRadius: '1.375rem', padding: '2.75rem 2.375rem',
    boxShadow: '0 10px 48px rgba(15,12,9,0.08), 0 2px 0 rgba(229,221,210,1)',
    position: 'relative',
  };

  return (
    <main style={pageStyle}>
      <div className="paper-noise" />
      <div aria-hidden style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,169,98,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={cardStyle}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '3rem', height: '3px', background: T.gold, borderRadius: '0 0 3px 3px' }} />

        {phase === 'loading' && <Loading />}
        {phase === 'expired' && <Expired />}
        {phase === 'form' && client && <PasswordForm supabase={client} />}
      </div>
    </main>
  );
}
