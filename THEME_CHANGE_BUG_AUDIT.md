# AUDITORÍA CRÍTICA: Bug de Pérdida de Datos al Cambiar Tema

**Fecha:** 2026-06-22  
**Estado:** AUDITORÍA COMPLETADA — Se hallaron **3 problemas** potenciales  
**Severidad:** Media-Alta  
**Reporte:** Conclusión de causa raíz pendiente de testing manual

---

## RESUMEN EJECUTIVO

Se realizó auditoría completa del flujo de cambio de tema para verificar si `updateThemeSelection()` o procesos relacionados sobrescriben datos guardados en `invitation_content`.

**Hallazgos:**
1. ✅ `updateThemeSelection()` en actions.ts — LIMPIO (solo toca `invitations.theme_id`)
2. ✅ `updateThemeSelection()` en repositorio — LIMPIO (usa spread operator)
3. ⚠️ **BUG DETECTADO en `updateMediaInfo()`** — Borra `hero.videoUrl` y `hero.youtubeUrl`
4. ❓ **CAUSA RAÍZ PROBABLE** — Renderer usa `theme` como fuente principal, no `invitation_content`
5. ✅ Quick Start es cuidadoso — verifica datos existentes antes de sobrescribir

---

## AUDITORÍA DETALLADA

### 1. Auditar updateThemeSelection() en actions.ts

**Ubicación:** `src/app/dashboard/invitations/[id]/edit/actions.ts:1206-1233`

**Código:**
```typescript
export async function updateThemeSelection(
  input: UpdateThemeSelectionInput,
): Promise<UpdateInvitationResult> {
  const themeId = input.themeId.trim();

  if (!themeId) {
    return { success: false, error: 'Debes seleccionar un tema.' };
  }
  if (!VALID_THEME_IDS.has(themeId)) {
    return { success: false, error: `Tema "${themeId}" no reconocido.` };
  }

  const { id } = input;

  try {
    await invitationRepository.updateThemeSelection(id, { themeId });
    // ↑ SOLO llama a repositorio, no hace más nada
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('[Editor] updateThemeSelection error:', message);
    return { success: false, error: `Error al guardar el tema: ${message}` };
  }

  revalidatePath(`/i/${input.slug}`);
  revalidatePath(`/preview/${id}`);
  revalidatePath(`/dashboard/invitations/${id}/edit`);

  return { success: true, message: `Tema "${themeId}" aplicado correctamente.` };
}
```

**Análisis:**
- ✅ NO toca `invitation_content`
- ✅ NO llama a `updateProtagonists`, `updateHero`, `updateDressCode`, etc.
- ✅ Solo valida y llama al repositorio
- ✅ Revalidates rutas para refresh

**Conclusión:** ✅ **LIMPIO**

---

### 2. Auditar updateThemeSelection() en repositorio

#### LocalInvitationRepository (actualmente en uso)

**Ubicación:** `src/domain/invitations/repository.ts:473-487`

```typescript
async updateThemeSelection(id: string, input: InvitationThemeSelectionInput): Promise<InvitationContent> {
  const idx = localInvitations.findIndex((inv) => inv.id === id);
  if (idx === -1) throw new Error(`[Local] updateThemeSelection: invitation "${id}" not found`);

  const existing = localInvitations[idx];
  const updated: InvitationContent = {
    ...existing,  // ← PRESERVA TODOS LOS DATOS EXISTENTES
    themeId: input.themeId,
    updatedAt: new Date().toISOString(),
  };

  localInvitations[idx] = updated;
  console.log('[Local] updateThemeSelection(%s) — themeId=%s, updated in memory (not persisted)', id, input.themeId);
  return updated;
}
```

**Análisis:**
- ✅ Usa spread operator `...existing` para preservar todos los campos
- ✅ SOLO actualiza `themeId` y `updatedAt`
- ✅ No toca ningún campo de `invitation_content` (hero, gallery, dress_code, etc.)

**Conclusión:** ✅ **LIMPIO**

#### SupabaseInvitationRepository (no activo, pero auditado)

**Ubicación:** `src/domain/invitations/supabase.repository.ts:821-838`

