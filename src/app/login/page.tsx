'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { sendMagicLink } from './actions';

// ─── CSS styles ───────────────────────────────────────────────────────────────
const styles = `
  @keyframes lg-fadeUp {
    from { opacity:0; transform:translateY(18px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @media (prefers-reduced-motion: reduce) {
    .lg-anim, .lg-card { animation:none !important; transition:none !important; }
  }
  .lg-anim  { animation: lg-fadeUp .45s ease both; }
  .lg-d1    { animation-delay:.1s; }
  .lg-d2    { animation-delay:.18s; }

  .lg-input {
    width: 100%;
    padding: .625rem .875rem;
    border: 1.5px solid #D4C9BC;
    border-radius: .5rem;
    font-size: .875rem;
    color: #1A1410;
    background: #FFFFFF;
    box-sizing: border-box;
    outline: none;
    transition: border-color .15s ease, box-shadow .15s ease;
    font-family: inherit;
  }
  .lg-input:focus {
    border-color: #C5A880;
    box-shadow: 0 0 0 3px rgba(197,168,128,0.15);
  }

  .lg-submit {
    width: 100%;
    padding: .75rem;
    border: none;
    border-radius: .5rem;
    font-size: .875rem;
    font-weight: 700;
    cursor: pointer;
    font-family: inherit;
    transition: transform .15s ease, opacity .15s ease, box-shadow .15s ease;
  }
  .lg-submit:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(26,20,16,0.18);
  }
  .lg-submit:active:not(:disabled) { transform: translateY(0); }
  .lg-submit:disabled { cursor: not-allowed; }
`;

