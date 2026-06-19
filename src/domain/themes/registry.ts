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
};

export function getThemeById(themeId?: string | null): InvitationTheme {
  if (!themeId) return themesById[defaultThemeId];
  return themesById[themeId as ThemeId] ?? themesById[defaultThemeId];
}

export const availableThemes = Object.values(themesById);