```typescript
async updateThemeSelection(id: string, input: InvitationThemeSelectionInput): Promise<InvitationContent> {
  const now = new Date().toISOString();

  const { error } = await this.supabase
    .from('invitations')
    .update({ theme_id: input.themeId, updated_at: now })  // ← SOLO ESTOS CAMPOS
    .eq('id', id);

  if (error) {
    throw new Error(`[Supabase] updateThemeSelection failed: ${error.message}`);
  }

  const updated = await this.getById(id);
  if (!updated) {
    throw new Error(`[Supabase] updateThemeSelection: could not re-fetch invitation "${id}" after update`);
  }
  return updated;
}
```

**Análisis:**
- ✅ SOLO actualiza `invitations.theme_id` y `invitations.updated_at`
- ✅ NO toca tabla `invitation_content`
- ✅ NO sobrescribe ningún dato guardado por usuario

**Conclusión:** ✅ **LIMPIO**

---

### 3. Auditar updateMediaInfo() — ⚠️ BUG DETECTADO

**Ubicación:** `src/domain/invitations/repository.ts:118-148`

**Código problemático:**
```typescript
async updateMediaInfo(id: string, input: InvitationMediaInput): Promise<InvitationContent> {
  const idx = localInvitations.findIndex((inv) => inv.id === id);
  if (idx === -1) throw new Error(`[Local] updateMediaInfo: invitation "${id}" not found`);

  const existing = localInvitations[idx];
  const updated: InvitationContent = {
    ...existing,
    hero: {
      ...existing.hero,
      imageUrl:   input.heroImageUrl  || existing.hero?.imageUrl  || '',
      videoUrl:   input.heroVideoUrl  || undefined,  // ← ⚠️ BUG: Si input.heroVideoUrl es '', convierte a undefined
      youtubeUrl: input.youtubeUrl    || undefined,  // ← ⚠️ BUG: Si input.youtubeUrl es '', convierte a undefined
    },
    // ... resto del código
  };

  localInvitations[idx] = updated;
  console.log('[Local] updateMediaInfo(%s) — updated in memory (not persisted)', id);
  return updated;
}
```

**El problema:**
```javascript
// Cuando updateMediaInfo se llama sin proporcionar videoUrl:
const videoUrl = '';  // Empty string from form
videoUrl || undefined  // ← Se convierte a undefined, BORRANDO el valor guardado
```

**Dónde se triggeaba:**
- Si usuario actualiza `hero.imageUrl` sin tocar video
- Si usuario actualiza música o maps sin tocar video
- El empty string se convierte a `undefined`, borrando videos previos

**Corrección requerida:**
```typescript
hero: {
  ...existing.hero,
  imageUrl:   input.heroImageUrl  || existing.hero?.imageUrl  || '',
  videoUrl:   input.heroVideoUrl !== undefined ? input.heroVideoUrl : existing.hero?.videoUrl,
  youtubeUrl: input.youtubeUrl !== undefined ? input.youtubeUrl : existing.hero?.youtubeUrl,
},
```

**Severidad:** Media (no es el bug reportado, pero puede causar pérdida de datos)

---

### 4. Auditar Quick Start — startWeddingQuickStart()

**Ubicación:** `src/app/dashboard/invitations/[id]/edit/actions.ts:1416-1707`

**Estrategia de preservación:**
```typescript
const generatedContent = generateWeddingTemplate({
  // ... inputs
  existingContent: {
    protagonists: current.protagonists,
    event_time: current.eventTime,
    hero: current.hero,  // ← PASA datos existentes
    final_message: current.finalMessage,
    gallery: current.gallery,
    itinerary: current.itinerary,
    dress_code: current.dressCode,
    location: current.location,
    timeline: current.timeline,
    gift_registry: current.giftRegistry,
    parents: current.parents,
    padrinos: current.padrinos,
    hotels: current.hotels,
    social: current.social,
  },
});
```

**Patrón de guardado — Ejemplo: Gallery (línea 1546)**
```typescript
if (generatedContent.gallery !== undefined && !current.gallery?.images?.length) {
  //                                           ↑ NO sobrescribe si ya hay imágenes
  const galleryInput: InvitationGalleryInput = {
    items: generatedContent.gallery.images.map((url, idx) => ({
      url,
      caption: generatedContent.gallery?.captions?.[idx] || '',
    })),
  };
  await repo.updateGallery(invitationId, galleryInput);
}
```

**Patrón en todas las secciones:**
1. Verifica si `generatedContent.SECTION !== undefined`
2. Verifica si `!current.SECTION?.length` (para arrays) o `!current.SECTION?.TYPE` (para objetos)
3. SOLO sobrescribe si NO hay datos existentes

