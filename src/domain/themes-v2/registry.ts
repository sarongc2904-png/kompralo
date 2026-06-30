import type { InvitationThemeV2, ThemeIdV2 } from '@/domain/themes-v2/types';
import { ivoryEditorialTheme }       from '@/domain/themes-v2/themes/ivory-editorial';
import { FEATURE_FLAGS }             from '@/lib/feature-flags';
import { loadTemplatesFromJson }     from '@/domain/themes-v2/json-loader';

export const defaultThemeIdV2: ThemeIdV2 = 'ivory-editorial';

const legacyRegistry: Record<ThemeIdV2, InvitationThemeV2> = {
  'ivory-editorial': ivoryEditorialTheme,
};

export const themeRegistryV2: Record<ThemeIdV2, InvitationThemeV2> = FEATURE_FLAGS.templatesAsJson
  ? loadTemplatesFromJson().registry
  : legacyRegistry;

/**
 * Resolve a theme by id. Falls back to the default theme if the id is unknown.
 * Accepts any string so callers don't need to cast — unknown ids silently fall back.
 */
export function resolveTheme(themeId?: string | null): InvitationThemeV2 {
  if (!themeId) return themeRegistryV2[defaultThemeIdV2];
  return themeRegistryV2[themeId as ThemeIdV2] ?? themeRegistryV2[defaultThemeIdV2];
}

export const availableThemesV2: InvitationThemeV2[] = Object.values(themeRegistryV2);
