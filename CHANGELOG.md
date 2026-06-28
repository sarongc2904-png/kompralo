# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2026-06-28] — Sesión de trabajo

### Fixes de viewport
- CinematicIntro: "NUESTRA BODA" y botón ABRIR visibles a zoom 100% con svh units
- Hero: "ESTAS INVITADO A CELEBRAR" visible, fix de flex-end overflow
- Tour spotlight: scrollIntoView antes de calcular getBoundingClientRect

### Editor
- Eliminado editor legacy completamente — solo queda Editor V4
- Botón "← Editor clásico" removido del navbar del Editor V4
- Redirect automático de rutas legacy a /edit

### Centro de Control
- Rediseño visual con monograma, countdown banner y stats
- Título en Pinyon Script dinámico (lee protagonistas reales)
- Thumbnail de invitación movido al banner countdown
- Card redundante "Boda de Arlette & Mayorga" eliminada
- Modal de ayuda ? con 7 secciones, estilo idéntico al Editor V4
- Modal responsivo en mobile con tabs horizontales
- Tour MiEventoTour con hint post-tour apuntando al botón ?
- Título "Administrador de Invitados" sobre el buscador

### Mis Eventos (/cliente)
- Botones "Manual" y FAB "Manual de uso" eliminados
- Tour MisEventosTour creado (disponible para activar después)

### Rediseño estético invitación pública
- Estilo Cream & Botanical con fondos florales de Supabase
- Fondo único fondo_1.webp en wrapper raíz (solo ivory-editorial)
- Fondo condicionado al tema ivory-editorial, no afecta otros temas
- Countdown: números limpios sin cajas, tipografía serif peso 300
- Paleta global: crema #fdf6ec, dorado #c9a84c, texto #2c1810
- Cards semitransparentes con backdrop-filter blur(4px)
- Opacidad del fondo al 35% para look tenue y elegante

### Performance
- fondo_1, fondo_2, fondo_3 comprimidos a WebP: 96% más ligeros
- Preload condicional de fondo_1.webp en server component
- Fix scroll post-CinematicIntro (overflow cleanup en useEffect)
- backgroundAttachment fixed → repeat-y para compatibilidad iOS Safari

---

## [Unreleased]

### Changed

#### `chore(cliente)` — Ajuste visual de “Mis Eventos”

- Normalizados labels visibles en `/cliente`: “Abrir Mi Evento”, “Ver invitación”, “Editar” y “Compartir”.
- Eliminado visualmente el botón duplicado/saturado de “Ver mi invitación”.
- Ajustada la paleta de tarjetas y acciones hacia marfil, champagne, dorado suave y verde suave.
- Sin cambios en login, ownership, órdenes, RSVP ni rutas existentes.

### Fixed

#### `fix(editor)` — Estabilización del Editor Visual

- **WizardExpress** ahora depende únicamente de `hero.wizardExpressCompleted`; eliminada la condición `hasMinimalData` que bloqueaba la entrada cuando la invitación ya tenía datos por defecto.
- **Hero con video YouTube** responsivo usando técnica absolute-center: `position: absolute; top: 50%; left: 50%; minWidth: 177.78%; transform: translate(-50%, -50%)` — reemplaza `objectFit: cover` que los navegadores ignoran en `<iframe>`.
- **Placeholder persistente en `EditableText`** cuando el contenido está vacío; corrección de sincronización entre modo editor y vista pública.
- **`SectionHeader`** ahora acepta `eyebrowFieldPath` y `titleFieldPath` — envuelve eyebrow/title en `EditableText` cuando se proveen los paths.
- **StoryBook**: títulos editables inline vía `story.sectionEyebrow` / `story.sectionTitle`.
- **GiftRegistry**: títulos y subtítulos editables vía `gift_registry.sectionEyebrow` / `.sectionTitle` / `.subtitle`.
- **Location**: encabezados editables vía `location.sectionEyebrow` / `.sectionTitle`.
- **DressCode**: encabezados editables vía `dress_code.sectionEyebrow` / `.title`.
- **Hashtag**: encabezado editable vía `social.sectionEyebrow`.
- **Hospedaje**: encabezados editables vía `hero.hospedajeSectionEyebrow` / `.hospedajeSectionTitle`.
- **`InvitationRenderer`** actualizado para propagar `editablePreview` y section labels a todas las secciones de forma consistente.
- **`actions.ts`** y **`types.ts`** actualizados con nuevos fieldPaths en `INLINE_EDIT_ALLOWED_PATHS` e interfaz `InvitationHero`.

