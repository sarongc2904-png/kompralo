export type {
  ThemeId,
  ThemeAnimationPreset,
  ThemeColors,
  ThemeTypography,
  ThemeBackgrounds,
  ThemeTextures,
  ThemeBorders,
  ThemeShadows,
  ThemeEffects,
  ThemeAnimations,
  ThemeAssets,
  ThemeLegacyClasses,
  InvitationTheme,
  Theme,
} from '@/domain/themes/types';

export { createThemeCssVariables } from '@/domain/themes/types';

export {
  defaultThemeId,
  themesById,
  getThemeById,
  availableThemes,
} from '@/domain/themes/registry';
