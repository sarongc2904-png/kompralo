import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Pago cancelado — Kompralo' };

export default function CheckoutCancelPage() {
  return (
    <main
      style={{
        minHeight:      '100dvh',
        display:        'flex',
        flexDirection:  'column',
        alignItems:     'center',
        justifyContent: 'center',
        background:     '#F5F0EB',
        padding:        '2rem 1rem',
        fontFamily:     'var(--font-inter, system-ui, sans-serif)',
        textAlign:      'center',
      }}
    >
      <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#1A1410', margin: '0 0 0.75rem' }}>
        Pago cancelado
      </h1>
      <p style={{ color: '#6B5B4E', fontSize: '1rem', lineHeight: 1.6, maxWidth: '30rem', margin: '0 0 2rem' }}>
        No se realizó ningún cargo. Puedes intentarlo de nuevo cuando quieras.
      </p>
      <Link
        href="/invitaciones/precios"
        style={{
          display:        'inline-block',
          padding:        '0.625rem 1.5rem',
          background:     '#1A1410',
          color:          '#F5F3F0',
          borderRadius:   '0.5rem',
          fontSize:       '0.875rem',
          fontWeight:     600,
          textDecoration: 'none',
        }}
      >
        Ver planes
      </Link>
    </main>
  );
}
