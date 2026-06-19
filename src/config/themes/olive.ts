import { Theme } from './types';

// ─── AZURE BLUE ───────────────────────────────────────────────────────────────
// Aesthetic: Mediterranean coast, deep navy & powder blue, silver accents.
// Playfair Display italic headings + Lora literary body.
export const oliveTheme: Theme = {
  id: 'olive',
  name: 'Azure Blue',
  bodyBg: 'bg-gradient-to-br from-[#EEF3FA] via-[#DDE8F5] to-[#C8D8EE]',
  bodyText: 'text-[#0F1E35]',
  headingFont: 'font-serif italic',
  bodyFont: 'font-literary',

  accentBg: 'bg-[#2155A3] hover:bg-[#1A4488]',
  accentText: 'text-[#2155A3]',
  accentBorder: 'border-[#8AAED6]',

  cardBg: 'bg-[#F5F9FF]/85 backdrop-blur-md',
  cardBorder: 'border-[#8AAED6]',
  cardText: 'text-[#0F1E35]',

  paperTexture: true,
  dividerColor: 'bg-[#4A7EC0]',

  countdownBg: 'bg-[#DDE8F5]',
  rsvpInputBg: 'bg-[#EEF3FA]',
  storyLeftBg: 'bg-[#DDE8F5]',
  storyRightBg: 'bg-[#F5F9FF]',

  dressCodeSwatches: ['#EEF3FA', '#8AAED6', '#4A7EC0', '#2155A3', '#0F1E35'],

  bgSolid: '#DDE8F5',
  bgGlows: ['#4A7EC0', '#2155A3', '#8AAED6'],
  heroOverlay: 'from-[#EEF3FA]/30 via-transparent to-[#EEF3FA]',
};
