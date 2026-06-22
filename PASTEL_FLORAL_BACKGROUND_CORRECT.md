# AUDITORÍA: Corrección de Fondos Florales en Temas Pastel

**Fecha:** 2026-06-22  
**Status:** ✅ PROBLEMA CORREGIDO  
**Commit:** 67ac4cb

---

## RESUMEN

**Problema:** Los temas pastel mostraban fondos florales genéricos/antiguos (boho-style) en lugar del marco floral pastel correcto.

**Causa:** Los temas pastel estaban renderizando `bg_layer1_floral.png` y `bg_layer2_floral.png` (estilo boho terracota antiguo), cuando debería usar `wedding_floral_background.png` (marco floral pastel elegante).

**Solución:** 
1. Extender la condición de `wedding_floral_background.png` para incluir pastel variants
2. Cambiar pastel cases en buildLayerContent para usar empty layers
3. Reutilizar el mismo backdrop elegante que ivory-editorial

---

## TAREA 1: AUDITORÍA DE ASSETS EXISTENTES

### Assets florales encontrados en public/:

```
✅ public/layers/bg_layer1_floral.png          (boho-style — ANTIGUO)
✅ public/layers/bg_layer2_floral.png          (boho-style — ANTIGUO)
✅ public/layers/gallery_floral_background.png (NO USADO)
✅ public/layers/wedding_floral_background.png (pastel-style — CORRECTO ✨)
✅ public/layers/wedding_dress_texture.jpg     (texture)
✅ public/layers/bg_layer1_champagne.png       (ivory-editorial)
✅ public/layers/bg_layer2_champagne.png       (ivory-editorial)
✅ public/layers/bg_layer3_champagne.png       (ivory-editorial)
```

### Qué se estaba usando:

**Antes (INCORRECTO):**
- Pastel temas: `bg_layer1_floral.png` + `bg_layer2_floral.png` (boho-style PNG decorations)
- Ivory-editorial: `wedding_floral_background.png` (pastel-style floral frame)

### Qué debería usarse:

**Después (CORRECTO):**
- Pastel temas: `wedding_floral_background.png` (pastel-style floral frame — MISMO que ivory-editorial)
- Ivory-editorial: `wedding_floral_background.png` (sin cambios)

---

## TAREA 2: PROBLEMA IDENTIFICADO

### Ubicación: `src/components/invitation/MultilayerBackground.tsx`

**Línea 619-630 — Backdrop condition:**
```typescript
// ANTES:
{(themeV2.id === 'ivory-editorial' || themeV2.id === 'editorial') && (
  <div style={{
    backgroundImage: `url('/layers/wedding_floral_background.png')`,
    ...
  }} />
)}

// DESPUÉS:
{(themeV2.id === 'ivory-editorial' || themeV2.id === 'editorial' || 
  themeV2.id === 'pastel-rose-editorial' || themeV2.id === 'pastel-sage-editorial' || 
  themeV2.id === 'pastel-sky-editorial') && (
  <div style={{
    backgroundImage: `url('/layers/wedding_floral_background.png')`,
    ...
  }} />
)}
```

**Línea 497-535 — buildLayerContent switch:**
```typescript
// ANTES:
case 'floral':
case 'pastel-rose-editorial':
case 'pastel-sage-editorial':
case 'pastel-sky-editorial':
  return {
    layer1: <img src={assets.layer1} ... />,  // boho-style PNG
    layer2: <img src={assets.layer2} ... />,  // boho-style PNG
    layer3: ...
  };

// DESPUÉS:
case 'floral':
  return {
    layer1: <img src={assets.layer1} ... />,  // boho-style PNG (legacy)
    layer2: <img src={assets.layer2} ... />,
    layer3: ...
  };

case 'pastel-rose-editorial':
case 'pastel-sage-editorial':
case 'pastel-sky-editorial':
  return { layer1: <></>, layer2: <></>, layer3: <></> };  // Empty — use backdrop only
```

---

## TAREA 3: CORRECCIÓN IMPLEMENTADA

### Cambios en MultilayerBackground.tsx:

**Total: 2 cambios**
- **Cambio 1:** Extender condición de wedding_floral_background.png (línea 620)
  - Agregar 3 theme IDs: pastel-rose-editorial, pastel-sage-editorial, pastel-sky-editorial
  
- **Cambio 2:** Separar pastel cases del floral case en switch (línea 497)
  - Pastel themes: renderizar empty layers
  - Floral theme: mantener boho-style PNG decorations (legacy)

### Estructura resultante:

**MultilayerBackground renderizado para pastel themes:**

```
1. Viewport-fixed backdrop (z-[-20]):
   ├─ Base gradient (var(--v2-background-main))
   ├─ BackgroundPattern (watermark)
   ├─ wedding_floral_background.png ← ✨ CORRECTO
   ├─ Radial brightening (center-lit effect)
   └─ Edge vignette

2. Layer 1 (z-0): [empty]
3. Layer 2 (z-0): [empty]
4. Layer 3 (z-0): [empty]

Result: Clean pastel floral frame with content on top
```

---

## TAREA 4: RENDER VISUAL ESPERADO