#### `fix(invitation)` — Countdown — Investigación completa y corrección en tres capas

El Countdown no aparecía en producción. Se diagnosticó mediante marcadores visuales temporales, descartando causas una por una.

**Capa 1 — Condición de fecha eliminada**

```diff
- {features.showCountdown && invitation.eventDate && (
+ {features.showCountdown && (
```

`normalizeDateString(null)` retorna `''` (falsy). Si `event_date` es `NULL` en la tabla `invitations`, la condición cortocircuitaba y Countdown nunca se montaba. El componente ya soporta fecha vacía — muestra “Fecha por confirmar”.

**Capa 2 — Fuente de features corregida**

```diff
- {plan.features.showCountdown && (
+ {features.showCountdown && (
```

`plan.features` es el objeto raw del plan en memoria. `features` es el resultado de `mergePlanFeatures(plan.features, invitation.featureOverrides)` — el único valor que el renderer debe usar para decidir visibilidad de secciones.

**Capa 3 — Stacking context vs. paper-noise overlay**

`MultilayerBackground` renderiza un overlay `paper-noise` con `position: absolute; zIndex: 2`. El `<section>` de Countdown no tenía `position` declarado, por lo que quedaba por debajo del overlay en el orden de apilamiento. Las demás secciones usan `SectionShell` que establece `position: relative` y crea su propio stacking context.

**Fix:** `<section>` de Countdown ahora tiene `position: relative; zIndex: 20`.

**Capa 4 — Animación whileInView eliminada**

`motion.div` con `initial={{ opacity: 0 }}` y `whileInView` podía quedar invisible permanentemente dentro de contenedores con `overflow: hidden` (el IntersectionObserver usa el contenedor como root y puede no dispararse). Reemplazado por `animate` con estado inicial visible.

**Commits relacionados:** `b5d85f6` · `74dab50` · `68a35f7` · `4491e37`

---

## [0.9.0] — 2026-06-26

### Fixed

#### `fix(invitation)` — Countdown visible en todos los estados (`4491e37`, `68a35f7`, `dc6f7db`)

El Countdown no aparecía en producción a pesar de estar habilitado en el plan. Tres causas encontradas y corregidas de forma sucesiva mediante marcadores visuales de diagnóstico:

| # | Causa | Fix |
|---|---|---|
| 1 | Condición `&& invitation.eventDate` cortocircuitaba cuando `event_date` es NULL en DB | Eliminada la guarda — Countdown maneja fecha vacía mostrando “Fecha por confirmar” |
| 2 | `plan.features.showCountdown` (raw) en vez de `features.showCountdown` (merged) | Cambiado a `features.showCountdown` para respetar el resultado de `mergePlanFeatures` |
| 3 | `<section>` sin `position: relative` ni `z-index` — el overlay `paper-noise` (`position: absolute; zIndex: 2`) lo cubría completamente | Añadido `position: relative; zIndex: 20` a la sección. Removido `whileInView / initial opacity: 0` que también podía impedir visibilidad en contenedores con overflow |

**Archivos modificados:**
- `src/components/invitation/InvitationRenderer.tsx` — condición y uso de `features`
- `src/components/invitation/Countdown.tsx` — stacking context y animación de entrada

---

### Added

#### `feat(invitation)` — Headers de sección editables en todas las secciones array (`74dab50`)

Las secciones basadas en arrays JSONB (Itinerary, Timeline, Parents, Hospedaje, Padrinos) tenían sus títulos y subtítulos hardcodeados — no eran editables inline. Se implementó almacenamiento de labels en el JSONB `hero` existente como canal lateral, sin cambios de schema.

**Campos nuevos en `hero` JSONB (todos opcionales):**
- `itinerarySectionEyebrow` / `itinerarySectionTitle`
- `timelineSectionEyebrow` / `timelineSectionTitle`
- `parentsSectionEyebrow` / `parentsSectionTitle` / `parentsSectionSubtitle`
- `hospedajeSectionEyebrow` / `hospedajeSectionTitle`
- `padrinosSectionEyebrow` / `padrinosSectionTitle`

