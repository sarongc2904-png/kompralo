import type { InvitationThemeV2, ThemeIdV2 } from '@/domain/themes-v2/types';
import { luxuryGoldTheme } from '@/domain/themes-v2/themes/luxury-gold';
import { editorialTheme } from '@/domain/themes-v2/themes/editorial';
import { floralTheme } from '@/domain/themes-v2/themes/floral';
import { modernDarkTheme } from '@/domain/themes-v2/themes/modern-dark';

export const defaultThemeIdV2: ThemeIdV2 = 'editorial';

export const themeRegistryV2: Record<ThemeIdV2, InvitationThemeV2> = {
  'luxury-gold': luxuryGoldTheme,
  'editorial':   editorialTheme,
  'floral':      floralTheme,
  'modern-dark': modernDarkTheme,
};

/**
 * Resolve a theme by id. Falls back to the default theme if the id is unknown.
 * Accepts any string so callers don't need to cast — unknown ids silently fall back.
 */
export function resolveTheme(themeId?: string | null): InvitationThemeV2 {
  if (!themeId) return themeRegistryV2[defaultThemeIdV2];
  return themeRegistryV2[themeId as ThemeIdV2] ?? themeRegistryV2[defaultThemeIdV2];
}

export const availableThemesV2: InvitationThemeV2[] = Object.values(themeRegistryV2);
