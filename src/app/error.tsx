'use client';

import Link from 'next/link';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
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

      {/* Ícono */}
      <p
        className="text-5xl mb-6 opacity-30"
        style={{ color: '#8B6940' }}
        aria-hidden="true"
      >
        ✦
      </p>

      {/* Título */}
      <h1
        className="text-2xl md:text-3xl font-light tracking-wide mb-4"
        style={{
          color: '#3D2B1A',
          fontFamily: 'Georgia, "Times New Roman", serif',
        }}
      >
        Algo salió mal
      </h1>

      {/* Subtítulo */}
      <p
        className="text-sm md:text-base max-w-sm leading-relaxed mb-10"
        style={{ color: '#7A5C35' }}
      >
        No pudimos cargar esta página. Puedes intentarlo de nuevo o volver al inicio.
      </p>

      {/* Acciones */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <button
          onClick={reset}
          className="inline-block px-8 py-3 text-[11px] uppercase tracking-[0.25em] text-white transition-opacity duration-200 hover:opacity-80 cursor-pointer"
          style={{
            background: 'linear-gradient(135deg, #C5A880 0%, #A8865A 100%)',
            borderRadius: 8,
            border: 'none',
          }}
        >
          Intentar de nuevo
        </button>

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
