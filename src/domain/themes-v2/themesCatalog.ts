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
 */
export function getFeaturedWeddingThemes(): ThemeCatalogEntry[] {
  return weddingThemesCatalog;
}
