/**
 * Verifica que los JSON de templates-json producen objetos idénticos
 * a los objetos TypeScript legacy en src/domain/themes-v2/themes/.
 *
 * Uso:
 *   npx tsx scripts/verify-json-parity.ts
 *
 * Salida esperada: "✅ All X themes match perfectly."
 */

import { ivoryEditorialTheme }      from '../src/domain/themes-v2/themes/ivory-editorial';
import { validateTemplateJson, templateJsonToThemeV2 } from '../src/domain/themes-v2/template-schema';
import type { InvitationThemeV2 }   from '../src/domain/themes-v2/types';

import ivoryEditorialJson from '../src/domain/themes-v2/templates-json/ivory-editorial.json';

// ─── Pairs to compare ────────────────────────────────────────────────────────

const PAIRS: Array<{ id: string; legacy: InvitationThemeV2; json: unknown }> = [
  { id: 'ivory-editorial', legacy: ivoryEditorialTheme, json: ivoryEditorialJson },
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
