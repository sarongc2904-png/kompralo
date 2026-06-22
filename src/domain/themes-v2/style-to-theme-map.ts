import type { ThemeIdV2 } from '@/domain/themes-v2/types';

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
  minimalista: 'modern-pastel',
  jardín: 'garden-romance',
  playa: 'boho-terracotta',
  clásico: 'luxury-champagne',
  moderno: 'modern-pastel',
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
