import type { InvitationThemeV2, ThemeIdV2 } from '@/domain/themes-v2/types';
import type { ThemeCatalogEntry } from '@/domain/themes-v2/themesCatalog';

// ─── JSON shape ───────────────────────────────────────────────────────────────

export interface TemplateCatalogJson {
  label: string;
  description: string;
  previewColor: string;
  accentColor: string;
  category: 'wedding' | 'traditional' | 'modern' | 'playful';
  isNewTheme: boolean;
  featured: boolean;
  /**
   * false = el template existe en el registry (render/editor pueden usarlo si
   * una invitación ya lo tiene asignado) pero NO se lista en el selector de
   * plantillas. Ausente/true = seleccionable (default de los templates activos).
   */
  active?: boolean;
}

export interface TemplateThemeJson {
  name: string;
  description: string;
  categorySupport: string[];
  colors: Record<string, string>;
  typography: Record<string, string>;
  spacing: Record<string, string>;
  shapes: Record<string, unknown>;
  effects: Record<string, unknown>;
  shadows: Record<string, string>;
  button: Record<string, string>;
  divider: Record<string, unknown>;
  backgrounds: Record<string, string>;
  assets: Record<string, string>;
  /** Preview dedicado para la tarjeta del selector; si falta, cae a assets.texture. */
  previewImage?: string;
  introBackground?: { desktop: string; mobile: string };
  dressCodeSwatches: string[];
  cssVariables: Record<string, string>;
}