**Comportamiento:** Muestra el valor guardado si existe, o el texto hardcodeado como placeholder. En modo `editablePreview`, el usuario puede hacer clic y editar inline. El cambio se guarda vía `INLINE_EDIT_ALLOWED_PATHS` en `actions.ts`.

**Archivos modificados:**
- `src/domain/invitations/types.ts` — `InvitationHero` extendido con 11 campos de section labels + `connectorText` + `wizardExpressCompleted`
- `src/app/dashboard/invitations/[id]/edit/actions.ts` — regex `hero.*` extendida para cubrir los 11 nuevos fieldPaths
- `src/components/invitation/InvitationRenderer.tsx` — pasa section labels desde `invitation.hero` a cada componente; elimina type cast de `connectorText`
- `src/components/invitation/Itinerary.tsx` — `SectionHeader` editable vía `hero.itinerarySectionEyebrow/Title`
- `src/components/invitation/Timeline.tsx` — `SectionHeader` editable vía `hero.timelineSectionEyebrow/Title`
- `src/components/invitation/Parents.tsx` — `SectionHeader` editable vía `hero.parentsSectionEyebrow/Title`
- `src/components/invitation/Hospedaje.tsx` — `SectionHeader` editable vía `hero.hospedajeSectionEyebrow/Title`
- `src/components/invitation/Padrinos.tsx` — header custom envuelto en `EditableText` vía `hero.padrinos*`

---

### Fixed (sesión anterior — editor-v3, commits `b5d85f6`…`351d67c`)

#### `fix(invitation)` — Regresiones post-merge: Hero, WizardExpress, Countdown, EditableText

Cuatro regresiones detectadas y corregidas en el editor visual:

**Hero video (`Hero.tsx`):**
- `objectFit: cover` ignorado por navegadores en `<iframe>` — reemplazado por técnica absolute-center + `minWidth: 177.78%`
- Altura en modo `editablePreview` limitada a `min(100svh, 820px)`

**WizardExpress (`edit/page.tsx`):**
- Condición `!hasMinimalData` impedía mostrar el wizard cuando la invitación ya tenía datos por defecto
- Simplificado a `!hero.wizardExpressCompleted` — único flag autoritativo

**ADMIN_ONLY_FEATURE_KEYS (`features.ts`):**
- Overrides de DB podían deshabilitar `showCountdown`, `showIntro`, `showRSVP` para clientes
- Set `ADMIN_ONLY_FEATURE_KEYS` en `mergePlanFeatures` descarta esas keys antes de mezclar
- `FeaturesForm.tsx` filtrado para no mostrar features con `editableByCustomer: false`

**EditableText (`EditableText.tsx`, `SectionHeader.tsx`, `InvitationRenderer.tsx`):**
- Reescritura de `EditableText` con placeholder CSS, `syncEmptyAttr`, lógica editor vs público
- `SectionHeader` acepta `eyebrowFieldPath`/`titleFieldPath` — secciones objeto (Story, GiftRegistry, Location, DressCode, Social) ya tienen headers editables
- Whitelist `INLINE_EDIT_ALLOWED_PATHS` completa para todos los fieldPaths de la invitación

---

## [0.8.0] — 2026-06-23

### Fixed

#### `fix(cliente)` — Acceso al editor por `user_id`, no solo por email (`37dddf5`)

El editor de invitaciones solo verificaba `customer_email` para confirmar propiedad de la invitación. Si el `user_id` del cliente coincidía pero el email de la orden difería (ej. compra con un email, login con otro), el cliente veía "Acceso no autorizado" aunque fuera el dueño legítimo.

**Causa raíz:** `emailMismatch` en `edit/page.tsx` evaluaba únicamente `invitation.customerEmail` vs `sessionUser.email`, sin considerar `invitation.user_id` vs `sessionUser.id`.

**Archivos modificados:**
- `src/domain/invitations/types.ts` — Añadido campo `ownerUserId?: string | null` a `InvitationContent`
- `src/domain/invitations/supabase.repository.ts` — Mapeado `row.user_id → ownerUserId` en `rowToContent`
- `src/app/dashboard/invitations/[id]/edit/page.tsx` — Ownership check ahora otorga acceso con `user_id` match OR `customer_email` match OR cookie de acceso firmado

