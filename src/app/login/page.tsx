'use client';

import { useActionState, useState, useEffect, useRef, type FormEvent } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { requestPasswordReset, sendMagicLink } from './actions';
import type { ResetPasswordResult, SendMagicLinkResult } from './actions';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';

const T = {
  ivory:     '#E8D7B8',
  cream:     '#F1E3C8',
  dark:      '#0D0A07',
  mid:       '#1A1612',
  light:     '#6B4A35',
  gold:      '#C4A962',
  champagne: '#EAD7A3',
  white:     '#F1E3C8',
  border:    '#EAD7A3',
} as const;

const styles = `
  @keyframes lg2-in {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .lg2-card { animation:none !important; }
  }
  .lg2-card { animation: lg2-in .6s cubic-bezier(0.65,0,.35,1) .1s both; }

  .lg2-input {
    width: 100%; padding: .75rem 1.125rem;
    border: 1.5px solid #E5DDD2;
    border-radius: .625rem;
    font-size: .875rem; color: #0F0C09;
    background: #FFFFFF;
    box-sizing: border-box; outline: none;
    transition: border-color .18s ease, box-shadow .18s ease;
    font-family: inherit;
  }
  .lg2-input:focus {
    border-color: #B8966A;
    box-shadow: 0 0 0 3px rgba(184,150,106,0.12);
  }
  .lg2-input::placeholder { color: #C5B0A0; }

  .lg2-btn {
    width: 100%; padding: .875rem;
    border: none; border-radius: .625rem;
    font-size: .9375rem; font-weight: 700;
    cursor: pointer; font-family: inherit;
    transition: transform .15s ease, box-shadow .15s ease, opacity .15s ease;
  }
  .lg2-btn:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(15,12,9,0.12);
  }
  .lg2-btn:active:not(:disabled) { transform: translateY(0); }
  .lg2-btn:disabled { cursor: not-allowed; opacity: .65; }

  .lg2-link {
    background: none; border: none; cursor: pointer;
    font-family: inherit; padding: 0;
    transition: color .18s ease;
  }
  .lg2-link:hover { color: #B8966A !important; }
`;

type Mode = 'password' | 'forgot' | 'magic';

// ─── Password login form ──────────────────────────────────────────────────────

function PasswordForm({ redirectParam, emailParam, onMode, onInteract }: {
  redirectParam: string;
  emailParam: string;
  onMode: (m: Mode) => void;
  onInteract: () => void;
}) {
  const [error,       setError]       = useState('');
  const [pending,     setPending]     = useState(false);
  const [success,     setSuccess]     = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd       = new FormData(e.currentTarget);
    const email    = ((fd.get('email')    as string | null) ?? '').trim();
    const password =  (fd.get('password') as string | null) ?? '';
    if (!email || !password) return;

    setPending(true);
    setError('');

    const supabase = createSupabaseBrowserClient();
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });

    if (authError) {
      const msg = authError.message.includes('Invalid login credentials')
        ? 'Correo o contraseña incorrectos.'
        : authError.message;
      setError(msg);
      setPending(false);
      return;
    }

    setSuccess(true);
    const safeRedirect =
      redirectParam.startsWith('/') &&
      !redirectParam.startsWith('//') &&
      !redirectParam.includes('http://') &&
      !redirectParam.includes('https://')
        ? redirectParam
        : '/cliente';
    window.location.assign(safeRedirect);
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div>
        <label htmlFor="pw-email" style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: T.dark, marginBottom: '.5rem' }}>
          Correo electrónico
        </label>
        <input id="pw-email" name="email" type="email" defaultValue={emailParam} required autoFocus
          placeholder="correo@ejemplo.com" className="lg2-input"
          onFocus={onInteract} />
      </div>

      <div>
        <label htmlFor="pw-password" style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: T.dark, marginBottom: '.5rem' }}>
          Contraseña
        </label>
        <div style={{ position: 'relative' }}>
          <input id="pw-password" name="password" type={showPassword ? 'text' : 'password'} required
            placeholder="Tu contraseña" className="lg2-input" style={{ paddingRight: '2.75rem' }} />
          <button
            type="button"
            aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
            onClick={() => setShowPassword((v) => !v)}
            style={{
              position: 'absolute', right: '.75rem', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0,
              color: '#C5B0A0', display: 'flex', alignItems: 'center',
            }}
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
      </div>

      {error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#991B1B', fontSize: '.8125rem' }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={pending || success} className="lg2-btn"
        style={{ background: (pending || success) ? T.light : T.dark, color: '#F1E3C8' }}>
        {success ? 'Redirigiendo…' : pending ? 'Entrando…' : 'Entrar'}
      </button>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem', alignItems: 'center' }}>
        <button type="button" className="lg2-link" onClick={() => onMode('forgot')}
          style={{ fontSize: '.8125rem', color: T.light }}>
          ¿Olvidé mi contraseña?
        </button>
        <button type="button" className="lg2-link" onClick={() => onMode('magic')}
          style={{ fontSize: '.8125rem', color: T.light }}>
          Ya compré y no tengo contraseña — acceder con enlace de correo
        </button>
      </div>
    </form>
  );
}

