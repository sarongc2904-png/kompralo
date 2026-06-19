import { Theme } from './types';

// ─── BOTANICAL FLORAL ────────────────────────────────────────────────────────
// Aesthetic: Romantic blush garden. Deep rose accents, blush backgrounds,
// Pinyon Script calligraphy headings — very feminine and dreamy.
// Think: garden wedding, pressed flowers, watercolor invitations, Laura Ashley.
export const floralTheme: Theme = {
  id: 'floral',
  name: 'Botanical Floral',
  bodyBg: 'bg-gradient-to-br from-[#FFF0EE] via-[#FDEAE6] to-[#F0D8D5]',
  bodyText: 'text-[#2C1A1A]',
  headingFont: 'font-calligraphy',   // Pinyon Script — full calligraphy romance
  bodyFont: 'font-sans',

  accentBg: 'bg-[#B85A6A] hover:bg-[#A04858]',
  accentText: 'text-[#B85A6A]',
  accentBorder: 'border-[#F0C8CC]',

  cardBg: 'bg-white/80 backdrop-blur-md',
  cardBorder: 'border-[#F0C8CC]',
  cardText: 'text-[#2C1A1A]',

  paperTexture: true,
  dividerColor: 'bg-[#E5A8B0]',

  countdownBg: 'bg-[#FFF5F5]',
  rsvpInputBg: 'bg-[#FFF8F8]',
  storyLeftBg: 'bg-[#FDEAE6]',
  storyRightBg: 'bg-white',

  dressCodeSwatches: ['#FFF0EE', '#F5C8CC', '#E5A8B0', '#B85A6A', '#7A3040'],

  bgSolid: '#FDEAE6',
  bgGlows: ['#F5C0C8', '#E8A0B0', '#F0D0D5'],
  heroOverlay: 'from-[#FFF0EE]/30 via-transparent to-[#FFF0EE]',
};
