import type { EventCategory } from '@/domain/invitations/types';

// ─── Theme ID ────────────────────────────────────────────────────────────────

export type ThemeIdV2 = 'ivory-editorial' | 'blanco-deluxe';

// ─── Color palette ───────────────────────────────────────────────────────────

export interface ThemeColors {
  pageBackground: string;
  surface: string;
  surfaceAlt: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  accent: string;
  accentSoft: string;
  accentHover: string;
  border: string;
  borderStrong: string;
  overlay: string;
}

// ─── Typography ──────────────────────────────────────────────────────────────

export interface ThemeTypography {
  /** CSS font-family value — used in inline styles */
  headingFamily: string;
  bodyFamily: string;
  scriptFamily: string;
  headingWeight: string;
  headingTracking: string;
  bodyTracking: string;
  /** Tailwind utility classes — used in JSX className */
  headingClass: string;
  bodyClass: string;
  scriptClass: string;
}

// ─── Spacing ─────────────────────────────────────────────────────────────────

export interface ThemeSpacing {
  sectionPaddingY: string;
  cardPaddingX: string;
  cardPaddingY: string;
  stackGap: string;
}

// ─── Shapes ──────────────────────────────────────────────────────────────────

export type ThemeCardStyle = 'rounded' | 'sharp' | 'pill';

export interface ThemeShapes {
  radiusSm: string;
  radiusMd: string;
  radiusLg: string;
  radiusXl: string;
  radiusFull: string;
  cardStyle: ThemeCardStyle;
}

// ─── Effects ─────────────────────────────────────────────────────────────────

export interface ThemeEffects {
  glassBlur: string;
  glassSaturation: string;
  glassBackground: string;
  paperTexture: boolean;
  grain: boolean;
  particles: boolean;
  parallax: boolean;
  lightSweep: boolean;
  grainIntensity: number;
}

// ─── Shadows ─────────────────────────────────────────────────────────────────

export interface ThemeShadows {
  soft: string;
  card: string;
  elevated: string;
  book: string;
}

// ─── Button style ────────────────────────────────────────────────────────────

export interface ThemeButtonStyle {
  background: string;
  text: string;
  border: string;
  hoverBackground: string;
  hoverText: string;
  borderRadius: string;
  fontClass: string;
  shadow: string;
  paddingX: string;
  paddingY: string;
}

// ─── Divider style ───────────────────────────────────────────────────────────

export type ThemeDividerVariant = 'line' | 'ornamental' | 'dotted' | 'gradient';

export interface ThemeDividerStyle {
  color: string;
  variant: ThemeDividerVariant;
  thickness: string;
  opacity: number;
  ornamentChar?: string;
  gradientFrom?: string;
  gradientTo?: string;
}

// ─── Backgrounds ─────────────────────────────────────────────────────────────

export interface ThemeBackgroundsV2 {
  main: string;
  hero: string;
  sections: string;
  storyBook: string;
  gallery: string;
  final: string;
}

// ─── Assets ──────────────────────────────────────────────────────────────────

export interface ThemeAssetsV2 {
  backgroundLayer1: string;
  backgroundLayer2: string;
  backgroundLayer3: string;
  texture?: string;
  textureSize?: string;
  textureRepeat?: string;
  textureOpacity?: number;
  textureStartAfterHero?: boolean;
}

// ─── Root theme object ───────────────────────────────────────────────────────

export interface InvitationThemeV2 {
  id: string;
  name: string;
  description: string;
  categorySupport: EventCategory[];

  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: ThemeSpacing;
  shapes: ThemeShapes;
  effects: ThemeEffects;
  shadows: ThemeShadows;
  button: ThemeButtonStyle;
  divider: ThemeDividerStyle;
  backgrounds: ThemeBackgroundsV2;
  assets: ThemeAssetsV2;

  dressCodeSwatches: string[];

  /**
   * CSS custom properties injected at the theme root.
   * All keys use the `--v2-` prefix to avoid collisions with v1 vars.
   */
  cssVariables: Record<string, string>;
}
