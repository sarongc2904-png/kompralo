import type { CSSProperties } from 'react';
import type { EventCategory } from '@/domain/invitations/types';

export type ThemeId = 'champagne' | 'floral' | 'modern' | 'azure'
  | 'ivory-editorial' | 'pastel-rose-editorial' | 'pastel-sage-editorial' | 'pastel-sky-editorial'
  | 'luxury-gold' | 'luxury-champagne' | 'editorial'; // V2 theme aliases mapped to V1

export type ThemeAnimationPreset =
  | 'cinematic-soft'
  | 'botanical-romance'
  | 'editorial-minimal'
  | 'azure-elegant';

export interface ThemeColors {
  pageBackground: string;
  surface: string;
  surfaceAlt: string;
  textPrimary: string;
  textSecondary: string;
  accent: string;
  accentSoft: string;
  border: string;
  overlay: string;
}

export interface ThemeTypography {
  headingFont: string;
  bodyFont: string;
  scriptFont: string;
}

export interface ThemeBackgrounds {
  main: string;
  hero: string;
  sections: string;
  storyBook: string;
  gallery: string;
  final: string;
}

export interface ThemeTextures {
  paper: string;
  grain: string;
  leather?: string;
}

export interface ThemeBorders {
  subtle: string;
  accent: string;
  strong: string;
  radiusSm: number;
  radiusMd: number;
  radiusLg: number;
}

export interface ThemeShadows {
  soft: string;
  card: string;
  elevated: string;
  book: string;
}

export interface ThemeEffects {
  glass: string;
  paperTexture: boolean;
  grain: boolean;
  particles: boolean;
  parallax: boolean;
  lightSweep: boolean;
}

export interface ThemeAnimations {
  introPreset: ThemeAnimationPreset;
  sectionReveal: string;
  galleryMotion: string;
  storyTransition: string;
  hoverMotion: string;
}

export interface ThemeAssets {
  backgroundLayer1: string;
  backgroundLayer2: string;
  backgroundLayer3: string;
  heroFallback?: string;
  texture?: string;
}

export interface ThemeLegacyClasses {
  bodyBg: string;
  bodyText: string;
  headingFont: string;
  bodyFont: string;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  cardBg: string;
  cardBorder: string;
  cardText: string;
  dividerColor: string;
  countdownBg: string;
  rsvpInputBg: string;
  storyLeftBg: string;
  storyRightBg: string;
  heroOverlay: string;
}

export interface InvitationTheme extends ThemeLegacyClasses {
  id: ThemeId;
  name: string;
  description: string;
  categorySupport: EventCategory[];
  colors: ThemeColors;
  typography: ThemeTypography;
  backgrounds: ThemeBackgrounds;
  textures: ThemeTextures;
  borders: ThemeBorders;
  shadows: ThemeShadows;
  effects: ThemeEffects;
  animations: ThemeAnimations;
  assets: ThemeAssets;
  paperTexture: boolean;
  dressCodeSwatches: string[];
  bgSolid: string;
  bgGlows: string[];
  cssVariables: Record<string, string>;
}

export type Theme = InvitationTheme;

export function createThemeCssVariables(theme: InvitationTheme): CSSProperties {
  return theme.cssVariables as CSSProperties;
}
