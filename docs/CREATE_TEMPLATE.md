# Crear una plantilla nueva

## Pasos rápidos

### 1. Duplicar un JSON existente
```bash
cp src/domain/themes-v2/templates-json/ivory-editorial.json \
   src/domain/themes-v2/templates-json/mi-plantilla.json
```

### 2. Editar el JSON nuevo

Abrir `mi-plantilla.json` y modificar:

```json
{
  "id": "mi-plantilla",           ← kebab-case único, sin spaces
  "catalog": {
    "label": "Mi Plantilla",      ← nombre visible en el selector
    "description": "...",         ← descripción corta para el UI
    "previewColor": "#F5F0EA",    ← color de fondo del chip preview
    "accentColor": "#C8A75D",     ← color del acento en el chip
    "category": "traditional",    ← "wedding" | "traditional" | "modern" | "playful"
    "isNewTheme": true,
    "featured": false
  },
  "theme": { ... }                ← ver Referencia de campos más abajo
}
```

**Regla de ID**: `id` debe ser kebab-case (`a-z`, `0-9`, guiones). No usar mayúsculas ni underscores.

### 3. Registrar en json-loader.ts

Abrir `src/domain/themes-v2/json-loader.ts` y agregar:

```typescript
// al inicio, junto a los demás imports:
import miPlantilla from './templates-json/mi-plantilla.json';

// en el array TEMPLATES_JSON:
const TEMPLATES_JSON = [
  ivoryEditorial,
  // ... existing ...
  miPlantilla,   // ← agregar aquí
] as unknown[];
```

### 4. Agregar ThemeIdV2 (si será un ID nuevo)

Si el ID de la plantilla no existe en el tipo `ThemeIdV2`, agregarlo en `src/domain/themes-v2/types.ts`:

```typescript
export type ThemeIdV2 =
  | 'ivory-editorial'
  // ... existing ...
  | 'mi-plantilla';   // ← agregar aquí
```

### 5. Probar en localhost

Activar el feature flag en `.env.local`:
```
NEXT_PUBLIC_USE_JSON_TEMPLATES=true
```

Luego:
```bash
npm run dev
```

Navegar al editor y verificar que la plantilla aparece en el selector.

### 6. Verificar paridad (si se modifica un tema existente)

```bash
npx tsx scripts/verify-json-parity.ts
```

---

## Referencia de campos `theme`

| Grupo | Qué controla visualmente |
|-------|--------------------------|
| `colors` | Paleta de 13 colores: fondo, surface, texto, acento, bordes, overlay |
| `typography` | Familias de fuentes (heading, body, script), peso, tracking, clases Tailwind |
| `spacing` | Padding de secciones y cards, gap entre elementos |
| `shapes` | Border radius (sm/md/lg/xl/full), estilo de card (rounded/sharp/pill) |
| `effects` | Glass blur, grain, paper texture, particles, parallax, light sweep |
| `shadows` | Sombras en 4 niveles: soft, card, elevated, book |
| `button` | Background, texto, borde, hover, border-radius, padding, sombra |
| `divider` | Color, variante (line/ornamental/dotted/gradient), grosor, ornamento |
| `backgrounds` | Fondos de: main, hero, sections, storyBook, gallery, final |
| `assets` | Rutas de capas PNG (backgroundLayer1/2/3) y texture opcional |
| `dressCodeSwatches` | Array de hex colors para el selector de dress code |
| `cssVariables` | Variables CSS `--v2-*` inyectadas por ThemeProviderV2 |

### Variables CSS mínimas requeridas

Estas variables son las más consumidas por los componentes:

```
--v2-color-page-bg       fondo general de la página
--v2-color-surface       fondo de cards (acepta gradient)
--v2-color-text-primary  texto principal
--v2-color-accent        color de acento (botones, íconos, dividers)
--v2-color-border        borde de cards y elementos
--v2-radius-md           border-radius de la mayoría de cards
--v2-shadow-card         sombra de cards
--v2-btn-bg              fondo del botón CTA
--v2-btn-text            texto del botón CTA
--v2-font-heading        familia tipográfica de encabezados
--v2-font-body           familia tipográfica del cuerpo
```

---

## Notas importantes

- **NO eliminar** los archivos `.ts` originales de `src/domain/themes-v2/themes/`. Son el fallback cuando `NEXT_PUBLIC_USE_JSON_TEMPLATES` no está activo.
- **NO mergear** a `main` hasta que Mayorga valide en localhost con el flag activo.
- Los JSON se bundlean en compile-time (imports estáticos), no hay fetch en runtime.
- El validador ignora plantillas con errores y las omite del registry (no rompe el build).
