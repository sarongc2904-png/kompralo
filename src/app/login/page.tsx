'use client';

import { useActionState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { sendMagicLink } from './actions';

function LoginForm() {
  const searchParams = useSearchParams();
  const emailParam   = searchParams.get('email') ?? '';
  const redirectParam = searchParams.get('redirect') ?? '/dashboard';
  const errorParam   = searchParams.get('error');

  const [state, formAction, pending] = useActionState(sendMagicLink, null);

  const errorMessages: Record<string, string> = {
    expired_link: 'El enlace expiró. Solicita uno nuevo.',
    invalid_link: 'Enlace inválido. Solicita uno nuevo.',
    config:       'Error de configuración del servidor.',
  };

  if (state?.success) {
    return (
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: '2.5rem', margin: '0 0 1rem' }}>📬</p>
        <h2 style={{ fontSize: '1.125rem', fontWeight: 700, color: '#1A1410', margin: '0 0 0.75rem' }}>
          Revisa tu correo
        </h2>
        <p style={{ color: '#6B5B4E', fontSize: '0.875rem', lineHeight: 1.6, margin: 0 }}>
          Enviamos un enlace de acceso a tu bandeja de entrada.
          <br />Haz clic en el enlace para continuar.
        </p>
        <p style={{ color: '#9B8878', fontSize: '0.8rem', marginTop: '1.5rem' }}>
          ¿No llegó? Revisa spam o espera unos segundos e intenta de nuevo.
        </p>
      </div>
    );
  }

  return (
    <form action={formAction}>
      <input type="hidden" name="redirect" value={redirectParam} />

      <div style={{ marginBottom: '1.25rem' }}>
        <label
          htmlFor="login-email"
          style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#1A1410', marginBottom: '0.5rem' }}
        >
          Correo electrónico
        </label>
        <input
          id="login-email"
          name="email"
          type="email"
          defaultValue={emailParam}
          required
          autoFocus
          placeholder="correo@ejemplo.com"
          style={{
            width:        '100%',
            padding:      '0.625rem 0.875rem',
            border:       '1px solid #D4C9BC',
            borderRadius: '0.5rem',
            fontSize:     '0.875rem',
            color:        '#1A1410',
            background:   '#FFFFFF',
            boxSizing:    'border-box',
            outline:      'none',
          }}
        />
      </div>

      {(state?.error || errorParam) && (
        <p style={{ color: '#C62828', fontSize: '0.8125rem', marginBottom: '1rem' }}>
          {state?.error ?? (errorParam ? (errorMessages[errorParam] ?? 'Ocurrió un error.') : '')}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        style={{
          width:        '100%',
          padding:      '0.75rem',
          background:   pending ? '#9B8878' : '#1A1410',
          color:        '#F5F3F0',
          borderRadius: '0.5rem',
          fontSize:     '0.875rem',
          fontWeight:   600,
          border:       'none',
          cursor:       pending ? 'not-allowed' : 'pointer',
          transition:   'background 0.15s',
        }}
      >
        {pending ? 'Enviando...' : 'Enviar enlace de acceso'}
      </button>

      <p style={{ color: '#9B8878', fontSize: '0.8rem', marginTop: '1rem', textAlign: 'center', lineHeight: 1.6 }}>
        Recibirás un correo con un enlace seguro.
        <br />No necesitas contraseña.
      </p>
    </form>
  );
}

export default function LoginPage() {
  return (
    <main
      style={{
        minHeight:      '100dvh',
        background:     '#F5F0EB',
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        padding:        '2rem 1rem',
        fontFamily:     'var(--font-inter, system-ui, sans-serif)',
      }}
    >
      <div
        style={{
          width:        '100%',
          maxWidth:     '400px',
          background:   '#FFFFFF',
          borderRadius: '1rem',
          padding:      '2.5rem',
          boxShadow:    '0 4px 24px rgba(26,20,16,0.08)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <p
            style={{
              fontSize:      '10px',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              color:         '#C5A880',
              margin:        '0 0 0.625rem',
            }}
          >
            KOMPRALO
          </p>
          <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: '#1A1410', margin: '0 0 0.5rem' }}>
            Accede a tu invitación
          </h1>
          <p style={{ color: '#6B5B4E', fontSize: '0.875rem', margin: 0 }}>
            Usa el correo con el que realizaste tu compra.
          </p>
        </div>

        <Suspense fallback={<p style={{ textAlign: 'center', color: '#9B8878' }}>Cargando...</p>}>
          <LoginForm />
        </Suspense>
      </div>
    </main>
  );
}
