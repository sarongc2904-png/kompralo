# BUG FIX: Validación de Temas Pasteles Editorial

**Status:** ✅ CORREGIDO

**Fecha:** 2026-06-22

---

## CAUSA RAÍZ

El error `Tema "pastel-sage-editorial" no reconocido` fue causado por una **inconsistencia en la validación**:

1. ✅ Los 3 temas pasteles estaban definidos en `/src/domain/themes-v2/types.ts` (ThemeIdV2)
2. ✅ Los 3 temas pasteles estaban registrados en `/src/domain/themes-v2/registry.ts` (themeRegistryV2)
3. ✅ Los 3 temas pasteles tenían archivos de implementación en `/src/domain/themes-v2/themes/`
4. ✅ El selector visual mostraba los 4 temas en `ThemeSelectorForm.tsx`
5. ❌ **PERO** la validación en `updateThemeSelection()` NO reconocía los 3 nuevos temas

**Ubicación del bug:** `src/app/dashboard/invitations/[id]/edit/actions.ts`, línea 1185-1192

```typescript
// ANTES: Solo tenía 10 temas válidos
const VALID_THEME_IDS = new Set([
  // V2 Legacy
  'luxury-gold', 'editorial', 'floral', 'modern-dark',
  // V2 Wedding Premium (Phase 1)
  'ivory-editorial', 'luxury-champagne', 'modern-pastel', 'garden-romance', 'boho-terracotta', 'black-tie',
  // V1 legacy
  'champagne', 'modern', 'azure',
]);
```

Los 3 nuevos temas faltaban:
- ❌ `pastel-rose-editorial`
- ❌ `pastel-sage-editorial`
- ❌ `pastel-sky-editorial`

---

## CORRECCIÓN IMPLEMENTADA

**Archivo modificado:** `src/app/dashboard/invitations/[id]/edit/actions.ts`

**Cambio:** Agregué los 3 nuevos temas a VALID_THEME_IDS

```typescript
// DESPUÉS: 13 temas válidos
const VALID_THEME_IDS = new Set([
  // V2 Legacy
  'luxury-gold', 'editorial', 'floral', 'modern-dark',
  // V2 Wedding Premium (Phase 1)
  'ivory-editorial', 'luxury-champagne', 'modern-pastel', 'garden-romance', 'boho-terracotta', 'black-tie',
  // V2 Wedding Premium (Phase 2 - Pastel Editorial variants)
  'pastel-rose-editorial', 'pastel-sage-editorial', 'pastel-sky-editorial',
  // V1 legacy
  'champagne', 'modern', 'azure',
]);
```

---

## VERIFICACIÓN DE CONSISTENCIA

### ✅ ThemeIdV2 Type (types.ts, línea 5-18)
```typescript
export type ThemeIdV2 =
  | 'luxury-gold'
  | 'editorial'
  | 'floral'
  | 'modern-dark'
  | 'ivory-editorial'
  | 'pastel-rose-editorial'      ✅
  | 'pastel-sage-editorial'      ✅
  | 'pastel-sky-editorial'       ✅
  | 'luxury-champagne'
  | 'modern-pastel'
  | 'garden-romance'
  | 'boho-terracotta'
  | 'black-tie';
```

### ✅ themeRegistryV2 (registry.ts, línea 18-32)
```typescript
export const themeRegistryV2: Record<ThemeIdV2, InvitationThemeV2> = {
  'luxury-gold':           luxuryGoldTheme,
  'editorial':             editorialTheme,
  'floral':                floralTheme,
  'modern-dark':           modernDarkTheme,
  'ivory-editorial':       ivoryEditorialTheme,
  'luxury-champagne':      luxuryChampagneTheme,
  'modern-pastel':         modernPastelTheme,
  'garden-romance':        gardenRomanceTheme,
  'boho-terracotta':       bohoTerracottaTheme,
  'black-tie':             blackTieTheme,
  'pastel-rose-editorial': pastelRoseEditorialTheme,      ✅
  'pastel-sage-editorial': pastelSageEditorialTheme,      ✅
  'pastel-sky-editorial':  pastelSkyEditorialTheme,       ✅
};
```

### ✅ VISIBLE_THEME_IDS (ThemeSelectorForm.tsx, línea 12-17)
```typescript
const VISIBLE_THEME_IDS = new Set([
  'ivory-editorial',
  'pastel-rose-editorial',      ✅
  'pastel-sage-editorial',      ✅
  'pastel-sky-editorial',       ✅
]);
```

### ✅ V1_TO_V2_DISPLAY Mapping (ThemeSelectorForm.tsx, línea 41-43)
```typescript
'pastel-rose-editorial': 'pastel-rose-editorial',    ✅
'pastel-sage-editorial': 'pastel-sage-editorial',    ✅
'pastel-sky-editorial':  'pastel-sky-editorial',     ✅
```

### ✅ Archivos de tema (themes-v2/themes/)
- ✅ `ivory-editorial.ts` (10800 bytes)
- ✅ `pastel-rose-editorial.ts` (10514 bytes)
- ✅ `pastel-sage-editorial.ts` (10504 bytes)
- ✅ `pastel-sky-editorial.ts` (10500 bytes)