// ─── Forgot password form ─────────────────────────────────────────────────────

const COOLDOWN_SECS = 60;

function ForgotForm({ emailParam, onMode }: { emailParam: string; onMode: (m: Mode) => void }) {
  const [state, formAction, pending] = useActionState<ResetPasswordResult | null, FormData>(
    requestPasswordReset, null,
  );
  const [cooldown, setCooldown] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Start cooldown after any submission (success or rate-limit).
  useEffect(() => {
    if (!state) return;
    if (state.success || state.error === 'RATE_LIMIT') {
      // Defer setState to avoid synchronous state update inside effect (lint rule).
      setTimeout(() => setCooldown(COOLDOWN_SECS), 0);
      timerRef.current = setInterval(() => {
        setCooldown((s) => {
          if (s <= 1) { clearInterval(timerRef.current!); return 0; }
          return s - 1;
        });
      }, 1000);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [state]);

  const isRateLimit = state?.error === 'RATE_LIMIT';
  const visibleError = state?.error && !isRateLimit ? state.error : null;
  const buttonDisabled = pending || cooldown > 0;

  if (state?.success) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📬</div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: T.dark, margin: '0 0 .75rem' }}>
          Revisa tu correo
        </h2>
        <p style={{ color: T.mid, fontSize: '.875rem', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
          Si encontramos una cuenta asociada a este correo, te enviaremos un enlace para crear o recuperar tu contraseña.
        </p>
        <button type="button" className="lg2-link" onClick={() => onMode('password')}
          style={{ fontSize: '.8125rem', color: T.gold, fontWeight: 700 }}>
          ← Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <p style={{ margin: 0, fontSize: '.875rem', color: T.mid, lineHeight: 1.6 }}>
        Ingresa tu correo y te enviaremos un enlace para crear o recuperar tu contraseña.
      </p>
      <div>
        <label htmlFor="fr-email" style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: T.dark, marginBottom: '.5rem' }}>
          Correo electrónico
        </label>
        <input id="fr-email" name="email" type="email" defaultValue={emailParam} required autoFocus
          placeholder="correo@ejemplo.com" className="lg2-input" />
      </div>

      {/* Rate limit — amber notice, not red error */}
      {isRateLimit && (
        <div style={{ background: '#FFF8E6', border: '1px solid #F5D87A', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#7A5C00', fontSize: '.8125rem', lineHeight: 1.55 }}>
          Por seguridad, ya enviamos varios enlaces recientemente. Espera unos minutos antes de solicitar otro.
          {cooldown > 0 && <span style={{ display: 'block', marginTop: '.35rem', fontWeight: 600 }}>Podrás intentar de nuevo en {cooldown}s.</span>}
        </div>
      )}

      {/* Other unexpected errors */}
      {visibleError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#991B1B', fontSize: '.8125rem' }}>
          {visibleError}
        </div>
      )}

      <button type="submit" disabled={buttonDisabled} className="lg2-btn"
        style={{ background: buttonDisabled ? T.light : T.dark, color: '#F1E3C8' }}>
        {pending ? 'Enviando…' : cooldown > 0 ? `Espera ${cooldown}s…` : 'Enviar enlace de recuperación'}
      </button>

      <button type="button" className="lg2-link" onClick={() => onMode('password')}
        style={{ textAlign: 'center', fontSize: '.8125rem', color: T.light }}>
        ← Volver al inicio de sesión
      </button>
    </form>
  );
}

// ─── Magic link form (fallback) ───────────────────────────────────────────────

