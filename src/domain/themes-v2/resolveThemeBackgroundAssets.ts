import type { InvitationThemeV2 } from '@/domain/themes-v2/types';

export interface ThemeBackgroundAssets {
  layer1: string;
  layer2: string;
  layer3: string;
}

const FALLBACK: ThemeBackgroundAssets = {
  layer1: '/layers/bg_layer1_champagne.png',
  layer2: '/layers/bg_layer2_champagne.png',
  layer3: '/layers/bg_layer3_champagne.png',
};

/**
 * Resolves the three parallax background asset URLs from a V2 theme.
 * Falls back to champagne assets when the theme's own assets are undefined.
 */
export function resolveThemeBackgroundAssets(theme: InvitationThemeV2): ThemeBackgroundAssets {
  const { assets } = theme;
  return {
    layer1: assets?.backgroundLayer1 || FALLBACK.layer1,
    layer2: assets?.backgroundLayer2 || FALLBACK.layer2,
    layer3: assets?.backgroundLayer3 || FALLBACK.layer3,
  };
}
