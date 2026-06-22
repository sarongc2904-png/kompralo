import { azureTheme } from '@/domain/themes/themes/azure';
import { champagneTheme } from '@/domain/themes/themes/champagne';
import { floralTheme } from '@/domain/themes/themes/floral';
import { modernTheme } from '@/domain/themes/themes/modern';
import type { InvitationTheme, ThemeId } from '@/domain/themes/types';

export const defaultThemeId: ThemeId = 'champagne';

export const themesById: Record<ThemeId, InvitationTheme> = {
  champagne: champagneTheme,
  floral: floralTheme,
  modern: modernTheme,
  azure: azureTheme,
  // V2 theme mappings to V1 (for backwards compatibility and new ivory-editorial)
  'ivory-editorial': champagneTheme,        // ivory-editorial is premium champagne, uses same V1 base
  'pastel-rose-editorial': champagneTheme,  // pastel variants use same editorial layout
  'pastel-sage-editorial': champagneTheme,
  'pastel-sky-editorial': champagneTheme,
  'luxury-gold': champagneTheme,            // legacy gold maps to champagne
  'luxury-champagne': champagneTheme,
  'editorial': champagneTheme,
};

export function getThemeById(themeId?: string | null): InvitationTheme {
  if (!themeId) return themesById[defaultThemeId];
  return themesById[themeId as ThemeId] ?? themesById[defaultThemeId];
}

export const availableThemes = Object.values(themesById);
