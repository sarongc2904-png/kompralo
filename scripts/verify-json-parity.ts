/**
 * Verifica que los JSON de templates-json producen objetos idénticos
 * a los objetos TypeScript legacy en src/domain/themes-v2/themes/.
 *
 * Uso:
 *   npx tsx scripts/verify-json-parity.ts
 *
 * Salida esperada: "✅ All X themes match perfectly."
 */

import { luxuryGoldTheme }          from '../src/domain/themes-v2/themes/luxury-gold';
import { editorialTheme }           from '../src/domain/themes-v2/themes/editorial';
import { floralTheme }              from '../src/domain/themes-v2/themes/floral';
import { modernDarkTheme }          from '../src/domain/themes-v2/themes/modern-dark';
import { ivoryEditorialTheme }      from '../src/domain/themes-v2/themes/ivory-editorial';
import { luxuryChampagneTheme }     from '../src/domain/themes-v2/themes/luxury-champagne';
import { modernPastelTheme }        from '../src/domain/themes-v2/themes/modern-pastel';
import { gardenRomanceTheme }       from '../src/domain/themes-v2/themes/garden-romance';
import { bohoTerracottaTheme }      from '../src/domain/themes-v2/themes/boho-terracotta';
import { blackTieTheme }            from '../src/domain/themes-v2/themes/black-tie';
import { pastelRoseEditorialTheme } from '../src/domain/themes-v2/themes/pastel-rose-editorial';
import { pastelSageEditorialTheme } from '../src/domain/themes-v2/themes/pastel-sage-editorial';
import { pastelSkyEditorialTheme }  from '../src/domain/themes-v2/themes/pastel-sky-editorial';
import { validateTemplateJson, templateJsonToThemeV2 } from '../src/domain/themes-v2/template-schema';
import type { InvitationThemeV2 }   from '../src/domain/themes-v2/types';

import ivoryEditorialJson      from '../src/domain/themes-v2/templates-json/ivory-editorial.json';
import pastelRoseJson          from '../src/domain/themes-v2/templates-json/pastel-rose-editorial.json';
import pastelSageJson          from '../src/domain/themes-v2/templates-json/pastel-sage-editorial.json';
import pastelSkyJson           from '../src/domain/themes-v2/templates-json/pastel-sky-editorial.json';
import luxuryChampagneJson     from '../src/domain/themes-v2/templates-json/luxury-champagne.json';
import modernPastelJson        from '../src/domain/themes-v2/templates-json/modern-pastel.json';
import gardenRomanceJson       from '../src/domain/themes-v2/templates-json/garden-romance.json';
import bohoTerracottaJson      from '../src/domain/themes-v2/templates-json/boho-terracotta.json';
import blackTieJson            from '../src/domain/themes-v2/templates-json/black-tie.json';
import editorialJson           from '../src/domain/themes-v2/templates-json/editorial.json';
import luxuryGoldJson          from '../src/domain/themes-v2/templates-json/luxury-gold.json';
import floralJson              from '../src/domain/themes-v2/templates-json/floral.json';
import modernDarkJson          from '../src/domain/themes-v2/templates-json/modern-dark.json';

// ─── Pairs to compare ────────────────────────────────────────────────────────

const PAIRS: Array<{ id: string; legacy: InvitationThemeV2; json: unknown }> = [
  { id: 'ivory-editorial',       legacy: ivoryEditorialTheme,      json: ivoryEditorialJson },
  { id: 'pastel-rose-editorial', legacy: pastelRoseEditorialTheme, json: pastelRoseJson },
  { id: 'pastel-sage-editorial', legacy: pastelSageEditorialTheme, json: pastelSageJson },
  { id: 'pastel-sky-editorial',  legacy: pastelSkyEditorialTheme,  json: pastelSkyJson },
  { id: 'luxury-champagne',      legacy: luxuryChampagneTheme,     json: luxuryChampagneJson },
  { id: 'modern-pastel',         legacy: modernPastelTheme,        json: modernPastelJson },
  { id: 'garden-romance',        legacy: gardenRomanceTheme,       json: gardenRomanceJson },
  { id: 'boho-terracotta',       legacy: bohoTerracottaTheme,      json: bohoTerracottaJson },
  { id: 'black-tie',             legacy: blackTieTheme,            json: blackTieJson },
  { id: 'editorial',             legacy: editorialTheme,           json: editorialJson },
  { id: 'luxury-gold',           legacy: luxuryGoldTheme,          json: luxuryGoldJson },
  { id: 'floral',                legacy: floralTheme,              json: floralJson },
  { id: 'modern-dark',           legacy: modernDarkTheme,          json: modernDarkJson },
];

// ─── Deep diff helper ────────────────────────────────────────────────────────

function deepDiff(
  a: unknown,
  b: unknown,
  path: string,
  diffs: string[],
): void {
  if (a === b) return;
  if (typeof a !== typeof b) {
    diffs.push(`${path}: type mismatch (${typeof a} vs ${typeof b})`);
    return;
  }
  if (typeof a === 'object' && a !== null && b !== null) {
    if (Array.isArray(a) !== Array.isArray(b)) {
      diffs.push(`${path}: one is array, other is not`);
      return;
    }
    const aKeys = Object.keys(a as object);
    const bKeys = Object.keys(b as object);
    const allKeys = new Set([...aKeys, ...bKeys]);
    for (const key of allKeys) {
      deepDiff(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
        `${path}.${key}`,
        diffs,
      );
    }
    return;
  }
  diffs.push(`${path}: ${JSON.stringify(a)} vs ${JSON.stringify(b)}`);
}

// ─── Main ────────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;

for (const { id, legacy, json } of PAIRS) {
  const result = validateTemplateJson(json);
  if (!result.valid) {
    console.error(`❌ ${id} — JSON validation failed:`, result.errors);
    failed++;
    continue;
  }

  const fromJson = templateJsonToThemeV2(result.template);
  const diffs: string[] = [];
  deepDiff(legacy, fromJson, id, diffs);

  if (diffs.length === 0) {
    console.log(`✅ ${id}`);
    passed++;
  } else {
    console.error(`❌ ${id} — ${diffs.length} diff(s):`);
    for (const d of diffs) console.error(`   ${d}`);
    failed++;
  }
}

console.log(`\n${passed + failed} themes checked — ${passed} match, ${failed} differ.`);
if (failed > 0) process.exit(1);
else console.log('✅ All themes match perfectly.');
