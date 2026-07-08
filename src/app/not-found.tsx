import Link from 'next/link';
import { buildWhatsAppHref } from '@/lib/contact';

export default function NotFound() {
  return (
    <main
      className="min-h-screen flex flex-col items-center justify-center px-6 text-center"
      style={{ background: '#F9F5EF' }}
    >
      {/* Ornamento superior */}
      <svg
        width="80"
        height="16"
        viewBox="0 0 80 16"
        fill="none"
        className="mb-8 opacity-40"
        aria-hidden="true"
      >
        <line x1="0" y1="8" x2="32" y2="8" stroke="#C5A880" strokeWidth="0.8" />
        <circle cx="40" cy="8" r="3" fill="#C5A880" />
        <line x1="48" y1="8" x2="80" y2="8" stroke="#C5A880" strokeWidth="0.8" />
      </svg>

      {/* Marca */}
      <p
        className="text-[10px] uppercase tracking-[0.35em] mb-6"
        style={{ color: '#C5A880' }}
      >
        Kompralo
      </p>

      {/* Código */}
      <p
        className="text-7xl font-light mb-6"
        style={{
          color: '#E8DDD0',
          fontFamily: 'Georgia, "Times New Roman", serif',
          letterSpacing: '-0.02em',
        }}
      >
        404
      </p>

      {/* Título */}
      <h1
        className="text-2xl md:text-3xl font-light tracking-wide mb-4"
        style={{
          color: '#3D2B1A',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        Esta página no está disponible
      </h1>

      {/* Subtítulo */}
      <p
        className="text-sm md:text-base max-w-sm leading-relaxed mb-10"
        style={{ color: '#7A5C35' }}
      >
        Pero podemos ayudarte a encontrar tu invitación o resolver tus dudas.
      </p>

      {/* CTAs */}
      <div className="flex flex-col items-center gap-3 sm:flex-row">
        <Link
          href="/"
          className="inline-block px-8 py-3 text-[11px] uppercase tracking-[0.25em] transition-opacity duration-200 hover:opacity-70"
          style={{
            border: '1px solid #C5A880',
            borderRadius: 8,
            color: '#8B6940',
            background: 'transparent',
          }}
        >
          Volver al inicio
        </Link>
        <a
          href={buildWhatsAppHref()}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block px-8 py-3 text-[11px] uppercase tracking-[0.25em] transition-opacity duration-200 hover:opacity-80"
          style={{
            border: '1px solid #C5A880',
            borderRadius: 8,
            color: '#FAF3EE',
            background: '#8B6940',
          }}
        >
          Contactar por WhatsApp
        </a>
      </div>

      {/* Ornamento inferior */}
      <svg
        width="80"
        height="16"
        viewBox="0 0 80 16"
        fill="none"
        className="mt-12 opacity-25"
        aria-hidden="true"
      >
        <line x1="0" y1="8" x2="32" y2="8" stroke="#C5A880" strokeWidth="0.8" />
        <circle cx="40" cy="8" r="3" fill="#C5A880" />
        <line x1="48" y1="8" x2="80" y2="8" stroke="#C5A880" strokeWidth="0.8" />
      </svg>
    </main>
  );
}
