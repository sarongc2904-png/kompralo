import type { InvitationThemeV2, ThemeIdV2 } from '@/domain/themes-v2/types';
import { luxuryGoldTheme }           from '@/domain/themes-v2/themes/luxury-gold';
import { editorialTheme }            from '@/domain/themes-v2/themes/editorial';
import { floralTheme }               from '@/domain/themes-v2/themes/floral';
import { modernDarkTheme }           from '@/domain/themes-v2/themes/modern-dark';
import { ivoryEditorialTheme }       from '@/domain/themes-v2/themes/ivory-editorial';
import { luxuryChampagneTheme }      from '@/domain/themes-v2/themes/luxury-champagne';

import { gardenRomanceTheme }        from '@/domain/themes-v2/themes/garden-romance';
import { bohoTerracottaTheme }       from '@/domain/themes-v2/themes/boho-terracotta';
import { blackTieTheme }             from '@/domain/themes-v2/themes/black-tie';
import { pastelRoseEditorialTheme }  from '@/domain/themes-v2/themes/pastel-rose-editorial';
import { pastelSageEditorialTheme }  from '@/domain/themes-v2/themes/pastel-sage-editorial';
import { pastelSkyEditorialTheme }   from '@/domain/themes-v2/themes/pastel-sky-editorial';
import { FEATURE_FLAGS }             from '@/lib/feature-flags';
import { loadTemplatesFromJson }     from '@/domain/themes-v2/json-loader';

export const defaultThemeIdV2: ThemeIdV2 = 'ivory-editorial';

const legacyRegistry: Record<ThemeIdV2, InvitationThemeV2> = {
  'luxury-gold':           luxuryGoldTheme,
  'editorial':             editorialTheme,
  'floral':                floralTheme,
  'modern-dark':           modernDarkTheme,
  'ivory-editorial':       ivoryEditorialTheme,
  'luxury-champagne':      luxuryChampagneTheme,
  'garden-romance':        gardenRomanceTheme,
  'boho-terracotta':       bohoTerracottaTheme,
  'black-tie':             blackTieTheme,
  'pastel-rose-editorial': pastelRoseEditorialTheme,
  'pastel-sage-editorial': pastelSageEditorialTheme,
  'pastel-sky-editorial':  pastelSkyEditorialTheme,
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
