'use client';

import { useActionState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { sendMagicLink } from './actions';

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

  .lg2-secondary-link {
    transition: color .18s ease;
  }
  .lg2-secondary-link:hover { color: #B8966A !important; }
`;

function LoginForm() {
  const searchParams  = useSearchParams();
  const emailParam    = searchParams.get('email') ?? '';
  const redirectParam = searchParams.get('redirect') ?? '/dashboard';
  const errorParam    = searchParams.get('error');

  // Detect if the user arrived from the post-payment email (redirect to editor).
  const isPostPayment = redirectParam.includes('/dashboard/invitations') || redirectParam.includes('/edit');

  const [state, formAction, pending] = useActionState(sendMagicLink, null);

  const errorMessages: Record<string,string> = {
    expired_link: 'El enlace de acceso ha expirado. Solicita uno nuevo.',
    invalid_link: 'El enlace de acceso es inválido. Solicita uno nuevo.',
    config:       'Error de configuración del servidor de correos.',
  };

  if (state?.success) {
    return (
      <div style={{ textAlign:'center', padding:'1rem 0' }}>
        <div style={{
          width:'3.75rem', height:'3.75rem', borderRadius:'50%',
          background:T.cream, border:`2px solid ${T.border}`,
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1.625rem', margin:'0 auto 1.375rem',
          boxShadow:'0 4px 16px rgba(15,12,9,0.05)',
        }}>
          📬
        </div>
        <h2 style={{ fontSize:'1.25rem', fontWeight:700, color:T.dark, margin:'0 0 .75rem', fontFamily:'var(--font-playfair, Georgia, serif)' }}>
          Revisa tu correo
        </h2>
        <p style={{ color:T.mid, fontSize:'.875rem', lineHeight:1.7, margin:'0 0 1.25rem' }}>
          Hemos enviado un enlace de acceso (Magic Link) a tu bandeja de entrada.
          <br />Haz clic en el enlace para ingresar directamente.
        </p>
        <div style={{ background:T.ivory, border:`1px solid ${T.border}`, borderRadius:'.625rem', padding:'.875rem 1rem', fontSize:'.78rem', color:T.light, lineHeight:1.55 }}>
          ¿No lo recibiste? Revisa tu bandeja de correo no deseado (spam) o espera unos segundos antes de intentar de nuevo.
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <input type="hidden" name="redirect" value={redirectParam} />

      {isPostPayment && (
        <div style={{
          background:T.cream, border:`1px solid ${T.border}`,
          borderRadius:'.625rem', padding:'.75rem 1rem',
          fontSize:'.8125rem', color:T.mid, lineHeight:1.55,
          display:'flex', gap:'.5rem', alignItems:'flex-start',
        }}>
          <span style={{ flexShrink:0 }}>✉️</span>
          <span>Confirma tu correo y te enviaremos un enlace para editar tu invitación directamente.</span>
        </div>
      )}

      <div>
        <label htmlFor="login-email" style={{ display:'block', fontSize:'.8125rem', fontWeight:600, color:T.dark, marginBottom:'.5rem' }}>
          Correo electrónico
        </label>
        <input
          id="login-email" name="email" type="email"
          defaultValue={emailParam} required autoFocus
          placeholder="correo@ejemplo.com"
          className="lg2-input"
        />
      </div>

      {(state?.error || errorParam) && (
        <div style={{
          background:'#FEF2F2', border:'1px solid #FECACA',
          borderRadius:'.5rem', padding:'.75rem 1rem',
          color:'#991B1B', fontSize:'.8125rem', lineHeight:1.5,
        }}>
          {state?.error ?? (errorParam ? (errorMessages[errorParam] ?? 'Ocurrió un error al procesar el acceso.') : '')}
        </div>
      )}

      <button
        type="submit" disabled={pending}
        className="lg2-btn"
        style={{ background: pending ? T.light : T.dark, color:'#F5EDD8' }}
      >
        {pending ? 'Enviando enlace de acceso…' : 'Enviar enlace de acceso'}
      </button>

      <div style={{
        background:T.ivory, border:`1px solid ${T.border}`,
        borderRadius:'.625rem', padding:'.875rem 1rem',
        textAlign:'center',
      }}>
        <p style={{ margin:0, fontSize:'.8125rem', color:T.mid, lineHeight:1.6 }}>
          Te enviaremos un correo con un enlace seguro.<br />
          <strong style={{ color:T.dark }}>No necesitas contraseña para acceder.</strong>
        </p>
      </div>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main style={{
      minHeight:'100dvh',
      background:`radial-gradient(ellipse at 30% 20%, rgba(184,150,106,0.09) 0%, transparent 55%), linear-gradient(160deg, #FAF7F2 0%, #F2EBD8 100%)`,
      display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
      padding:'2rem 1.25rem',
      fontFamily:'var(--font-inter, system-ui, sans-serif)',
      position:'relative',
    }}>
      <div className="paper-noise" />
      <style>{styles}</style>

      {/* Decorative orbs */}
      <div aria-hidden style={{ position:'absolute', top:'-80px', right:'-80px', width:'280px', height:'280px', borderRadius:'50%', background:'radial-gradient(circle, rgba(184,150,106,0.1) 0%, transparent 70%)', pointerEvents:'none' }} />
      <div aria-hidden style={{ position:'absolute', bottom:'-60px', left:'-60px', width:'220px', height:'220px', borderRadius:'50%', background:'radial-gradient(circle, rgba(184,150,106,0.07) 0%, transparent 70%)', pointerEvents:'none' }} />

      {/* Back link */}
      <Link href="/invitaciones" style={{ position:'absolute', top:'1.25rem', left:'1.25rem', fontSize:'.8125rem', color:T.light, textDecoration:'none', fontWeight:500 }}>
        ← Volver
      </Link>

      {/* Card */}
      <div className="lg2-card" style={{
        width:'100%', maxWidth:'420px',
        background:T.white, borderRadius:'1.375rem', padding:'2.75rem 2.375rem',
        boxShadow:'0 10px 48px rgba(15,12,9,0.08), 0 2px 0 rgba(229,221,210,1)',
        position:'relative',
      }}>
        {/* Gold top accent */}
        <div style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width:'3rem', height:'3px', background:T.gold,
          borderRadius:'0 0 3px 3px',
        }} />

        {/* Logo + heading */}
        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          <p style={{ fontSize:'.6875rem', fontWeight:800, letterSpacing:'.25em', textTransform:'uppercase', color:T.gold, margin:'0 0 1.125rem' }}>
            KOMPRALO
          </p>
          <h1 style={{
            fontSize:'1.625rem', fontWeight:700, color:T.dark, margin:'0 0 .5rem',
            fontFamily:'var(--font-playfair, Georgia, serif)',
          }}>
            Confirma tu acceso
          </h1>
          <p style={{ color:T.mid, fontSize:'.875rem', margin:0, lineHeight:1.6 }}>
            Te enviaremos un enlace seguro a tu correo. No necesitas contraseña.
          </p>
        </div>

        <Suspense fallback={<p style={{ textAlign:'center', color:T.light, fontSize:'.875rem' }}>Cargando...</p>}>
          <LoginForm />
        </Suspense>

        {/* Bottom link */}
        <div style={{ marginTop:'1.75rem', paddingTop:'1.375rem', borderTop:`1px solid ${T.border}`, textAlign:'center' }}>
          <p style={{ fontSize:'.78rem', color:T.light, margin:0 }}>
            ¿Aún no tienes una invitación?{' '}
            <Link href="/invitaciones/precios" className="lg2-secondary-link" style={{ color:T.gold, fontWeight:700, textDecoration:'none' }}>
              Ver planes y precios →
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
