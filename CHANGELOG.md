# Changelog

## [Unreleased] — 2026-06-28

### Plantillas JSON

#### oro-sombra
- Fondo de tarjetas (`--v2-glass-bg`, `--v2-color-surface`) cambiado a morado oscuro `#4a326b`
- Acento actualizado de `#B08D57` a dorado brillante `#D4AF37` en colores, botones, divisores y CSS vars
- `assets.texture` → `azul.png` con `cover / no-repeat / opacity 1`
- `assets.textureSize`, `textureRepeat`, `textureOpacity` configurables por JSON
- `backgroundLayer1` limpiado (no usado por MultilayerBackground para este tema)

#### pastel-rose-editorial
- `assets.texture` → `bodas.jpg`
- `assets.textureStartAfterHero = true` — imagen de fondo aparece solo en secciones post-Hero

### Sistema de plantillas

- **`textureSize` / `textureRepeat` / `textureOpacity`** — nuevos campos opcionales en `ThemeAssetsV2` para configurar el overlay de texture por tema sin tocar código
- **`textureStartAfterHero`** — nuevo campo booleano en `ThemeAssetsV2`; cuando es `true`, la texture se renderiza dentro de `MultilayerBackground` (post-Hero) en lugar del overlay fijo global en `InvitationRenderer`

### Componentes de invitación

- **`SectionHeader`** — títulos `h3` usan `var(--v2-color-text-primary, #2c1810)` en lugar de color hardcodeado; eyebrow y separador usan `var(--v2-color-accent, #c9a84c)`
- **`Countdown`** — números, labels y ornamentos usan variables CSS del tema (`--v2-color-text-primary`, `--v2-color-text-muted`, `--v2-color-accent`) con fallback a los valores originales
- **`ElegantInvitationCard`** — `CARD_BASE.background` usa `var(--v2-glass-bg)` y `border` usa `var(--v2-color-border)` — compatible con temas oscuros y claros
- **`TemplateSelectorModal`** — footer con botones "Cancelar" y "Aplicar plantilla" siempre visible; modal con `height: 85vh` fijo, scroll interno en el grid de plantillas
- **`InvitationRenderer`** — `invitationPaperVariables` solo se aplica para `ivory-editorial`; botanical overlay refactorizado de comparación por `id` a `!!themeV2.assets?.texture`
- **`ivory-editorial.json`** — `assets.texture` con URL del fondo botánico

### Fondos de plantillas nuevas

- Las 10 plantillas nuevas (`blanco-linea`, `gatsby-dorado`, `talavera-alta`, `sol-y-mar`, `tierra-nocturna`, `rosa-antiguo`, `cobre-urbano`, `kanso-zen`, `lavanda-provenza`, `oro-sombra`) tienen `backgrounds.*` y `--v2-background-*` en color sólido (`previewColor`) en todos los slots — eliminados gradients que causaban fondos incorrectos al cambiar plantilla en el editor

### FASE 2 — Modal selector de plantillas (Editor V4)

- Feature flag `templateSelectorV2` (`NEXT_PUBLIC_TEMPLATE_SELECTOR=true`)
- Componentes: `TemplateCard`, `TemplateGrid`, `TemplateSelectorModal` (portal a `document.body`)
- Botón en `EditorV4Toolbar` (desktop e icono mobile)
- Estado y lógica de aplicación en `EditorV4Shell` vía `updateThemeSelection`

### Fix RSVP / Pases personalizados

- **`PassesOnlyNotice`** restaurado en `InvitationRenderer` — cuando `rsvpMode = 'passes_only'`, el link general muestra aviso en lugar del formulario RSVP
- **`RsvpModeSelector`** reactivado en Centro de Control (siempre visible)
- Copy del selector actualizado para describir claramente ambos modos

### Landing

- Botón "Ver demo" y links "Demo real" en `Hero3D.tsx` e `InvitacionesHeader.tsx` actualizados de `/sofia-y-alejandro` a `/i/nuestrabodaarletteymayorga`
