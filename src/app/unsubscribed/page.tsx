import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Te dimos de baja — Kompralo',
};

export default function UnsubscribedPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const isError = !!searchParams.error;

  return (
    <main style={{ minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F5F0E8', padding: '2rem', fontFamily: 'var(--font-inter, system-ui, sans-serif)' }}>
      <div style={{ maxWidth: 480, textAlign: 'center' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{isError ? '⚠️' : '✅'}</div>
        <h1 style={{ margin: '0 0 12px', fontSize: '1.5rem', fontWeight: 700, color: '#0D0A07', fontFamily: 'var(--font-playfair, Georgia, serif)' }}>
          {isError ? 'Enlace inválido' : 'Diste de baja exitosamente'}
        </h1>
        <p style={{ margin: '0 0 32px', fontSize: '1rem', color: '#1A1612', lineHeight: 1.6 }}>
          {isError
            ? 'El enlace de cancelación es inválido o ya expiró. Si quieres darte de baja, contáctanos por WhatsApp.'
            : 'Ya no recibirás más correos de Kompralo. Si en algún momento cambias de opinión, visita nuestra página.'}
        </p>
        <Link href="/invitaciones" style={{ display: 'inline-block', padding: '12px 28px', borderRadius: 8, background: '#0D0A07', color: '#F1E3C8', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
          Volver a Kompralo
        </Link>
      </div>
    </main>
  );
}