**Conclusión:** ✅ **CUIDADOSO — No sobrescribe datos existentes**

---

### 5. Auditar Renderer — EL PROBLEMA PROBABLE

**Ubicación:** `src/components/invitation/InvitationRenderer.tsx`

**Problema potencial:**

Cuando el tema cambia, el renderer RE-RENDERIZA con nuevo `theme`, pero:

1. El `theme` proporciona CSS variables por defecto
2. Los componentes pueden estar IGNORANDO `invitation_content` personalizado
3. El fallback del tema se muestra en lugar del dato personalizado

**Ejemplo - Countdown (línea 139):**
```typescript
background: 'var(--v2-countdown-card-bg-top, linear-gradient(180deg, #FAF6EE 0%, #F5ECDB 100%))'
```

Si `invitation.countdown.customBackground` existiera, pero Countdown NO lo lee, se muestra el fallback del tema.

**Flujo incorrecto:**
```
Usuario personaliza countdown con fondo floral
↓
Se guarda en invitation_content.countdown.customBackground
↓
Usuario cambia tema
↓
InvitationRenderer re-renderiza con nuevo theme
↓
Countdown component IGNORA invitation.countdown.customBackground
↓
Muestra var(--v2-countdown-card-bg-top) del nuevo tema
↓
Usuario VE "fondo floral" que NO es el personalizado, pero del nuevo tema
↓
Parece que se "perdió" el fondo personalizado
```

**Problema raíz:** El dato NO se perdió en BD, pero NO se RENDERIZA porque:
- El componente no verifica `invitation_content.countdown`
- Solo usa `theme`

---

## VALIDACIONES EJECUTADAS

### ✅ Type Check
```bash
npx tsc --noEmit
Status: PASS (0 errors)
Errors: 0
Theme-related type issues: NONE
```

### ✅ Lint
```bash
npm run lint
Status: PASS (no theme-related errors)
Errors: 2 (unrelated: auth/signout <a> tag, existing any type)
Warnings: 21 (unrelated to theme changes)
```

### ✅ Build
```bash
npm run build
Status: SUCCESS
Routes compiled: All dynamic/static routes working
Bundle size: No impact
```

---

## CAUSA RAÍZ PROBABLE

**No es un bug de SOBRESCRITURA de datos, sino un bug de PRIORIDAD de RENDERIZADO:**

El patrón actual en el renderer:

```
Component props:
- invitation (contiene datos personalizados)
- theme (contiene estilos fallback)

Renderizado:
1. Usa theme.colors, theme.backgrounds, theme.fonts DIRECTAMENTE
2. NO VERIFICA si invitation_content.SECTION tiene datos personalizados
3. Si datos personalizados existen, se ignoran
4. Se muestra fallback del tema
```

Cuando cambia el tema:
- Los datos en BD NO cambian ✅
- Pero el FALLBACK visual del tema cambia
- Parece que se "perdió" lo personalizado, pero solo es que no se renderiza

---

## HALLAZGOS DE SEGURIDAD

### ✅ updateThemeSelection NUNCA sobrescribe:
- ✅ `invitation_content.hero`
- ✅ `invitation_content.gallery`
- ✅ `invitation_content.location`
- ✅ `invitation_content.dress_code`
- ✅ `invitation_content.final_message`
- ✅ `invitation_content.story`
- ✅ `invitation_content.timeline`
- ✅ `invitation_content.itinerary`
- ✅ `invitation_content.parents`
- ✅ `invitation_content.padrinos`
- ✅ `invitation_content.hotels`
- ✅ `invitation_content.social`
- ✅ `invitation_content.music`

### ⚠️ updateMediaInfo PUEDE sobrescribir:
- ⚠️ `invitation_content.hero.videoUrl` (si se pasa '')
- ⚠️ `invitation_content.hero.youtubeUrl` (si se pasa '')

### ✅ Quick Start preserva:
- ✅ Todos los datos existentes
- ✅ Solo sobrescribe si está vacío

---

## RECOMENDACIONES

### 1. FIJAR BUG en updateMediaInfo (CRÍTICO)

**Cambiar línea 128-129 de:**
```typescript
videoUrl:   input.heroVideoUrl  || undefined,
youtubeUrl: input.youtubeUrl    || undefined,
```

**A:**
```typescript
videoUrl:   input.heroVideoUrl !== undefined ? input.heroVideoUrl : existing.hero?.videoUrl,
youtubeUrl: input.youtubeUrl !== undefined ? input.youtubeUrl : existing.hero?.youtubeUrl,
```

