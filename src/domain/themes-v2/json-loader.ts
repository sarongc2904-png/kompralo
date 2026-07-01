import type { InvitationThemeV2, ThemeIdV2 } from '@/domain/themes-v2/types';
import type { ThemeCatalogEntry } from '@/domain/themes-v2/themesCatalog';
import {
  validateTemplateJson,
  templateJsonToThemeV2,
  templateJsonToCatalogEntry,
} from '@/domain/themes-v2/template-schema';

// Static imports — bundled at compile time, zero runtime fetch
import ivoryEditorial from './templates-json/ivory-editorial.json';
import blancoDeluxe   from './templates-json/blanco-deluxe.json';
import rosaAntiguo    from './templates-json/rosa-antiguo.json';

const TEMPLATES_JSON = [
  ivoryEditorial,
  blancoDeluxe,
  rosaAntiguo,
] as unknown[];

// ─── Loader ──────────────────────────────────────────────────────────────────

export interface JsonTemplatesResult {
  registry: Record<ThemeIdV2, InvitationThemeV2>;
  catalog: ThemeCatalogEntry[];
}

export function loadTemplatesFromJson(): JsonTemplatesResult {
  const registry = {} as Record<ThemeIdV2, InvitationThemeV2>;
  const catalog: ThemeCatalogEntry[] = [];

  for (const raw of TEMPLATES_JSON) {
    const result = validateTemplateJson(raw);
    if (!result.valid) {
      const id = (raw as Record<string, unknown>)?.id ?? '(unknown)';
      console.error(`[json-loader] Invalid template "${id}":`, result.errors);
      continue;
    }
    const t = result.template;
    registry[t.id as ThemeIdV2] = templateJsonToThemeV2(t);
    catalog.push(templateJsonToCatalogEntry(t));
  }

  // featured-first ordering mirrors getFeaturedWeddingThemes() behaviour
  catalog.sort((a, b) => {
    const aFeatured = TEMPLATES_JSON.some(
      (r) => (r as Record<string, unknown>).id === a.id &&
              ((r as Record<string, unknown>).catalog as Record<string, unknown>)?.featured === true
    );
    const bFeatured = TEMPLATES_JSON.some(
      (r) => (r as Record<string, unknown>).id === b.id &&
              ((r as Record<string, unknown>).catalog as Record<string, unknown>)?.featured === true
    );
    if (aFeatured === bFeatured) return 0;
    return aFeatured ? -1 : 1;
  });

  return { registry, catalog };
}