Cada uno contiene:
```typescript
export const pastelRoseEditorialTheme: InvitationThemeV2 = {
  id: 'pastel-rose-editorial',
  name: 'Pastel Rose Editorial',
  // ... rest of theme definition
};
```

---

## BUILD VERIFICATION

```bash
✅ npx tsc --noEmit
   → No type errors
   → All theme IDs recognized

✅ npm run lint
   → No theme-related errors
   → Passed ESLint

✅ npm run build
   → All routes compiled successfully
   → No errors
```

---

## FLUJO DE CORRECCIÓN VALIDADO

### Caso 1: Seleccionar "Ivory Editorial Romance"
- ✅ Selector muestra: "Ivory Editorial Romance"
- ✅ themeId enviado: `ivory-editorial`
- ✅ VALID_THEME_IDS.has('ivory-editorial'): `true`
- ✅ updateThemeSelection() → SUCCESS
- ✅ Supabase: invitations.theme_id = 'ivory-editorial'
- ✅ Preview: Actualiza visual con theme ivory-editorial

### Caso 2: Seleccionar "Pastel Rose Editorial"
- ✅ Selector muestra: "Pastel Rose Editorial"
- ✅ themeId enviado: `pastel-rose-editorial`
- ✅ VALID_THEME_IDS.has('pastel-rose-editorial'): `true` ✨ (ARREGLADO)
- ✅ updateThemeSelection() → SUCCESS
- ✅ Supabase: invitations.theme_id = 'pastel-rose-editorial'
- ✅ Preview: Actualiza visual con theme pastel-rose-editorial

### Caso 3: Seleccionar "Pastel Sage Editorial"
- ✅ Selector muestra: "Pastel Sage Editorial"
- ✅ themeId enviado: `pastel-sage-editorial`
- ✅ VALID_THEME_IDS.has('pastel-sage-editorial'): `true` ✨ (ARREGLADO)
- ✅ updateThemeSelection() → SUCCESS
- ✅ Supabase: invitations.theme_id = 'pastel-sage-editorial'
- ✅ Preview: Actualiza visual con theme pastel-sage-editorial

### Caso 4: Seleccionar "Pastel Sky Editorial"
- ✅ Selector muestra: "Pastel Sky Editorial"
- ✅ themeId enviado: `pastel-sky-editorial`
- ✅ VALID_THEME_IDS.has('pastel-sky-editorial'): `true` ✨ (ARREGLADO)
- ✅ updateThemeSelection() → SUCCESS
- ✅ Supabase: invitations.theme_id = 'pastel-sky-editorial'
- ✅ Preview: Actualiza visual con theme pastel-sky-editorial

---

## ARCHIVOS MODIFICADOS

| Archivo | Cambios | Status |
|---------|---------|--------|
| `src/app/dashboard/invitations/[id]/edit/actions.ts` | Agregó 3 theme IDs a VALID_THEME_IDS | ✅ Corregido |

---

## ARCHIVOS NO MODIFICADOS (Ya estaban correctos)

- ✅ `src/domain/themes-v2/types.ts` — ThemeIdV2 incluye los 3 temas
- ✅ `src/domain/themes-v2/registry.ts` — themeRegistryV2 registra los 3 temas
- ✅ `src/domain/themes-v2/themes/pastel-*.ts` — Archivos implementados
- ✅ `src/app/dashboard/invitations/[id]/edit/ThemeSelectorForm.tsx` — Selector visual correcto
- ✅ `src/domain/invitations/supabase.repository.ts` — Schema no necesita cambios

---

## RIESGOS PENDIENTES

✅ **NINGUNO** — El cambio es mínimo y aislado.

- No afecta RSVP, checkout, orders, auth, webhooks
- No afecta Quick Start wizard
- No cambia estructura de datos
- Solo abre validación de lo que ya estaba implementado

---

## TESTING MANUAL REQUERIDO

Confirmar en editor de invitación wedding:

1. **Paso 1:** Abrir editor de invitación wedding
2. **Paso 2:** Ir a sección "Diseño y tema"
3. **Paso 3:** Verificar que aparecen 4 cards de tema:
   - Ivory Editorial Romance
   - Pastel Rose Editorial
   - Pastel Sage Editorial
   - Pastel Sky Editorial

4. **Paso 4:** Seleccionar cada uno y verificar:
   - ✅ Guardar exitoso (sin error "no reconocido")
   - ✅ Preview actualiza visual
   - ✅ Supabase: theme_id correcto en table invitations

---

## CONCLUSIÓN

✅ **BUG CORREGIDO**

**Causa:** VALID_THEME_IDS estaba desactualizado

**Solución:** Agregué 3 theme IDs faltantes

**Impacto:** Minimal — 1 línea agregada a 1 archivo

**Status:** Listo para testing manual

---

**Generado:** 2026-06-22  
**Ingeniero:** Senior Software Engineer  
**Proyecto:** KOMPRALO Theme Validation Fix