---

## [0.7.0] — 2026-06-22

### Fixed

#### `fix(auth)` — Sesión de admin se perdía al navegar entre páginas (`98ef2cc`)

Al navegar dentro del panel de admin, el JWT podía expirar y el middleware intentaba refrescarlo. Sin embargo, el token refrescado nunca llegaba a los Server Components porque el `Cookie` header en `requestHeaders` se creaba antes de que `setAll` actualizara `request.cookies`. La API Web `Headers` es inmutable respecto a cambios posteriores.

**Causa raíz:** `new Headers(request.headers)` captura una snapshot; `request.cookies.set()` actualiza el store mutable de `RequestCookies` pero no modifica el objeto `Headers` ya creado.

**Fix:** Dentro de `setAll`, reconstruir la cadena cookie desde `request.cookies.getAll()` (que sí es mutable) y actualizar `requestHeaders` antes de crear el nuevo `NextResponse`.

**Archivos modificados:**
- `src/middleware.ts` — Reconstrucción del header `cookie` dentro del callback `setAll`
- `src/lib/admin/index.ts` — `requireAdmin()` lee `x-pathname` para redirect correcto post-login; usuarios autenticados sin fila en `admin_users` redirigen a `/cliente` (no a `/login`, que causaba bucle infinito)
- `src/app/admin/invitations/[id]/edit/page.tsx` — Añade `?from=admin` al redirect al editor
- `src/app/dashboard/invitations/[id]/edit/page.tsx` — Muestra "← Volver al admin" cuando `?from=admin` está presente

---

## [0.6.0] — 2026-06-21

### Fixed

#### `fix(gating)` — Social/hashtag accesible en Premium; `updateFeatureOverrides` con guarda de plan (`27a41e3`)

**Inconsistencias encontradas y corregidas:**

| Feature | Antes | Después |
|---|---|---|
| `showHashtag` en `registry.ts` | `minimumPlan: 'deluxe'` | `'premium'` |
| `updateSocial` acción server | `checkPlanAccess('deluxe')` | `checkPlanAccess('premium')` |
| `updateFeatureOverrides` | Sin guarda de plan | Filtra overrides contra defaults del plan |

**`updateFeatureOverrides` hardening:** Clientes sin modo admin ya no pueden habilitar features de plan superior vía override. La acción ahora filtra cualquier override `true` que no esté incluido en el plan de la invitación. Admins conservan acceso irrestricto.

**Archivos modificados:**
- `src/domain/features/registry.ts`
- `src/domain/plans/registry.ts`
- `src/app/dashboard/invitations/[id]/edit/actions.ts`

#### `fix(gating)` — `showParents` visible en Premium siendo exclusivo de Deluxe (`23d1321`)

`registry.ts` tenía `minimumPlan: 'premium'` para la sección Padres cuando la regla es Basic=NO, Premium=NO, Deluxe=SÍ. Corregido a `'deluxe'`. La acción `updateInvitationParents` también recibió guarda server-side.

---

## [0.5.0] — 2026-06-20

### Added

#### Admin: soft delete / restore de invitaciones

- **Tab de filtro** en `/admin/invitations`: Activas / Eliminadas / Todas (filtro por `deleted_at`)
- **Botón "Eliminar"** con confirmación inline de 2 pasos (¡Eliminar? Sí / No)
- **Botón "Recuperar"** con contador de días desde eliminación; deshabilitado si han pasado más de 30 días
- **Server actions** `softDeleteInvitation` / `restoreInvitation` usando service-role; ambas llaman `revalidatePath`
- **Responsive**: tabla en desktop, cards en móvil (360–390 px) usando clases CSS `.adm-inv-table` / `.adm-inv-cards`

**Archivos nuevos:**
- `src/app/admin/invitations/actions.ts`
- `src/app/admin/invitations/_components/AdminInvitationActions.tsx`

**Archivos modificados:**
- `src/app/admin/invitations/page.tsx`

---

### Changed - FASE 1B+2 Redesign: 5-Step Quick Start Wizard (Time to First WOW)

Replaced the 15-step comprehensive wizard with a focused 5-step flow that generates
a complete first draft using intelligent defaults. Goal: maximize Time to First WOW.

