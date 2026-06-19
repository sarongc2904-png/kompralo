import { Theme } from './types';

// ─── MINIMAL MODERN ──────────────────────────────────────────────────────────
// Aesthetic: Architectural black & white editorial. Cinzel roman caps headings,
// pure white background, graphite accents with a single gold signature.
// Think: NYC loft wedding, fashion editorial, The Row, architectural digest.
export const modernTheme: Theme = {
  id: 'modern',
  name: 'Minimal Modern',
  bodyBg: 'bg-white',
  bodyText: 'text-[#0A0A0A]',
  headingFont: 'font-display tracking-[0.28em] uppercase', // Cinzel — roman architectural
  bodyFont: 'font-sans tracking-wide',

  accentBg: 'bg-[#0A0A0A] hover:bg-[#2A2A2A]',
  accentText: 'text-[#0A0A0A]',
  accentBorder: 'border-[#D0D0D0]',

  cardBg: 'bg-[#FAFAFA] border',
  cardBorder: 'border-[#E0E0E0]',
  cardText: 'text-[#0A0A0A]',

  paperTexture: false,
  dividerColor: 'bg-[#0A0A0A]',

  countdownBg: 'bg-[#F5F5F5]',
  rsvpInputBg: 'bg-[#FFFFFF]',
  storyLeftBg: 'bg-[#F0F0F0]',
  storyRightBg: 'bg-white',

  dressCodeSwatches: ['#FFFFFF', '#E8E8E8', '#A0A0A0', '#404040', '#0A0A0A'],

  bgSolid: '#FFFFFF',
  bgGlows: ['#F0F0F0', '#E5E5E5', '#F5F5F5'],
  heroOverlay: 'from-[#FFFFFF]/20 via-transparent to-[#FFFFFF]',
};