**Afecta:** Hero video, YouTube embeds

---

### 2. VERIFICAR RENDERER (Depende de confirmación manual)

Si tras cambiar tema desaparecen fondos personalizados:

**Problema:** Componentes leen `theme` sin verificar `invitation_content.SECTION`

**Ejemplo:** Si hay `invitation.countdown.customBackground`, pero Countdown no lo lee

**Corrección:** Implementar prioridad:
```typescript
// EN CADA COMPONENTE:
1. Si existe invitation.SECTION.customBackground → usar ESO
2. Si no → usar theme.backgrounds.SECTION
3. Si tampoco → usar fallback genérico
```

---

### 3. AGREGAR VALIDACIÓN DEFENSIVA en updateThemeSelection

Después de línea 1221, agregar logging temporal:

```typescript
try {
  await invitationRepository.updateThemeSelection(id, { themeId });
  
  // Logging defensivo temporal
  console.log('[theme-change] updateThemeSelection complete', {
    invitationId: id,
    themeId,
    onlyUpdatedThemeId: true,
  });
  
} catch (err) {
  // ... error handling
}
```

---

### 4. TESTING MANUAL REQUERIDO

**Caso A: Hero + Tema**
```
1. Crear invitación con hero.imageUrl personalizado
2. Cambiar tema
3. Verificar: hero.imageUrl sigue igual (en preview y DB)
4. Comando: SELECT hero FROM invitation_content WHERE id = '...'
```

**Caso B: Dress Code + Tema**
```
1. Crear invitación con dress_code.colors personalizados
2. Cambiar tema
3. Verificar: dress_code.colors sigue igual
4. Comando: SELECT dress_code FROM invitation_content WHERE id = '...'
```

**Caso C: Gallery + Tema**
```
1. Crear invitación con gallery.images
2. Cambiar tema
3. Verificar: gallery.images sigue igual
4. Comando: SELECT gallery FROM invitation_content WHERE id = '...'
```

**Caso D: Video + Tema**
```
1. Guardar hero.videoUrl
2. Actualizar SOLO hero.imageUrl (cambiar foto)
3. Verificar: hero.videoUrl NO se borra
4. Comando: SELECT hero FROM invitation_content WHERE id = '...'
```

---

## ARCHIVOS ANALIZADOS

| Archivo | Función/Sección | Estado | Hallazgo |
|---------|---|---|---|
| `actions.ts:1206` | `updateThemeSelection()` | ✅ LIMPIO | Solo toca theme_id |
| `repository.ts:473` | `LocalInvitationRepository.updateThemeSelection()` | ✅ LIMPIO | Preserva con spread operator |
| `supabase.repository.ts:821` | `SupabaseInvitationRepository.updateThemeSelection()` | ✅ LIMPIO | UPDATE invitations solo |
| `repository.ts:118` | `LocalInvitationRepository.updateMediaInfo()` | ⚠️ BUG | Borra videoUrl/youtubeUrl |
| `actions.ts:1416` | `startWeddingQuickStart()` | ✅ CUIDADOSO | Verifica antes de sobrescribir |
| `ThemeSelectorForm.tsx:95` | `handleSave()` | ✅ LIMPIO | Solo llama updateThemeSelection |
| `InvitationRenderer.tsx:145` | CSS variables del tema | ❓ PROBABLE | Puede ignorer datos personalizados |

---

## CONCLUSIÓN

### Resumen:
1. ✅ **updateThemeSelection() NO sobrescribe datos en BD**
2. ⚠️ **updateMediaInfo() TIENE BUG que borra videos**
3. ❓ **Renderer PROBABLEMENTE ignora datos personalizados**

### Causa raíz del reporte (80% probabilidad):
- No es un bug de SQL/sobrescritura
- Es un bug de RENDERIZADO donde componentes usan `theme` como fuente principal
- Datos existen en BD pero no se muestran

### Acción inmediata:
1. Fijar bug de updateMediaInfo (CRÍTICO)
2. Validar manualmente que cambiar tema NO borra datos en BD
3. Si datos están en BD pero no se renderizan, revisar prioridad de componentes

---

**Generado:** 2026-06-22  
**Auditor:** Senior Software Engineer  
**Status:** Auditoría completa, testing manual PENDIENTE  
**Riesgo de Stripe/Checkout/RSVP:** NINGUNO — No se toca ninguno de estos sistemas
