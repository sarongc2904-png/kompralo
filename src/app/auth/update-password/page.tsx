import Link from 'next/link';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import UpdatePasswordForm from './UpdatePasswordForm';

// Must be dynamic — reads session cookies on every request.
export const dynamic = 'force-dynamic';

const T = {
  dark:   '#0D0A07',
  mid:    '#1A1612',
  light:  '#6B4A35',
  gold:   '#C4A962',
  border: '#EAD7A3',
  white:  '#F1E3C8',
} as const;

const pageStyle = {
  minHeight: '100dvh',
  background: `radial-gradient(ellipse at 30% 20%, rgba(196,169,98,0.09) 0%, transparent 55%), linear-gradient(160deg, #E8D7B8 0%, #F1E3C8 100%)`,
  display: 'flex', flexDirection: 'column' as const, alignItems: 'center', justifyContent: 'center',
  padding: '2rem 1.25rem',
  fontFamily: 'var(--font-inter, system-ui, sans-serif)',
  position: 'relative' as const,
};

const cardStyle = {
  width: '100%', maxWidth: '420px',
  background: T.white, borderRadius: '1.375rem', padding: '2.75rem 2.375rem',
  boxShadow: '0 10px 48px rgba(15,12,9,0.08), 0 2px 0 rgba(229,221,210,1)',
  position: 'relative' as const,
};

// ─── Server component — checks for active session ────────────────────────────

export default async function UpdatePasswordPage() {
  let hasSession = false;
  try {
    const supabase = await createServerSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();
    hasSession = !!user;
  } catch {
    hasSession = false;
  }

  return (
    <main style={pageStyle}>
      <div className="paper-noise" />
      <div aria-hidden style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(196,169,98,0.1) 0%, transparent 70%)', pointerEvents: 'none' }} />

      <div style={cardStyle}>
        <div style={{ position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)', width: '3rem', height: '3px', background: T.gold, borderRadius: '0 0 3px 3px' }} />

        {hasSession ? (
          <UpdatePasswordForm />
        ) : (
          /* No active session — invite link expired or was already used */
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>🔗</div>
            <p style={{ fontSize: '.6875rem', fontWeight: 800, letterSpacing: '.25em', textTransform: 'uppercase', color: T.gold, margin: '0 0 1.125rem' }}>
              KOMPRALO
            </p>
            <h1 style={{ fontSize: '1.375rem', fontWeight: 700, color: T.dark, margin: '0 0 .75rem', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
              Tu enlace expiró
            </h1>
            <p style={{ color: T.mid, fontSize: '.875rem', lineHeight: 1.65, margin: '0 0 1.75rem' }}>
              El enlace para crear tu contraseña ya expiró o fue utilizado.
              Puedes solicitar uno nuevo a continuación.
            </p>

            {/* Request new link via forgot-password flow */}
            <Link
              href="/login?mode=forgot"
              style={{
                display: 'inline-block',
                padding: '.75rem 1.75rem',
                background: T.dark, color: '#F5EDD8',
                borderRadius: '.625rem', fontSize: '.875rem',
                fontWeight: 700, textDecoration: 'none',
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
        )}
      </div>
    </main>
  );
}