export interface TemplateJson {
  id: string;
  catalog: TemplateCatalogJson;
  theme: TemplateThemeJson;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function isString(v: unknown): v is string {
  return typeof v === 'string';
}

function isBoolean(v: unknown): v is boolean {
  return typeof v === 'boolean';
}

function isNumber(v: unknown): v is number {
  return typeof v === 'number';
}

function isStringRecord(v: unknown): v is Record<string, string> {
  if (typeof v !== 'object' || v === null || Array.isArray(v)) return false;
  return Object.values(v as object).every((x) => typeof x === 'string');
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && (v as unknown[]).every((x) => typeof x === 'string');
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

// ─── Catalog validator ───────────────────────────────────────────────────────

function validateCatalog(raw: unknown, errors: string[]): raw is TemplateCatalogJson {
  if (!isObject(raw)) { errors.push('catalog must be an object'); return false; }
  const ok = [
    isString(raw.label)        || (errors.push('catalog.label must be a string'), false),
    isString(raw.description)  || (errors.push('catalog.description must be a string'), false),
    isString(raw.previewColor) || (errors.push('catalog.previewColor must be a string'), false),
    isString(raw.accentColor)  || (errors.push('catalog.accentColor must be a string'), false),
    isString(raw.category)     || (errors.push('catalog.category must be a string'), false),
    isBoolean(raw.isNewTheme)  || (errors.push('catalog.isNewTheme must be a boolean'), false),
    isBoolean(raw.featured)    || (errors.push('catalog.featured must be a boolean'), false),
    (raw.active === undefined || isBoolean(raw.active)) || (errors.push('catalog.active must be a boolean when present'), false),
  ];
  return ok.every(Boolean);
}

// ─── Theme validator ─────────────────────────────────────────────────────────

function validateTheme(raw: unknown, errors: string[]): raw is TemplateThemeJson {
  if (!isObject(raw)) { errors.push('theme must be an object'); return false; }

  const checks: boolean[] = [
    isString(raw.name)           || (errors.push('theme.name must be a string'), false),
    isString(raw.description)    || (errors.push('theme.description must be a string'), false),
    isStringArray(raw.categorySupport) || (errors.push('theme.categorySupport must be string[]'), false),
    isObject(raw.colors)         || (errors.push('theme.colors must be an object'), false),
    isObject(raw.typography)     || (errors.push('theme.typography must be an object'), false),
    isObject(raw.spacing)        || (errors.push('theme.spacing must be an object'), false),
    isObject(raw.shapes)         || (errors.push('theme.shapes must be an object'), false),
    isObject(raw.effects)        || (errors.push('theme.effects must be an object'), false),
    isStringRecord(raw.shadows)  || (errors.push('theme.shadows must be Record<string,string>'), false),
    isObject(raw.button)         || (errors.push('theme.button must be an object'), false),
    isObject(raw.divider)        || (errors.push('theme.divider must be an object'), false),
    isStringRecord(raw.backgrounds) || (errors.push('theme.backgrounds must be Record<string,string>'), false),
    isObject(raw.assets)         || (errors.push('theme.assets must be an object'), false),
    isStringArray(raw.dressCodeSwatches) || (errors.push('theme.dressCodeSwatches must be string[]'), false),
    isStringRecord(raw.cssVariables) || (errors.push('theme.cssVariables must be Record<string,string>'), false),
  ];

  // effects booleans
  if (isObject(raw.effects)) {
    const e = raw.effects;
    if (!isBoolean(e.paperTexture)) errors.push('theme.effects.paperTexture must be boolean');
    if (!isBoolean(e.grain))        errors.push('theme.effects.grain must be boolean');
    if (!isBoolean(e.particles))    errors.push('theme.effects.particles must be boolean');
    if (!isBoolean(e.parallax))     errors.push('theme.effects.parallax must be boolean');
    if (!isBoolean(e.lightSweep))   errors.push('theme.effects.lightSweep must be boolean');
    if (!isNumber(e.grainIntensity)) errors.push('theme.effects.grainIntensity must be number');
  }

  return checks.every(Boolean) && errors.length === 0;
}

// ─── Public API ──────────────────────────────────────────────────────────────

export type ValidationResult =
  | { valid: true; template: TemplateJson }
  | { valid: false; errors: string[] };

export function validateTemplateJson(data: unknown): ValidationResult {
  const errors: string[] = [];

  if (!isObject(data)) {
    return { valid: false, errors: ['root must be an object'] };
  }

  if (!isString(data.id)) errors.push('id must be a string');
  else if (!/^[a-z0-9]+(-[a-z0-9]+)*$/.test(data.id)) errors.push('id must be kebab-case');

  validateCatalog(data.catalog, errors);
  validateTheme(data.theme, errors);

  if (errors.length > 0) return { valid: false, errors };
  return { valid: true, template: data as unknown as TemplateJson };
}

// ─── Converters ──────────────────────────────────────────────────────────────

export function templateJsonToThemeV2(t: TemplateJson): InvitationThemeV2 {
  const th = t.theme;
  return {
    id:               t.id as ThemeIdV2,
    name:             th.name,
    description:      th.description,
    categorySupport:  th.categorySupport as unknown as InvitationThemeV2['categorySupport'],
    colors:           th.colors    as unknown as InvitationThemeV2['colors'],
    typography:       th.typography as unknown as InvitationThemeV2['typography'],
    spacing:          th.spacing   as unknown as InvitationThemeV2['spacing'],
    shapes:           th.shapes    as unknown as InvitationThemeV2['shapes'],
    effects:          th.effects   as unknown as InvitationThemeV2['effects'],
    shadows:          th.shadows   as unknown as InvitationThemeV2['shadows'],
    button:           th.button    as unknown as InvitationThemeV2['button'],
    divider:          th.divider   as unknown as InvitationThemeV2['divider'],
    backgrounds:      th.backgrounds as unknown as InvitationThemeV2['backgrounds'],
    assets:           th.assets    as unknown as InvitationThemeV2['assets'],
    // Preview dedicado si el template lo declara; si no, la textura del tema
    // (su imagen de fondo real) se reutiliza como preview en el selector.
    previewImage:     th.previewImage || th.assets?.texture || undefined,
    introBackground:  th.introBackground,
    dressCodeSwatches: th.dressCodeSwatches,
    cssVariables:     th.cssVariables,
  };
}

export function templateJsonToCatalogEntry(t: TemplateJson): ThemeCatalogEntry {
  return {
    id: t.id as ThemeIdV2,
    label: t.catalog.label,
    description: t.catalog.description,
    previewColor: t.catalog.previewColor,
    accentColor: t.catalog.accentColor,
    category: t.catalog.category,
    isNewTheme: t.catalog.isNewTheme || undefined,
    active: t.catalog.active !== false,
  };
}
