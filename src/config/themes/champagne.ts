import { Theme } from './types';

// ─── CHAMPAGNE EDITORIAL ─────────────────────────────────────────────────────
// Aesthetic: Parisian editorial luxury. Warm ivory paper, rich gold accents,
// Cormorant Garamond headings (light refined serif) + Inter body.
// Think: Vogue editorial, high-end stationery, candlelight.
export const champagneTheme: Theme = {
  id: 'champagne',
  name: 'Champagne Editorial',
  bodyBg: 'bg-gradient-to-br from-[#FDF9F2] via-[#F8F2E6] to-[#EDE4D3]',
  bodyText: 'text-[#3D2B1A]',
  headingFont: 'font-editorial font-light tracking-wide',   // Cormorant Garamond — refined luxury
  bodyFont: 'font-sans',

  accentBg: 'bg-[#C5A880] hover:bg-[#B4966E]',
  accentText: 'text-[#A8865A]',
  accentBorder: 'border-[#E3D9C6]',

  cardBg: 'bg-white/70 backdrop-blur-md',
  cardBorder: 'border-[#EDE8DF]',
  cardText: 'text-[#3D2B1A]',

  paperTexture: true,
  dividerColor: 'bg-[#C5A880]',

  countdownBg: 'bg-[#F3EFE9]',
  rsvpInputBg: 'bg-[#FAF8F5]',
  storyLeftBg: 'bg-[#F5F1E9]',
  storyRightBg: 'bg-white',

  dressCodeSwatches: ['#FAF8F5', '#EFEAE2', '#D8CEBA', '#C5A880', '#8D7D64'],

  bgSolid: '#F8F2E6',
  bgGlows: ['#E8C87A', '#C5A55A', '#D4A86A'],
  heroOverlay: 'from-[#FAF8F5]/30 via-transparent to-[#FAF8F5]',
};
