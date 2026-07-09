/**
 * Valida un template del catálogo V2 contra el estándar actual.
 *
 * Uso:
 *   npx tsx scripts/validate-template.ts <template-id>
 *   npx tsx scripts/validate-template.ts jardin-secreto
 *
 * Reglas:
 *   1. El JSON parsea y pasa el schema V2 completo (validateTemplateJson).
 *   2. Las 15 secciones del theme + campos de catálogo presentes.
 *   3. Paleta con los 3 colores clave definidos (fondo, acento, texto) y
 *      catalog.previewColor/accentColor en formato color válido.
 *   4. Tipografías declaradas existen en el sistema de fuentes.
 *   5. Todas las URLs de assets (texture, previewImage, introBackground
 *      desktop/mobile) responden 200.
 *
 * Salida: reporte PASA/FALLA por regla. Exit code 1 si alguna falla.
 */

import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { validateTemplateJson, type TemplateJson } from '../src/domain/themes-v2/template-schema';

// ─── Sistema de fuentes (root layout + fuentes globales) ─────────────────────

const KNOWN_FONT_FAMILIES = new Set([
  // next/font en src/app/layout.tsx
  'playfair display', 'inter', 'pinyon script', 'cinzel', 'lora', 'cormorant garamond',
  // @font-face local + fuente global de nombres (src/fonts)
  'realistic nature', 'great vibes',
  // genéricas / de sistema aceptables como fallback
  'georgia', 'times new roman', 'system-ui', 'serif', 'sans-serif', 'cursive', 'monospace',
  // legacy aún referenciadas por temas archivados
  'merriweather', 'open sans',
]);

const THEME_SECTIONS = [
  'name', 'description', 'categorySupport', 'colors', 'typography', 'spacing',
  'shapes', 'effects', 'shadows', 'button', 'divider', 'backgrounds', 'assets',
  'dressCodeSwatches', 'cssVariables',
] as const;

const COLOR_RE = /^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|transparent)$/;

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface RuleResult { rule: string; ok: boolean; details: string[] }

function parseFamilies(value: string): string[] {
  // "\"Playfair Display\", Georgia, serif" → ['playfair display', 'georgia', 'serif']
  return value
    .split(',')
    .map((f) => f.trim().replace(/^["']|["']$/g, '').toLowerCase())
    .filter(Boolean);
}

async function urlOk(url: string): Promise<{ ok: boolean; status: number | string }> {
  try {
    let res = await fetch(url, { method: 'HEAD' });
    if (!res.ok) res = await fetch(url); // algunos CDNs no soportan HEAD
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: e instanceof Error ? e.message : 'fetch error' };
  }
}

// ─── Reglas ──────────────────────────────────────────────────────────────────

function ruleSchema(raw: unknown): { result: RuleResult; template: TemplateJson | null } {
  const validation = validateTemplateJson(raw);
  if (validation.valid) {
    return { result: { rule: 'Schema V2 completo', ok: true, details: [] }, template: validation.template };
  }
  return { result: { rule: 'Schema V2 completo', ok: false, details: validation.errors }, template: null };
}

function ruleSections(t: TemplateJson): RuleResult {
  const theme = t.theme as unknown as Record<string, unknown>;
  const missing = THEME_SECTIONS.filter((s) => theme[s] === undefined || theme[s] === null);
  return {
    rule: `15 secciones del theme presentes`,
    ok: missing.length === 0,
    details: missing.map((s) => `falta theme.${s}`),
  };
}

function rulePalette(t: TemplateJson): RuleResult {
  const details: string[] = [];
  const colors = t.theme.colors ?? {};
  for (const key of ['pageBackground', 'accent', 'textPrimary']) {
    const v = colors[key];
    if (!v) details.push(`colors.${key} no definido`);
    else if (!COLOR_RE.test(v)) details.push(`colors.${key} no es un color válido: "${v}"`);
  }
  for (const key of ['previewColor', 'accentColor'] as const) {
    const v = t.catalog[key];
    if (!v || !COLOR_RE.test(v)) details.push(`catalog.${key} no es un color válido: "${v}"`);
  }
  return { rule: 'Paleta (fondo, acento, texto + catálogo)', ok: details.length === 0, details };
}

function ruleFonts(t: TemplateJson): RuleResult {
  const details: string[] = [];
  const check = (label: string, value?: string) => {
    if (!value) return;
    for (const family of parseFamilies(value)) {
      if (family.startsWith('var(')) continue;
      if (!KNOWN_FONT_FAMILIES.has(family)) {
        details.push(`${label}: fuente desconocida en el sistema: "${family}"`);
      }
    }
  };
  const ty = t.theme.typography ?? {};
  check('typography.headingFamily', ty.headingFamily);
  check('typography.bodyFamily', ty.bodyFamily);
  check('typography.scriptFamily', ty.scriptFamily);
  for (const [k, v] of Object.entries(t.theme.cssVariables ?? {})) {
    if (k.startsWith('--v2-font-')) check(`cssVariables.${k}`, v);
  }
  return { rule: 'Tipografías existen en el sistema de fuentes', ok: details.length === 0, details };
}

async function ruleAssets(t: TemplateJson): Promise<RuleResult> {
  const details: string[] = [];
  // previewImage efectivo: dedicado o fallback a assets.texture (pipeline actual).
  const effectivePreview = t.theme.previewImage || t.theme.assets?.texture;
  const urls: Array<[string, string | undefined]> = [
    ['assets.texture', t.theme.assets?.texture],
    ['previewImage (efectivo)', effectivePreview],
    ['introBackground.desktop', t.theme.introBackground?.desktop],
    ['introBackground.mobile', t.theme.introBackground?.mobile],
  ];
  for (const [label, url] of urls) {
    if (!url) { details.push(`${label} no definido`); continue; }
    const { ok, status } = await urlOk(url);
    if (!ok) details.push(`${label} → ${status}: ${url}`);
  }
  return { rule: 'URLs de assets responden 200', ok: details.length === 0, details };
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const id = process.argv[2];
  if (!id) {
    console.error('Uso: npx tsx scripts/validate-template.ts <template-id>');
    process.exit(1);
  }

  const here = dirname(fileURLToPath(import.meta.url));
  const jsonPath = join(here, '..', 'src', 'domain', 'themes-v2', 'templates-json', `${id}.json`);

  let raw: unknown;
  try {
    raw = JSON.parse(readFileSync(jsonPath, 'utf8'));
  } catch (e) {
    console.error(`❌ No se pudo leer/parsear ${jsonPath}:`, e instanceof Error ? e.message : e);
    process.exit(1);
  }

  const results: RuleResult[] = [];
  const { result: schemaResult, template } = ruleSchema(raw);
  results.push(schemaResult);

  if (template) {
    results.push(ruleSections(template));
    results.push(rulePalette(template));
    results.push(ruleFonts(template));
    results.push(await ruleAssets(template));
  }

  console.log(`\nValidación de template: ${id}`);
  console.log('─'.repeat(52));
  let failed = 0;
  for (const r of results) {
    console.log(`${r.ok ? '✅ PASA ' : '❌ FALLA'}  ${r.rule}`);
    for (const d of r.details) console.log(`          · ${d}`);
    if (!r.ok) failed++;
  }
  console.log('─'.repeat(52));
  console.log(failed === 0 ? `✅ ${id}: todas las reglas pasan.` : `❌ ${id}: ${failed} regla(s) fallan.`);
  process.exit(failed === 0 ? 0 : 1);
}

main();