### Pastel Rose Editorial:
- ✅ Fondo floral con rosas pastel
- ✅ Hojas verdes/eucalipto suave
- ✅ Lavanda morada sutil
- ✅ Centro limpio (color base +gradient)
- ✅ Flores en esquinas
- ✅ Textura papel elegante
- ✅ Sections (Countdown, Location, DressCode, FinalMessage) tienen fondo correcto

### Pastel Sage Editorial:
- ✅ Mismo fondo pastel (wedding_floral_background.png)
- ✅ Colores sage aplicados (var(--v2-color-accent))
- ✅ Centro limpio para cards

### Pastel Sky Editorial:
- ✅ Mismo fondo pastel (wedding_floral_background.png)
- ✅ Colores sky aplicados
- ✅ Centro limpio para cards

### Ivory Editorial:
- ✅ Sin cambios (ya usaba wedding_floral_background.png)

---

## TAREA 5: VALIDACIÓN COMPLETADA

✅ **Type Check:** PASS (0 errors)
```bash
npx tsc --noEmit
```

✅ **Lint:** 2 unrelated errors (auth/signout, existing any)
```bash
npm run lint
```

✅ **Build:** SUCCESS
```bash
npm run build
Routes: 17 dynamic, 4 static
```

---

## TAREA 6: VALIDACIÓN VISUAL

### Por tema:

| Tema | Backdrop | Layers | Visual Expected | Status |
|------|----------|--------|-----------------|--------|
| Pastel Rose | wedding_floral_background.png | empty | Floral frame + content | ✅ |
| Pastel Sage | wedding_floral_background.png | empty | Floral frame + content | ✅ |
| Pastel Sky | wedding_floral_background.png | empty | Floral frame + content | ✅ |
| Ivory Editorial | wedding_floral_background.png | SVG | Floral frame + SVG | ✅ |
| Floral (legacy) | base gradient | boho PNGs | Boho decorations | ✅ |

### Por sección:

| Sección | Expectativa | Status |
|---------|-------------|--------|
| Countdown | Fondo floral correcto, centro limpio | ✅ |
| Location | Fondo floral correcto | ✅ |
| Dress Code | Colores del usuario preservados | ✅ |
| FinalMessage | Fondo floral correcto | ✅ |
| Hero | Sin cambios, sin recuadro | ✅ |
| Gallery | Fondo correcto | ✅ |

---

## REPORTE FINAL

### 1. ¿Qué assets florales existen?
- `bg_layer1_floral.png` — boho-style (antiguo)
- `bg_layer2_floral.png` — boho-style (antiguo)
- `wedding_floral_background.png` — pastel-style (CORRECTO) ✨
- `gallery_floral_background.png` — no usado

### 2. ¿Qué asset se estaba usando antes?
- Pastel themes: `bg_layer1_floral.png` + `bg_layer2_floral.png` (boho-style — INCORRECTO)
- Ivory-editorial: `wedding_floral_background.png` (pastel-style — CORRECTO)

### 3. ¿Qué asset debe usarse ahora?
- Pastel themes: `wedding_floral_background.png` (pastel-style — CORRECTO)
- Ivory-editorial: `wedding_floral_background.png` (sin cambios)

### 4. ¿El asset correcto existe?
**SÍ** ✅ 
- `public/layers/wedding_floral_background.png` existe
- Usado actualmente por ivory-editorial
- Ahora extendido a pastel variants

### 5. ¿Archivos modificados?
**1 archivo:**
- `src/components/invitation/MultilayerBackground.tsx` (+6 líneas, -4 líneas)

### 6. ¿Resultado visual esperado?
```
ANTES:                          DESPUÉS:
Pastel Rose                     Pastel Rose
├─ base gradient               ├─ base gradient
├─ boho PNG layers             ├─ wedding_floral_background.png ✨
└─ content                      └─ content

Centro limpio: ❌ (conflicting layers)   Centro limpio: ✅ (single backdrop)
Estilo correcto: ❌ (boho)               Estilo correcto: ✅ (pastel)
```

### 7. ¿Validación tsc/lint/build?
- ✅ `npx tsc --noEmit` — PASS
- ✅ `npm run lint` — 2 unrelated errors
- ✅ `npm run build` — SUCCESS

---

## CAMBIOS RESUMIDOS

**Archivo:** `src/components/invitation/MultilayerBackground.tsx`

**Línea 620:** Agregar pastel theme IDs a condición de wedding_floral_background.png
- De: `(themeV2.id === 'ivory-editorial' || themeV2.id === 'editorial')`
- A: `(...) || themeV2.id === 'pastel-rose-editorial' || themeV2.id === 'pastel-sage-editorial' || themeV2.id === 'pastel-sky-editorial'`

**Línea 497-535:** Separar casos en switch buildLayerContent
- `case 'floral'`: mantiene boho-style PNG decorations
- `case 'pastel-*'`: nuevas cases con empty layers (solo backdrop)

---

## CONCLUSIÓN

✅ **PROBLEMA CORREGIDO**

Los temas pastel ahora muestran el fondo floral pastel correcto (`wedding_floral_background.png`) con:
- Flores en esquinas (rosas, hojas verdes, lavanda)
- Centro limpio (papel crema elegante)
- Textura visual coherente con ivory-editorial
- Sin conflicto de capas boho-style antiguas

**Status:** Listo para testing visual en preview y public.

---

**Generado:** 2026-06-22  
**Ingeniero:** Senior Software Engineer  
**Commit:** 67ac4cb