function LoginForm() {
  const searchParams   = useSearchParams();
  const emailParam     = searchParams.get('email') ?? '';
  const redirectParam  = searchParams.get('redirect') ?? '/dashboard';
  const errorParam     = searchParams.get('error');

  const [state, formAction, pending] = useActionState(sendMagicLink, null);

  const errorMessages: Record<string, string> = {
    expired_link: 'El enlace expiró. Solicita uno nuevo.',
    invalid_link: 'Enlace inválido. Solicita uno nuevo.',
    config:       'Error de configuración del servidor.',
  };

  if (state?.success) {
    return (
      <div style={{ textAlign:'center', padding:'1rem 0' }}>
        {/* Success illustration */}
        <div style={{
          width:'3.5rem', height:'3.5rem', borderRadius:'50%',
          background:'linear-gradient(135deg,#F9F3EC,#EDE5DA)',
          border:'2px solid #E8E2DA',
          display:'flex', alignItems:'center', justifyContent:'center',
          fontSize:'1.5rem', margin:'0 auto 1.25rem',
        }}>
          📬
        </div>
        <h2 style={{ fontSize:'1.125rem', fontWeight:700, color:'#1A1410', margin:'0 0 0.75rem' }}>
          Revisa tu correo
        </h2>
        <p style={{ color:'#6B5B4E', fontSize:'0.875rem', lineHeight:1.65, margin:'0 0 1rem' }}>
          Enviamos un enlace de acceso a tu bandeja de entrada.
          <br />Haz clic en el enlace para continuar.
        </p>
        <div style={{
          background:'#F5F0EB', borderRadius:'0.625rem', padding:'0.875rem',
          fontSize:'0.8rem', color:'#9B8878', lineHeight:1.55,
        }}>
          ¿No llegó? Revisa spam o espera unos segundos e intenta de nuevo.
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} style={{ display:'flex', flexDirection:'column', gap:'1.25rem' }}>
      <input type="hidden" name="redirect" value={redirectParam} />

      <div>
        <label htmlFor="login-email" style={{ display:'block', fontSize:'0.875rem', fontWeight:600, color:'#1A1410', marginBottom:'0.5rem' }}>
          Correo electrónico
        </label>
        <input
          id="login-email" name="email" type="email"
          defaultValue={emailParam} required autoFocus
          placeholder="correo@ejemplo.com"
          className="lg-input"
        />
      </div>

      {(state?.error || errorParam) && (
        <div style={{
          background:'#FEF2F2', border:'1px solid #FECACA',
          borderRadius:'0.5rem', padding:'0.75rem 1rem',
          color:'#991B1B', fontSize:'0.8125rem',
        }}>
          {state?.error ?? (errorParam ? (errorMessages[errorParam] ?? 'Ocurrió un error.') : '')}
        </div>
      )}

      <button
        type="submit" disabled={pending}
        className="lg-submit"
        style={{
          background: pending ? '#9B8878' : '#1A1410',
          color: '#F5F3F0',
        }}
      >
        {pending ? 'Enviando enlace…' : 'Enviar enlace de acceso'}
      </button>

      <p style={{ color:'#9B8878', fontSize:'0.8rem', textAlign:'center', lineHeight:1.65, margin:0 }}>
        Recibirás un correo con un enlace seguro.
        <br /><strong style={{ color:'#6B5B4E' }}>No necesitas contraseña.</strong>
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main style={{
      minHeight:'100dvh',
      background:'linear-gradient(145deg, #F9F3EC 0%, #F5F0EB 60%, #EDE5DA 100%)',
      display:'flex', alignItems:'center', justifyContent:'center',
      padding:'2rem 1rem',
      fontFamily:'var(--font-inter, system-ui, sans-serif)',
      position:'relative', overflow:'hidden',
    }}>
      <style>{styles}</style>

      {/* Decorative orbs */}
      <div aria-hidden style={{
        position:'absolute', top:'-60px', right:'-60px', width:'250px', height:'250px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(197,168,128,0.1) 0%, transparent 70%)', pointerEvents:'none',
      }} />
      <div aria-hidden style={{
        position:'absolute', bottom:'-60px', left:'-60px', width:'200px', height:'200px', borderRadius:'50%',
        background:'radial-gradient(circle, rgba(197,168,128,0.07) 0%, transparent 70%)', pointerEvents:'none',
      }} />

      <div className="lg-anim" style={{
        width:'100%', maxWidth:'400px',
        background:'#FFFFFF', borderRadius:'1.25rem', padding:'2.5rem',
        boxShadow:'0 8px 40px rgba(26,20,16,0.1)',
        position:'relative',
      }}>
        {/* Gold accent line */}
        <div style={{
          position:'absolute', top:0, left:'50%', transform:'translateX(-50%)',
          width:'48px', height:'3px', background:'#C5A880', borderRadius:'0 0 2px 2px',
        }} />

        <div style={{ textAlign:'center', marginBottom:'2rem' }}>
          {/* Logo */}
          <p style={{ fontSize:'0.6875rem', letterSpacing:'0.28em', textTransform:'uppercase', color:'#C5A880', margin:'0 0 1rem', fontWeight:700 }}>
            KOMPRALO
          </p>

          <h1 style={{ fontSize:'1.375rem', fontWeight:700, color:'#1A1410', margin:'0 0 0.5rem', fontFamily:'var(--font-playfair, Georgia, serif)' }}>
            Accede a tu invitación
          </h1>
          <p style={{ color:'#6B5B4E', fontSize:'0.875rem', margin:0, lineHeight:1.55 }}>
            Usa el correo con el que realizaste tu compra.
          </p>
        </div>

        <Suspense fallback={<p style={{ textAlign:'center', color:'#9B8878' }}>Cargando...</p>}>
          <LoginForm />
        </Suspense>

        {/* Bottom link */}
        <div style={{ marginTop:'1.75rem', paddingTop:'1.25rem', borderTop:'1px solid #F0EBE4', textAlign:'center' }}>
          <p style={{ fontSize:'0.78rem', color:'#9B8878', margin:0 }}>
            ¿Aún no tienes una invitación?{' '}
            <a href="/invitaciones/precios" style={{ color:'#C5A880', fontWeight:600, textDecoration:'none' }}>
              Ver planes →
            </a>
          </p>
        </div>
      </div>
    </main>
  );
}
