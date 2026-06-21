// Types
export type {
  ThemeIdV2,
  ThemeColors,
  ThemeTypography,
  ThemeSpacing,
  ThemeShapes,
  ThemeCardStyle,
  ThemeEffects,
  ThemeShadows,
  ThemeButtonStyle,
  ThemeDividerStyle,
  ThemeDividerVariant,
  ThemeBackgroundsV2,
  ThemeAssetsV2,
  InvitationThemeV2,
} from '@/domain/themes-v2/types';

// Registry & resolver
export {
  defaultThemeIdV2,
  themeRegistryV2,
  resolveTheme,
  availableThemesV2,
} from '@/domain/themes-v2/registry';

// Provider & hook
export { ThemeProviderV2, useThemeV2 } from '@/domain/themes-v2/ThemeProviderV2';

// Compatibility bridge (v1 → v2)
export { ThemeProvider } from '@/domain/themes-v2/ThemeProvider';

// Asset resolver
export { resolveThemeBackgroundAssets } from '@/domain/themes-v2/resolveThemeBackgroundAssets';
export type { ThemeBackgroundAssets } from '@/domain/themes-v2/resolveThemeBackgroundAssets';

// Individual themes (for direct import when needed)
export { luxuryGoldTheme }      from '@/domain/themes-v2/themes/luxury-gold';
export { editorialTheme }       from '@/domain/themes-v2/themes/editorial';
export { floralTheme }          from '@/domain/themes-v2/themes/floral';
export { modernDarkTheme }      from '@/domain/themes-v2/themes/modern-dark';
export { ivoryEditorialTheme }  from '@/domain/themes-v2/themes/ivory-editorial';
export { luxuryChampagneTheme } from '@/domain/themes-v2/themes/luxury-champagne';
export { modernPastelTheme }    from '@/domain/themes-v2/themes/modern-pastel';
export { gardenRomanceTheme }   from '@/domain/themes-v2/themes/garden-romance';
export { bohoTerracottaTheme }  from '@/domain/themes-v2/themes/boho-terracotta';
export { blackTieTheme }        from '@/domain/themes-v2/themes/black-tie';
