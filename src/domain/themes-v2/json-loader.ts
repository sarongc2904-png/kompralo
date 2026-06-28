import type { InvitationThemeV2, ThemeIdV2 } from '@/domain/themes-v2/types';
import type { ThemeCatalogEntry } from '@/domain/themes-v2/themesCatalog';
import {
  validateTemplateJson,
  templateJsonToThemeV2,
  templateJsonToCatalogEntry,
} from '@/domain/themes-v2/template-schema';

// Static imports — bundled at compile time, zero runtime fetch
import ivoryEditorial      from './templates-json/ivory-editorial.json';
import pastelRose          from './templates-json/pastel-rose-editorial.json';
import pastelSage          from './templates-json/pastel-sage-editorial.json';
import pastelSky           from './templates-json/pastel-sky-editorial.json';
import luxuryChampagne     from './templates-json/luxury-champagne.json';
import modernPastel        from './templates-json/modern-pastel.json';
import gardenRomance       from './templates-json/garden-romance.json';
import bohoTerracotta      from './templates-json/boho-terracotta.json';
import blackTie            from './templates-json/black-tie.json';
import editorial           from './templates-json/editorial.json';
import luxuryGold          from './templates-json/luxury-gold.json';
import floral              from './templates-json/floral.json';
import modernDark          from './templates-json/modern-dark.json';
import blancoLinea         from './templates-json/blanco-linea.json';
import gatsbyDorado        from './templates-json/gatsby-dorado.json';
import talaveraAlta        from './templates-json/talavera-alta.json';
import solYMar             from './templates-json/sol-y-mar.json';
import tierraNocturna      from './templates-json/tierra-nocturna.json';
import rosaAntiguo         from './templates-json/rosa-antiguo.json';
import cobreUrbano         from './templates-json/cobre-urbano.json';
import kansoZen            from './templates-json/kanso-zen.json';
import lavandaProvenza     from './templates-json/lavanda-provenza.json';
import oroSombra           from './templates-json/oro-sombra.json';

const TEMPLATES_JSON = [
  ivoryEditorial,
  pastelRose,
  pastelSage,
  pastelSky,
  luxuryChampagne,
  modernPastel,
  gardenRomance,
  bohoTerracotta,
  blackTie,
  editorial,
  luxuryGold,
  floral,
  modernDark,
  blancoLinea,
  gatsbyDorado,
  talaveraAlta,
  solYMar,
  tierraNocturna,
  rosaAntiguo,
  cobreUrbano,
  kansoZen,
  lavandaProvenza,
  oroSombra,
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