#### Modified Files

1. **`src/domain/themes-v2/style-to-theme-map.ts`**
   - Added `WIZARD_THEME_OPTIONS` constant — 6 visual theme cards with `ThemeIdV2`, label, description, accent color, and background color
   - Themes: pastel-rose-editorial, pastel-sage-editorial, pastel-sky-editorial, ivory-editorial, luxury-champagne, modern-pastel
   - Existing `WEDDING_STYLE_TO_THEME_MAP` and `resolveWeddingThemeId()` preserved unchanged

2. **`src/lib/invitations/generators/wedding-template-generator.ts`**
   - Added `receptionTime?: string` to `GenerateWeddingTemplateParams`; made `selectedStyle` optional
   - Changed hero `eventLabel` from `'Nuestra boda'` to `'Nos casamos'`
   - Added `addHoursToTime(base, hours)` helper — calculates HH:MM offsets
   - Updated `generateItinerary(ceremonyTime?, receptionTime?)` — auto-calculates reception (+2h), dinner (+3h), dance (+4h) from ceremony time; uses explicit `receptionTime` if provided
   - Added `normalizeForHashtag(name)` — removes accents, spaces, special chars
   - Updated `generateSocial(brideName?, groomName?)` — auto-generates `#NombreYNombre` hashtag from protagonist names
   - Generator now passes `receptionTime` to itinerary and `brideName/groomName` to social

3. **`src/app/dashboard/invitations/[id]/edit/actions.ts`**
   - Simplified `StartWeddingQuickStartInput` — removed 15-step wizard fields (`finalMessage`, `galleryTitle`, `itineraryItems`, `dressCodeType`, `dressCodeColors`, `giftRegistryItems`, `parents`, `hotels`, `hashtag`, `instagramHandle`, `tiktokHandle`, `skippedSteps`); retained 14 clean fields
   - Added `themeId?: string` and `locationSkipped?: boolean` to input; removed `selectedStyle` requirement from validation
   - Removed ~250 lines of dead code referencing deleted wizard variables
   - Theme resolution updated: `inputThemeId ?? resolveWeddingThemeId(selectedStyle ?? 'elegante')` — direct `ThemeIdV2` from wizard takes priority
   - Anti-destruction: location fields preserved when `locationSkipped === true`
   - All save logic now uses only `generatedContent.*` (no manual overrides)

4. **`src/components/editor/setup/WeddingQuickStartWizard.tsx`**
   - Complete rewrite: 1399 lines → ~490 lines
   - **Step 1 · Nombres** — bride + groom names (required); live `#HashtagPreview` below inputs
   - **Step 2 · Fecha** — date (required), ceremony time, reception time with "+2h auto" hint
   - **Step 3 · Lugar** (Premium/Deluxe only, skippable) — venue name, address, Google Maps URL, Waze URL; "Omitir por ahora" toggle
   - **Step 4 · Estilo** (Basic: Step 3) — 6 visual theme cards with color swatch + accent dot; default `pastel-rose-editorial`
   - **Step 5 · WhatsApp** (Basic: Step 4) — optional; shows summary card of entered data
   - **Pantalla de éxito** — celebration icon, pending-tasks checklist, "Ver vista previa" + "Seguir editando" buttons

#### UX Design (5-Step Wizard)

**Plan gating:**
- Basic: 4 steps (no Location step)
- Premium/Deluxe: 5 steps (includes Location step)

**Progress indicator:** animated dot-bar (pill expands on current step) + progress bar

**Anti-destruction rules:**
- Never overwrites sections with existing real data
- `locationSkipped: true` → preserves current `venueName` / `address` in DB

**Success screen actions:**
- "Ver vista previa" → navigates to `/dashboard/invitations/{id}/preview` + `router.refresh()`
- "Seguir editando" → closes modal + `router.refresh()`

**Pending checklist items shown after success:**
1. Subir fotos de portada y galería
2. Personalizar el mensaje de bienvenida
3. Revisar el itinerario del día
4. Compartir el link con tus invitados

#### Validation Status
- ✅ `tsc --noEmit` — 0 errors
- ✅ No breaking changes to existing editor functionality
- ✅ No Stripe / checkout / auth / RSVP / QR / admin code touched
- ✅ `updateThemeSelection` preserved — only called from Quick Start action

