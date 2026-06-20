import { Theme } from './types';

// ─── CHAMPAGNE EDITORIAL ─────────────────────────────────────────────────────
// Aesthetic: Parisian editorial luxury. Warm ivory paper, rich gold accents,
// Cormorant Garamond headings (light refined serif) + Inter body.
// Think: Vogue editorial, high-end stationery, candlelight.
export const champagneTheme: Theme = {
  id: 'champagne',
  name: 'Champagne Editorial',
  bodyBg: 'bg-gradient-to-br from-[#F1E3C8] via-[#E8D7B8] to-[#D9C4A3]',
  bodyText: 'text-[#1A1612]',
  headingFont: 'font-editorial font-light tracking-wide',   // Cormorant Garamond — refined luxury
  bodyFont: 'font-sans',

  accentBg: 'bg-[#C4A962] hover:bg-[#CDB88E]',
  accentText: 'text-[#6B4A35]',
  accentBorder: 'border-[#EAD7A3]',

  cardBg: 'bg-[#F1E3C8]/75 backdrop-blur-md',
  cardBorder: 'border-[#EAD7A3]',
  cardText: 'text-[#1A1612]',

  paperTexture: true,
  dividerColor: 'bg-[#C4A962]',

  countdownBg: 'bg-[#CDB88E]/20',
  rsvpInputBg: 'bg-[#F1E3C8]',
  storyLeftBg: 'bg-[#E8D7B8]',
  storyRightBg: 'bg-[#F1E3C8]',

  dressCodeSwatches: ['#CDB88E', '#C4A962', '#EAD7A3', '#D9C4A3', '#D8B6A4', '#8A8F6A', '#6B4A35'],

  bgSolid: '#E8D7B8',
  bgGlows: ['#C4A962', '#EAD7A3', '#CDB88E'],
  heroOverlay: 'from-[#0D0A07]/30 via-transparent to-[#E8D7B8]',
};