function MagicForm({ redirectParam, emailParam, onMode }: {
  redirectParam: string;
  emailParam: string;
  onMode: (m: Mode) => void;
}) {
  const [state, formAction, pending] = useActionState<SendMagicLinkResult | null, FormData>(
    sendMagicLink, null,
  );

  if (state?.success) {
    return (
      <div style={{ textAlign: 'center', padding: '1rem 0' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📬</div>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: T.dark, margin: '0 0 .75rem' }}>
          Revisa tu correo
        </h2>
        <p style={{ color: T.mid, fontSize: '.875rem', lineHeight: 1.7, margin: '0 0 1.25rem' }}>
          Hemos enviado un enlace de acceso a tu bandeja. Haz clic en el enlace para ingresar.
        </p>
        <button type="button" className="lg2-link" onClick={() => onMode('password')}
          style={{ fontSize: '.8125rem', color: T.gold, fontWeight: 700 }}>
          ← Volver al inicio de sesión
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <input type="hidden" name="redirect" value={redirectParam} />
      <div style={{ background: T.cream, border: `1px solid ${T.border}`, borderRadius: '.625rem', padding: '.75rem 1rem', fontSize: '.8125rem', color: T.mid, lineHeight: 1.55 }}>
        Te enviaremos un enlace seguro por correo. No necesitas contraseña para acceder con este método.
      </div>
      <div>
        <label htmlFor="ml-email" style={{ display: 'block', fontSize: '.8125rem', fontWeight: 600, color: T.dark, marginBottom: '.5rem' }}>
          Correo electrónico
        </label>
        <input id="ml-email" name="email" type="email" defaultValue={emailParam} required autoFocus
          placeholder="correo@ejemplo.com" className="lg2-input" />
      </div>

      {state?.error && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#991B1B', fontSize: '.8125rem' }}>
          {state.error}
        </div>
      )}

      <button type="submit" disabled={pending} className="lg2-btn"
        style={{ background: pending ? T.light : T.dark, color: '#F1E3C8' }}>
        {pending ? 'Enviando enlace…' : 'Enviar enlace de acceso'}
      </button>

      <button type="button" className="lg2-link" onClick={() => onMode('password')}
        style={{ textAlign: 'center', fontSize: '.8125rem', color: T.light }}>
        ← Volver al inicio de sesión
      </button>
    </form>
  );
}

// ─── Main form with mode switching ───────────────────────────────────────────