#### Code Metrics
- **Files modified**: 4
- **Net lines removed**: ~642 (1356 deleted, 714 added)
- **New dependencies**: 0
- **Breaking changes**: 0
- **Commit**: `fea3b69`

---


### Added - FASE 1A: Quick Start Generator Foundation

#### New Files Created

1. **`src/domain/themes-v2/style-to-theme-map.ts`**
   - Wedding style mapping (elegante, minimalista, jardín, playa, clásico, moderno) → ThemeIdV2
   - `WeddingStyle` type definition with strict union
   - `WEDDING_STYLE_TO_THEME_MAP` constant (read-only with `as const`)
   - `resolveWeddingThemeId()` function with fallback to 'ivory-editorial'

2. **`src/lib/invitations/generators/wedding-template-generator.ts`**
   - `GenerateWeddingTemplateParams` interface (6 required + 1 optional params)
   - `GeneratedWeddingTemplateContent` interface (plan-aware field selection)
   - Pure function `generateWeddingTemplate()` — deterministic, no side effects
   - 14 validation helpers for destructible content detection
   - Plan-aware field generation (basic/premium/deluxe)
   - Read-preserve-merge pattern: existing real data never overwritten
   - Template generation for all JSONB sections per plan tier
   - `event_time` always string (never null or timestamp)
   - No `theme_id`, `feature_overrides`, or `music` in V1 generator

3. **`src/lib/invitations/completion-score.ts`**
   - `CompletionScoreResult` interface
   - `evaluateWeddingCompletion(content, planId)` function
     - Returns: percentage (0–100), isIncomplete, isEmpty, missing[]
     - Scores critical vs. nice-to-have fields per plan
   - `shouldShowWeddingWizard(content, planId)` convenience function
   - Plan-aware scoring (respects plan boundaries)

4. **`src/lib/invitations/generators/__tests__/wedding-template-generator.test.ts`**
   - 10 self-contained test cases (no external framework required)
   - Complete coverage: plan boundaries, data preservation, style mapping, completion scoring
   - All tests pass with no external dependencies

### Technical Details

#### Architecture
- **Lógica pura**: All functions are pure — no side effects, no Supabase calls
- **Tipo-safe**: Uses `Record<string, unknown>` instead of `any` for ESLint compliance
- **Anti-destrucción**: 14 validation helpers detect real vs. placeholder data
- **Plan-aware**: Fields omitted from result if not allowed by plan tier
- **No dependencies**: No lodash, axios, or external packages added

#### Validation Status
- ✅ `npm run build` — Success
- ✅ `tsc --noEmit` — 0 errors
- ✅ `npm run lint` — 0 errors on new files
- ✅ No breaking changes
- ✅ No existing functionality modified

### Code Metrics
- **Files created**: 4
- **Functions exported**: 6
- **Validation helpers**: 14
- **Types created**: 4
- **Test cases**: 10
- **Lines of code**: ~950
- **New dependencies**: 0
- **Breaking changes**: 0

### Known Limitations
- Music generation: Reserved for future phases
- Placeholder filtering: Deferred to FASE 2
- No UI wizard form yet (FASE 2)
- No checkout integration yet (FASE 3+)

### Added - FASE 2: UI Wizard & Banner

#### New Files Created

1. **`src/components/editor/setup/WeddingQuickStartBanner.tsx`** (Client)
   - Elegant banner shown above editor when wedding invitation is incomplete
   - Main CTA: "Crear mi invitación"
   - Secondary CTA: "Editar manualmente" (dismisses banner for session via localStorage)
   - Dismissal persists in localStorage: `kompralo:quickstart-dismissed:{invitationId}`
   - Responsive layout: horizontal on desktop, vertical on mobile

2. **`src/components/editor/setup/WeddingQuickStartWizard.tsx`** (Client)
   - 3-step mobile-first wizard inside modal
   - **Step 1:** Bride & groom names with live preview
   - **Step 2:** Wedding date + optional time
   - **Step 3:** Visual style selector (elegante/minimalista/jardín/playa/clásico/moderno)
   - Progress indicator: "Paso X de 3"
   - Input validation: prevents advancing without required fields
   - Error messages for validation failures
   - Loading state during submit
   - Calls `startWeddingQuickStart()` action on submit
   - Handles success: closes wizard, calls `router.refresh()` to reload editor
   - Handles error: displays error message without breaking wizard

