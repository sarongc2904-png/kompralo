import type { ThemeIdV2 } from '@/domain/themes-v2/types';

/**
 * Wizard theme options — shown as visual cards in the Quick Start wizard.
 * Maps to valid ThemeIdV2 values.
 */
export const WIZARD_THEME_OPTIONS = [
  {
    id: 'pastel-rose-editorial' as ThemeIdV2,
    label: 'Romántico floral',
    desc: 'Flores y rosas pastel',
    accent: '#D4829A',
    bg: '#FDF5F7',
  },
  {
    id: 'pastel-sage-editorial' as ThemeIdV2,
    label: 'Natural elegante',
    desc: 'Verde y eucalipto',
    accent: '#7A9E7E',
    bg: '#F5FAF6',
  },
  {
    id: 'pastel-sky-editorial' as ThemeIdV2,
    label: 'Cielo pastel',
    desc: 'Azul celeste',
    accent: '#6F8FBF',
    bg: '#F5FAFF',
  },
  {
    id: 'ivory-editorial' as ThemeIdV2,
    label: 'Editorial clásico',
    desc: 'Dorado y marfil',
    accent: '#B99752',
    bg: '#FAF7F2',
  },
  {
    id: 'luxury-champagne' as ThemeIdV2,
    label: 'Champagne elegante',
    desc: 'Champagne y oro',
    accent: '#C9A84C',
    bg: '#FBF8F1',
  },
] as const;

/**
 * Wedding style options — user-facing friendly names.
 * Mapped to concrete ThemeIdV2 values for rendering.
 */
export const WEDDING_STYLES = [
  'elegante',
  'minimalista',
  'jardín',
  'playa',
  'clásico',
  'moderno',
] as const;

export type WeddingStyle = typeof WEDDING_STYLES[number];

/**
 * Map user-selected wedding style to a ThemeIdV2.
 * All values are read-only at runtime.
 */
export const WEDDING_STYLE_TO_THEME_MAP = {
  elegante: 'ivory-editorial',
  minimalista: 'pastel-sky-editorial',
  jardín: 'garden-romance',
  playa: 'boho-terracotta',
  clásico: 'luxury-champagne',
  moderno: 'pastel-sky-editorial',
} as const satisfies Record<WeddingStyle, ThemeIdV2>;

/**
 * Resolve a wedding style to its corresponding ThemeIdV2.
 * Always returns a valid ThemeIdV2.
 *
 * @param style — wedding style selected by user
 * @returns valid ThemeIdV2 or 'ivory-editorial' if style is unknown
 */
export function resolveWeddingThemeId(style: WeddingStyle | string): ThemeIdV2 {
  if (style in WEDDING_STYLE_TO_THEME_MAP) {
    return WEDDING_STYLE_TO_THEME_MAP[style as WeddingStyle];
  }
  return 'ivory-editorial';
}