function LoginForm() {
  const searchParams  = useSearchParams();
  const emailParam    = searchParams.get('email') ?? '';
  const redirectParam = searchParams.get('redirect') ?? '/cliente';
  const errorParam    = searchParams.get('error');

  // Support ?mode=forgot from the "Solicitar nuevo enlace" link in update-password page.
  const modeParam = searchParams.get('mode') as Mode | null;
  const validModes: Mode[] = ['password', 'forgot', 'magic'];
  const initialMode: Mode = (modeParam && validModes.includes(modeParam)) ? modeParam : 'password';

  const [mode, setMode] = useState<Mode>(initialMode);
  // Dismiss the URL-param link error when the user actively interacts (switches mode or submits).
  const [linkErrorDismissed, setLinkErrorDismissed] = useState(false);

  // Usuarios ya autenticados van directo a su panel. Se omite cuando llegan con
  // ?mode= explícito (p.ej. mode=forgot desde update-password, con sesión activa).
  useEffect(() => {
    if (modeParam) return;
    const supabase = createSupabaseBrowserClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const safeRedirect =
        redirectParam.startsWith('/') &&
        !redirectParam.startsWith('//') &&
        !redirectParam.includes('http://') &&
        !redirectParam.includes('https://')
          ? redirectParam
          : '/cliente';
      window.location.replace(safeRedirect);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Link errors (expired/invalid token) are separate from credential errors.
  // Only show them as a soft notice — never block the password form.
  const isLinkError = errorParam === 'expired_link' || errorParam === 'invalid_link';
  const showLinkNotice = isLinkError && !linkErrorDismissed;

  function handleSetMode(m: Mode) {
    setLinkErrorDismissed(true);
    setMode(m);
  }

  const configError = errorParam === 'config';

  const headings: Record<Mode, { title: string; sub: string }> = {
    password: { title: 'Accede a tu panel',            sub: 'Ingresa con tu correo y contraseña.' },
    forgot:   { title: 'Recuperar contraseña',         sub: 'Te enviaremos un enlace seguro por correo.' },
    magic:    { title: 'Acceder con enlace de correo', sub: 'Acceso sin contraseña — método alternativo.' },
  };

  return (
    <div>
      {/* Title */}
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <p style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.25em', textTransform: 'uppercase', color: T.gold, margin: '0 0 1.125rem' }}>
          KOMPRALO
        </p>
        <h1 style={{ fontSize: '1.625rem', fontWeight: 700, color: T.dark, margin: '0 0 .5rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
          {headings[mode].title}
        </h1>
        <p style={{ color: T.mid, fontSize: '.875rem', margin: 0, lineHeight: 1.6 }}>
          {headings[mode].sub}
        </p>
      </div>

      {/* Soft notice for expired/invalid link — dismissable, not an error block */}
      {showLinkNotice && (
        <div style={{
          background: '#FFF8E6', border: '1px solid #F5D87A',
          borderRadius: '.5rem', padding: '.75rem 1rem',
          fontSize: '.8125rem', color: '#7A5C00', lineHeight: 1.55,
          marginBottom: '1.25rem',
          display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '.5rem',
        }}>
          <span>
            {errorParam === 'expired_link'
              ? 'El enlace anterior ya expiró. Usa tu contraseña o solicita un nuevo enlace abajo.'
              : 'El enlace de acceso no es válido. Usa tu contraseña o solicita un nuevo enlace abajo.'}
          </span>
          <button
            type="button"
            onClick={() => setLinkErrorDismissed(true)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#7A5C00', fontSize: '1rem', lineHeight: 1, padding: 0, flexShrink: 0 }}
            aria-label="Cerrar"
          >
            ×
          </button>
        </div>
      )}

      {/* Config error (server misconfiguration — always show) */}
      {configError && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: '.5rem', padding: '.75rem 1rem', color: '#991B1B', fontSize: '.8125rem', marginBottom: '1.25rem' }}>
          Error de configuración del servidor. Contacta soporte.
        </div>
      )}

      {mode === 'password' && (
        <PasswordForm
          redirectParam={redirectParam}
          emailParam={emailParam}
          onMode={handleSetMode}
          onInteract={() => setLinkErrorDismissed(true)}
        />
      )}
      {mode === 'forgot' && (
        <ForgotForm emailParam={emailParam} onMode={handleSetMode} />
      )}
      {mode === 'magic' && (
        <MagicForm redirectParam={redirectParam} emailParam={emailParam} onMode={handleSetMode} />
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
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
      <div aria-hidden style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,169,98,0.07) 0%, transparent 70%)', pointerEvents: 'none' }} />

      {/* fixed + zIndex: con position absolute quedaba recortado/tapado por la
          card cuando el contenido centrado excede el viewport (móvil). */}
      <Link href="/invitaciones" style={{
        position: 'fixed', top: '.75rem', left: '.75rem', zIndex: 20,
        display: 'inline-flex', alignItems: 'center',
        minHeight: '44px', minWidth: '44px', padding: '.5rem .875rem',
        fontSize: '.8125rem', color: T.light, fontWeight: 600, textDecoration: 'none',
        background: 'rgba(241,227,200,0.9)', border: `1px solid ${T.border}`,
        borderRadius: '.625rem',
      }}>
        ← Volver
      </Link>

      <div className="lg2-card" style={{
        width: '100%', maxWidth: '420px',
        background: T.white, borderRadius: '1.375rem', padding: '2.75rem 2.375rem',
        boxShadow: '0 10px 48px rgba(15,12,9,0.08), 0 2px 0 rgba(229,221,210,1)',
        position: 'relative',
      }}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '3rem', height: '3px', background: T.gold, borderRadius: '0 0 3px 3px' }} />

        <Suspense fallback={<p style={{ textAlign: 'center', color: T.light, fontSize: '.875rem' }}>Cargando...</p>}>
          <LoginForm />
        </Suspense>

        <div style={{ marginTop: '1.75rem', paddingTop: '1.375rem', borderTop: `1px solid ${T.border}`, textAlign: 'center' }}>
          <p style={{ fontSize: '.78rem', color: T.light, margin: '0 0 .5rem' }}>
            ¿Compraste y perdiste tu acceso?{' '}
            <Link href="/recuperar-acceso" style={{ color: T.gold, fontWeight: 700, textDecoration: 'none' }}>
              Recupéralo aquí →
            </Link>
          </p>
          <p style={{ fontSize: '.78rem', color: T.light, margin: 0 }}>
            ¿Aún no tienes una invitación?{' '}
            <Link href="/invitaciones#planes" style={{ color: T.gold, fontWeight: 700, textDecoration: 'none' }}>
              Ver planes y precios →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
