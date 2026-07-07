import { Great_Vibes } from 'next/font/google';

// Caligrafía para los nombres de los novios en el CinematicIntro (rutas /i/[slug]).
// La variable --font-script solo se inyecta en src/app/i/[slug]/layout.tsx;
// fuera de ese árbol el consumidor debe declarar un fallback.
export const greatVibes = Great_Vibes({
  weight: '400',
  subsets: ['latin', 'latin-ext'],
  display: 'swap',
  variable: '--font-script',
  preload: true,
});
