import type { ThemeIdV2 } from '@/domain/themes-v2/types';
import { FEATURE_FLAGS } from '@/lib/feature-flags';
import { loadTemplatesFromJson } from '@/domain/themes-v2/json-loader';

export interface ThemeCatalogEntry {
  id: ThemeIdV2;
  label: string;
  description: string;
  category: 'wedding' | 'traditional' | 'modern' | 'playful';
  previewColor: string;
  accentColor: string;
  isNewTheme?: boolean;
}

/**
 * Wedding themes catalog — metadata for UI selection and preview
 * Organized by visual style for editor theme selector
 */
const legacyCatalog: ThemeCatalogEntry[] = [
  {
    id: 'ivory-editorial',
    label: 'Ivory Editorial Romance',
    description: 'Boda premium editorial con papelería fina, dorados suaves y quiet luxury',
    category: 'traditional',
    previewColor: '#FBF7EF',
    accentColor: '#C8A75D',
    isNewTheme: true,
  },
  {
    id: 'luxury-champagne',
    label: 'Luxury Champagne',
    description: 'Lujo cálido con champagne elegante, dorado soft y tarjetas translúcidas',
    category: 'traditional',
    previewColor: '#FDF9F4',
    accentColor: '#D4A574',
    isNewTheme: true,
  },
  {
    id: 'modern-pastel',
    label: 'Modern Pastel',
    description: 'Limpio, minimalista y romántico con colores pastel suaves',
    category: 'modern',
    previewColor: '#FAF8F6',
    accentColor: '#D9A7A7',
    isNewTheme: true,
  },
  {
    id: 'garden-romance',
    label: 'Garden Romance',
    description: 'Floral y natural con verde sage, blush rosado y luz cálida',
    category: 'playful',
    previewColor: '#F8FAF7',
    accentColor: '#A8BFAA',
    isNewTheme: true,
  },
  {
    id: 'boho-terracotta',
    label: 'Boho Terracotta',
    description: 'Bohemio elegante con terracota suave, arena cálida y decoraciones artesanales',
    category: 'playful',
    previewColor: '#FAF6F2',
    accentColor: '#C89060',
    isNewTheme: true,
  },
  {
    id: 'black-tie',
    label: 'Black Tie Elegant',
    description: 'Elegancia nocturna con negro suave, champagne sutil y editorial formal',
    category: 'traditional',
    previewColor: '#0F0D0A',
    accentColor: '#E8D4A0',
    isNewTheme: true,
  },
  // Pastel editorial variants
  {
    id: 'pastel-rose-editorial',
    label: 'Pastel Rose Editorial',
    description: 'Romántico con tonos pastel: suave, elegante y delicado',
    category: 'traditional',
    previewColor: '#FFF7F8',
    accentColor: '#B76E79',
    isNewTheme: true,
  },
  {
    id: 'pastel-sage-editorial',
    label: 'Pastel Sage Editorial',
    description: 'Natural con tonos verdes: jardín, fresco y sereno',
    category: 'traditional',
    previewColor: '#F6FAF6',
    accentColor: '#6F8F72',
    isNewTheme: true,
  },
  {
    id: 'pastel-sky-editorial',
    label: 'Pastel Sky Editorial',
    description: 'Moderno con tonos celestes: limpio, luminoso y fresco',
    category: 'modern',
    previewColor: '#F5FAFF',
    accentColor: '#6F8FBF',
    isNewTheme: true,
  },
  {
    id: 'oro-sombra',
    label: 'Oro Sombra',
    description: 'Lujo oscuro y dram�tico: oro envejecido sobre negro para galas de noche',
    category: 'traditional',
    previewColor: '#070606',
    accentColor: '#D4AF37',
    isNewTheme: true,
  },
  // Legacy themes (kept for backwards compatibility, not featured in wedding selector)
  {
    id: 'editorial',
    label: 'Editorial',
    description: 'Tema clásico editorial',
    category: 'traditional',
    previewColor: '#F5F1EA',
    accentColor: '#C5A880',
  },
  {
    id: 'luxury-gold',
    label: 'Luxury Gold',
    description: 'Tema de lujo con dorado',
    category: 'traditional',
    previewColor: '#F0E8D8',
    accentColor: '#C4A962',
  },
];

export const weddingThemesCatalog: ThemeCatalogEntry[] = FEATURE_FLAGS.templatesAsJson
  ? loadTemplatesFromJson().catalog
  : legacyCatalog;

/**
 * Get catalog entry by theme ID (safe lookup with fallback)
 */
export function getThemeCatalogEntry(themeId: ThemeIdV2 | null | undefined): ThemeCatalogEntry | null {
  if (!themeId) return null;
  return weddingThemesCatalog.find((entry) => entry.id === themeId) ?? null;
}

/**
 * Get all featured wedding themes for editor UI
 * Currently showing: ivory-editorial + 3 pastel variants
 * TODO: Enable 'luxury-champagne' when ready (modern classic variant)
 * TODO: Enable 'garden-romance' when ready (romantic floral)
 */
export function getFeaturedWeddingThemes(): ThemeCatalogEntry[] {
  return weddingThemesCatalog.filter((theme) =>
    ['ivory-editorial', 'pastel-rose-editorial', 'pastel-sage-editorial', 'pastel-sky-editorial'].includes(theme.id)
  );
}