3. **`src/components/editor/setup/WeddingQuickStartSetup.tsx`** (Client Wrapper)
   - Wraps editor content to conditionally show banner
   - Evaluates via `shouldShowWeddingWizard(invitation, planId)`
   - Shows banner only if:
     - category === 'wedding'
     - invitation is incomplete
     - not dismissed in localStorage
   - Lazy initializes dismissed state from localStorage
   - Passes banner dismiss callback to clear state

#### Modified Files

- **`src/app/dashboard/invitations/[id]/edit/page.tsx`** (Server)
  - Added import: `WeddingQuickStartSetup`
  - Wrapped editor content sections with `<WeddingQuickStartSetup>` component
  - Kept header outside wrapper
  - Passed `invitation` prop to wrapper

#### UX Design

**Premium Design System:**
- Colors: Ivory (#FAF7F2), Champagne (#B99752), Dark brown (#1A1410), Warm beige (#746B62)
- Buttons: min 44px height (mobile accessibility)
- Font weights: semibold for headings, regular for body
- Border-radius: 8px for inputs, 12px for buttons, 16px for banner
- Shadows: subtle card shadows, hover effects

**Mobile-First:**
- Full-width inputs and buttons on mobile
- Modal view for wizard
- Responsive grid for style buttons (2 columns)
- No horizontal scroll
- Touch-friendly spacing (16px gaps)

**UX Flow:**
1. User opens incomplete wedding invitation → banner appears
2. User clicks "Crear mi invitación" → wizard opens (Step 1)
3. User fills names → preview shows "{Name} & {Name}"
4. User continues → Step 2: date & time (time optional)
5. User continues → Step 3: picks visual style
6. User clicks "Crear invitación" → loading state
7. Success → wizard closes → editor refreshes → generated content visible
8. Error → error message shown, wizard stays open

**Dismissal Flow:**
1. User clicks "Editar manualmente" → banner dismisses for this session
2. localStorage key set: `kompralo:quickstart-dismissed:{invitationId}`
3. On next page load: banner not shown (checks localStorage)
4. No DB write — purely client-side

#### Validation Status (FASE 2)
- ✅ `npm run build` — Success
- ✅ `tsc --noEmit` — 0 errors
- ✅ `npm run lint` — 0 errors
- ✅ No breaking changes
- ✅ No existing functionality modified
- ✅ editor still fully manual-editable

#### Code Metrics (FASE 2)
- **Files created**: 3 (2 components + 1 wrapper)
- **Lines of code**: ~550 (banner + wizard + wrapper)
- **New dependencies**: 0
- **Breaking changes**: 0
- **Client components**: 3
- **Server components modified**: 1

#### Test Scenarios Covered
1. ✅ Incomplete wedding invitation → banner appears
2. ✅ Complete wedding invitation → banner hidden
3. ✅ Non-wedding invitation → banner hidden
4. ✅ Banner dismissed → localStorage set
5. ✅ Page reload after dismiss → banner stays hidden
6. ✅ Manual edit click → banner dismisses session
7. ✅ Wizard step 1: validation requires both names
8. ✅ Wizard step 2: validation requires date
9. ✅ Wizard step 3: validation requires style
10. ✅ Wizard submit: calls action, shows loading, handles success/error
11. ✅ Wizard success: closes, calls router.refresh()
12. ✅ Wizard error: shows message, keeps wizard open
13. ✅ Live preview in step 1: shows "{name} & {name}"
14. ✅ Style buttons: visual feedback on select

#### Integration Points
- **generateWeddingTemplate()**: Called via `startWeddingQuickStart()` action
- **resolveWeddingThemeId()**: Called via `startWeddingQuickStart()` action
- **shouldShowWeddingWizard()**: Decides banner visibility
- **router.refresh()**: Called after successful submit to reload editor
- **localStorage**: Dismissal persistence (no DB writes)

### Next Phases
- **FASE 3**: Checkout integration (auto-generate on purchase)
- **FASE 4+**: Placeholder filtering, advanced customization, etc.

---

### Added - FASE 1B: Server Action & Supabase Integration

#### Modified Files
- **`src/app/dashboard/invitations/[id]/edit/actions.ts`** (+363 lines)
  - Added imports: `generateWeddingTemplate`, `resolveWeddingThemeId`, `WeddingStyle`
  - New Server Action: `startWeddingQuickStart(input)`
  - Input validation using existing patterns
  - Authorization reusing `getAuthorizedInvitationRepository()`
  - Category & plan verification
  - Content generation via FASE 1A generator
  - Supabase saves via repository methods (RMW pattern)
  - Theme resolution and update
  - Route revalidation
  - Structured response with preview/public URLs

- **`src/domain/invitations/index.ts`**
  - Added missing export: `InvitationParentsInput`
  - No other changes — structure preserved

#### New Server Action: `startWeddingQuickStart()`

**Input Interface:**
```typescript
interface StartWeddingQuickStartInput {
  invitationId: string;
  brideName: string;
  groomName: string;
  weddingDate: string;
  weddingTime?: string;
  selectedStyle: WeddingStyle;
}
```

**Response Interface:**
```typescript
interface StartWeddingQuickStartResult {
  success: boolean;
  message: string;
  invitationId?: string;
  previewUrl?: string;
  publicUrl?: string;
  error?: string;
}
```

**Workflow:**
1. ✅ Validates input (all required fields, WeddingStyle enum check)
2. ✅ Authorizes access (ownership + admin override)
3. ✅ Verifies category === 'wedding'
4. ✅ Reads existing invitation_content from DB
5. ✅ Calls `generateWeddingTemplate()` with plan tier & existing data
6. ✅ Saves generated content using repository update methods:
   - `updateProtagonists()` for bride/groom
   - `updateBasicInfo()` for event_time, event_date, location
   - `updateMediaInfo()` for hero
   - `updateFinalMessage()` for final message
   - `updateGallery()` for gallery (premium+)
   - `updateItinerary()` for itinerary (premium+)
   - `updateDressCode()` for dress code (premium+)
   - `updateTimeline()` for timeline (deluxe)
   - `updateGiftRegistry()` for gift registry (deluxe)
   - `updateParents()` for parents (deluxe)
   - `updatePadrinos()` for padrinos (deluxe)
   - `updateAccommodation()` for hotels (deluxe)
   - `updateSocial()` for social (deluxe)
7. ✅ Updates theme_id via `updateThemeSelection()`
8. ✅ Revalidates: /dashboard/invitations/[id]/edit, /preview/[id], /i/[slug], /[slug]
9. ✅ Returns success with URLs or error details

**Key Safety Features:**
- Existing real data preserved (checked via generated content guards)
- Empty gallery/itinerary not overwritten if gallery/itinerary already exist
- Hero/location data preserved via read-merge-write
- event_time always string (never null)
- theme_id stored in invitations table, not invitation_content
- No music generated (reserved for future)
- No feature_overrides auto-set (handled separately)
- RLS policies respected throughout

#### Validation Status (FASE 1B)
- ✅ `npm run build` — Success
- ✅ `tsc --noEmit` — 0 errors
- ✅ `npm run lint` — 0 errors
- ✅ No breaking changes
- ✅ No existing functionality modified
- ✅ Reuses all existing helpers & patterns

#### Code Metrics (FASE 1B)
- **Files modified**: 2
- **Files created**: 0
- **Functions added**: 1 Server Action
- **Lines of code added**: ~363
- **New dependencies**: 0
- **Breaking changes**: 0

#### Test Scenarios Covered
1. ✅ Basic plan: generates protagonists, event_time, hero, final_message only
2. ✅ Premium plan: adds gallery, itinerary, dress_code, location
3. ✅ Deluxe plan: includes timeline, gift_registry, parents, padrinos, hotels, social
4. ✅ Existing gallery real: not overwritten
5. ✅ Existing hero real: not overwritten
6. ✅ Non-wedding category: returns error
7. ✅ Unauthorized user: returns authorization error
8. ✅ Missing invitationId: returns validation error
9. ✅ Invalid WeddingStyle: returns validation error
10. ✅ Successful quick start: returns URLs and success

---

## [FASE 0]

### Analysis & Audit
- Completed comprehensive audit of invitation_content schema
- Documented all 20 columns and JSONB structure
- Identified plan boundaries and field constraints
- Created implementation guidelines for all phases
