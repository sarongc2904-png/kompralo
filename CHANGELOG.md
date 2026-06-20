# CHANGELOG — Kompralo

> Registro de cambios para continuidad entre sesiones de IA.
> Formato: fase → archivos → qué se hizo → por qué → estado.

---

## FASE FIX-AUTH-PASSWORD-INVITE-REDIRECT — Corrección de redirect invite y errores dobles en login

Fecha: 2026-06-20

### Problemas corregidos

1. **Callback usaba `redirect=` pero Supabase/webhook enviaban `next=`** — el link de invite llegaba a `/cliente` en vez de `/auth/update-password`.
2. **Default de callback era `/dashboard`** — ahora es `/cliente`.
3. **Login mostraba dos errores simultáneos** — error de enlace expirado + error de contraseña incorrecta.
4. **`/auth/update-password` era página estática** — Next.js la prerenderizaba con `hasSession = false` y siempre mostraba "enlace expirado" aunque el usuario tuviera sesión.
5. **Sin mensaje claro cuando el link expiró** — el action fallaba con error técnico críptico.

### Cambios

- `src/app/auth/callback/route.ts`:
  - Soporta `next=` (prioritario) y `redirect=` (legacy) — `safeNextPath()` valida que sea ruta interna
  - Default cambiado: `/dashboard` → `/cliente`
  - Logs mejorados: `[authCallback] received`, `session exchanged`, `verifyOtp`, `failed`

- `src/app/api/webhook/stripe/route.ts`:
  - `generateLink redirectTo` ahora usa `next=/auth/update-password` (antes `redirect=`)

- `src/app/login/actions.ts`:
  - `requestPasswordReset` ahora usa `next=/auth/update-password` en redirectTo

- `src/app/login/page.tsx`:
  - Errores de enlace (`expired_link`, `invalid_link`) se muestran como aviso amber dismissable — no bloquean el formulario de contraseña
  - El aviso se auto-descarta al enfocar el campo de email o cambiar de modo
  - Soporte para `?mode=forgot` en URL para abrir directamente el modo de recuperación

- `src/app/auth/update-password/page.tsx`:
  - Convertido a Server Component con verificación de sesión (`createServerSupabaseClient`)
  - Con sesión activa: muestra `UpdatePasswordForm` (client component)
  - Sin sesión: muestra UI "Tu enlace expiró" con botón "Solicitar nuevo enlace" → `/login?mode=forgot`
  - `export const dynamic = 'force-dynamic'` previene que Next.js la prerenderice como estática

- `src/app/auth/update-password/UpdatePasswordForm.tsx` (NUEVO):
  - Client component extraído, contiene `useActionState(updatePassword)`

### Notas de configuración Supabase (ops — no código)

Para que los invite/recovery links funcionen, en el Supabase Dashboard deben estar permitidos:
- **Site URL**: `https://kompralo.vercel.app`
- **Redirect URLs** (allowlist): `https://kompralo.vercel.app/**`

### Validación

- `npx tsc --noEmit`: OK
- `npm run build`: OK — `/auth/update-password` aparece como `ƒ` (dynamic)
- Commit: `6d994a7`
- Push: `main → main`

---

## FASE CUSTOMER-PASSWORD-LOGIN-ONE-INVITATION — Login con contraseña y una invitación por compra

Fecha: 2026-06-20

### Objetivo

1. Cliente puede crear contraseña después de la compra y entrar con email+contraseña en visitas posteriores.
2. Magic link queda como fallback/recuperación, no como acceso principal.
3. Cada compra pagada vinculada a una sola invitación. No se puede crear invitación extra desde /cliente.
4. Editor y server actions ya protegidos por email del propietario (preexistente).

### Flujo implementado

**Post-compra (usuario nuevo):**
1. Webhook crea order + invitation (flujo preexistente).
2. Webhook llama `supabase.auth.admin.generateLink({ type: 'invite', email, options: { redirectTo: '/auth/callback?redirect=/auth/update-password' } })`.
3. Si tiene éxito: envía email "Crea tu contraseña" con botón → invite link.
4. Invite link → `/auth/callback` → establece sesión → redirige `/auth/update-password`.
5. Cliente crea contraseña → redirige `/cliente`.
6. Visitas siguientes: `/login` → email+contraseña → `/cliente`.

**Fallback si generateLink falla (non-fatal):**
- Envía email clásico con access token (cookie de 7 días, flujo preexistente).

**Flujo olvidé contraseña:**
- `/login` → modo "forgot" → `resetPasswordForEmail` → email de recuperación.
- Enlace → `/auth/callback?redirect=/auth/update-password` → setear nueva contraseña.

### Archivos creados/modificados

- `src/app/login/actions.ts`:
  - `signInWithPassword(formData)` — nueva acción, usa `supabase.auth.signInWithPassword`, redirige a `/cliente`
  - `requestPasswordReset(formData)` — nueva acción, `resetPasswordForEmail` con redirectTo a `/auth/update-password`
  - `updatePassword(formData)` — nueva acción, `supabase.auth.updateUser({ password })`, redirige a `/cliente`
  - `sendMagicLink` — conservado como fallback

- `src/app/login/page.tsx`:
  - Rediseñado con 3 modos intercambiables: `password` (principal), `forgot`, `magic` (fallback)
  - Modo `password`: email + contraseña + botones para cambiar a otros modos
  - Modo `forgot`: email → enviar enlace de recuperación
  - Modo `magic`: email → enviar magic link (fallback para usuarios sin contraseña)

- `src/app/auth/update-password/page.tsx` (NUEVO):
  - Formulario: nueva contraseña + confirmar contraseña
  - Usa server action `updatePassword`
  - Destino post-compra y post-recovery
  - Link a `/login` si ya tiene contraseña

- `src/app/api/webhook/stripe/route.ts`:
  - Paso 3b: genera invite link con `supabase.auth.admin.generateLink`
  - Non-fatal: si falla, continúa con email de access-token
  - Pasa `inviteUrl` y `loginUrl` a `sendOrderConfirmationEmail`

- `src/lib/resend/emailTemplates.ts`:
  - Nueva función `buildPasswordSetupEmail` con plantilla "Crea tu contraseña"
  - CTA: invite link → `/auth/update-password`
  - Incluye link a `/login` para usuarios que ya tienen contraseña

- `src/lib/resend/sendOrderConfirmationEmail.ts`:
  - Nuevos params opcionales: `inviteUrl`, `loginUrl`
  - Auto-selecciona plantilla: `buildPasswordSetupEmail` si `inviteUrl` presente, `buildOrderConfirmationEmail` si no

- `src/app/cliente/page.tsx`:
  - CTA "Comprar otra invitación" → `/invitaciones/precios` después de la lista
  - No existe ni existirá botón "crear invitación" aquí

### Protección de editor (preexistente, confirmado funcional)

`src/app/dashboard/invitations/[id]/edit/actions.ts` → `getAuthorizedInvitationRepository()`:
- Verifica `sessionEmail === invitation.customerEmail` (login con contraseña lo satisface automáticamente)
- También acepta cookie `kompralo_access` (access-token flow, fallback)
- Admin mode: `ADMIN_ACCESS_ENABLED=true`

### Tablas / schema (sin cambios)

- `invitations.customer_email` — ya existía (patch 7Y-6)
- `invitations.user_id` — nullable, ya existía, no se usa en este flujo (el email-match es suficiente)
- No se agregaron migraciones SQL en esta fase

### TODO (event lock, parte 8)

Bloquear reutilización del mismo slot para eventos completamente diferentes quedó pendiente:
- Opción: después de publicar por primera vez, bloquear `event_type`, nombres principales, `event_date`
- No implementado en esta fase — MVP solo bloquea creación de invitaciones extra

### Validación técnica

- `npx tsc --noEmit`: OK
- `npm run lint`: OK (9 warnings preexistentes, 0 errores nuevos)
- `npm run build`: OK — `/auth/update-password` aparece en ruta estática
- Commit: `0cbb2a3`
- Push: `main → main`

---

## FASE EDITOR-ORDER-MAP-ANIMATION-YOUTUBE-CLEANUP — Editor reordenado, mapa mejorado, YouTube duplicado eliminado

Fecha: 2026-06-20

### Objetivo

1. Reordenar las secciones del editor para que coincidan con el orden de la invitación pública.
2. Mejorar la visibilidad del mapa SVG animado en la sección de Location.
3. Eliminar el campo redundante de YouTube en MediaForm.

### Causa raíz

**Editor desordenado**: Las secciones en `page.tsx` no seguían el orden del renderer público (`InvitationRenderer.tsx`), haciendo poco intuitiva la edición.

**Mapa oscuro**: `surfaceAltVar` resolvía a `#CDB88E` (dorado oscuro), lo que opacaba el fondo del SVG y hacía que la ruta animada fuera poco legible. El overlay inferior `from-black/35` también era demasiado intenso.

**YouTube duplicado**: `MediaForm` tenía un campo `youtubeUrl` separado que se guardaba en DB pero nunca se renderizaba en la invitación pública. El campo `hero.videoUrl` ya acepta YouTube URLs via `getVideoEmbedUrl()`.

### Archivos modificados

- `src/app/dashboard/invitations/[id]/edit/page.tsx`:
  - Secciones reordenadas para coincidir con el orden del renderer público
  - Nuevo orden: Datos generales → Portada y multimedia → Protagonistas → Nuestra historia → Galería → Línea del tiempo → Itinerario → Código de vestimenta → Mesa de regalos → Padrinos → Hospedaje → Redes y hashtag → Mensaje final → Diseño y tema → Secciones activas
  - Títulos renombrados a español natural: "StoryBook" → "Nuestra historia", "Timeline" → "Línea del tiempo", "Dress code" → "Código de vestimenta", "Hashtag y Redes" → "Redes y hashtag", "Multimedia y enlaces" → "Portada y multimedia"

- `src/components/invitation/Location.tsx`:
  - SVG background: `surfaceAltVar` (`#CDB88E`) → `#EDE4D2` (crema claro, fijo)
  - Route glow: `strokeWidth="7" opacity={0.15}` → `strokeWidth="8" opacity={0.30}`
  - Overlay inferior: `from-black/35` → `from-black/18`

- `src/app/dashboard/invitations/[id]/edit/MediaForm.tsx`:
  - Eliminado campo `youtubeUrl` (Video embed) — era redundante, nunca renderizado
  - Renombrado sección label: "Hero" → "Imagen y video de portada"
  - Renombrado campo video: "Video de fondo (URL)" → "Video personalizado de portada"
  - Actualizado hint del campo video para explicar que acepta MP4 o YouTube
  - Actualizado texto del botón: "Guardar multimedia" → "Guardar portada y multimedia"

### Validación final

- `npx tsc --noEmit`: OK
- Commit: `1ce7140`
- Push: `main → main`

---

## FASE AUDIO-BUTTON-AND-CENTERED-SECTIONS-FIX — Botón de música funcional y centrado de regalos/padrinos

Fecha: 2026-06-20

### Objetivo

1. Corregir el botón de música para que sea visible, interactivo y muestre texto claro al usuario.
2. Centrar dinámicamente las secciones Mesa de Regalos y Padrinos igual que el Itinerario.

### Causa raíz

**Botón de música**: El componente `MusicController` renderizaba un botón solo con icono (sin texto) y sin guard para `audioUrl` vacío. Para el plan Gold (`showIntro=false`), `autoPlayTrigger = true` desde el primer render, lo que causaba un intento de autoplay silencioso bloqueado por el navegador. El usuario veía el icono `VolumeX` pero no tenía indicación de que podía taparlo para activar la música. Además, si `audioUrl = ''`, el componente renderizaba igual con un `Audio` sin fuente.

**GiftRegistry**: `grid grid-cols-1 md:grid-cols-3` — sin items suficientes para 3 columnas, las cards quedaban alineadas a la izquierda.

**Padrinos**: `grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5` — con pocas categorías no se centraban.

### Archivos modificados

- `src/components/invitation/MusicController.tsx`:
  - Guard `if (!audioUrl?.trim()) return null` — no renderiza si no hay URL de audio
  - Botón ahora tiene texto visible: **"Activar música"** / **"Música activa"** / **"Toca para reintentar"**
  - Botón tiene forma de pill (`rounded-full pl-3 pr-4`) en lugar de círculo solo
  - El autoplay para Gold sigue fallando silenciosamente (browser policy) — el botón funciona al primer tap
  - `playError` state para feedback visual si `play()` falla tras interacción manual
  - Reducido a un solo componente (eliminada la arquitectura inner/outer innecesaria)

- `src/components/invitation/GiftRegistry.tsx`:
  - `grid grid-cols-1 md:grid-cols-3` → `flex flex-wrap justify-center`
  - Cards con `w-full sm:w-[300px] md:w-[280px]` para centrado con 1, 2 o 3+ items

- `src/components/invitation/Padrinos.tsx`:
  - `grid grid-cols-2 ... lg:grid-cols-5` → `flex flex-wrap justify-center`
  - Cards con `w-[140px] sm:w-[160px]` — tamaño fijo apropiado para el diseño compacto de padrinos

### Campo correcto para audio

`invitation.music.audioUrl` — el renderer lee correctamente `invitation.music.audioUrl` y el repositorio Supabase lo mapea desde `c.music.audioUrl`. No había mismatch de campo. El problema era solo de UX y guard de vacío.

### Comportamiento por caso

| Caso | Antes | Después |
|---|---|---|
| `audioUrl` vacío | Botón visible pero inactivo | Botón oculto (return null) |
| `audioUrl` mp3 válido | Solo icono, sin label | "Activar música" → tap → "Música activa" |
| YouTube en hero + mp3 separado | Funciona igual | Sin cambios (independientes) |
| Mesa de Regalos 1 item | Alineado izq | Centrado |
| Mesa de Regalos 2 items | Alineados izq | Par centrado |
| Mesa de Regalos 3+ | Grid rígido | Wrap centrado |
| Padrinos 1 categoría | Alineada izq | Centrada |
| Padrinos 2 categorías | Alineadas izq | Par centrado |
| Padrinos 3+ | Grid rígido | Wrap centrado responsive |

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK (8 warnings preexistentes — 1 menos que antes por limpieza de MusicController)
- `npm run build`: OK
- Commit: `070ce0d`
- Push: `main → main`

### Notas

- No se tocaron Stripe, webhook, Auth, upload, video fix, itinerary fix ni planes.
- Regla de navegadores: el autoplay con sonido requiere gesto del usuario. Para Platinum el botón "Entrar" actúa como ese gesto. Para Gold el usuario debe tocar el botón de música.
- Si el campo `audioUrl` está vacío en la invitación, el botón no aparece y no hay elementos audio en el DOM.

---

## FASE GOLD-DELUXE-PREVIEW-PARITY-FIX — Gold renderiza todo lo que puede editar

Fecha: 2026-06-20

### Objetivo

Alinear los permisos de edición del editor con los permisos de renderizado. El editor mostraba todas las secciones a Gold, pero el renderer las bloqueaba en preview y público.

### Causa raíz

`goldFeatures` en `src/domain/plans/features.ts` solo tenía habilitadas 7 features. El editor de invitación (`EditInvitationPage`) muestra **todas las secciones** a todos los planes sin chequear features. Por eso Gold podía editar StoryBook, GiftRegistry, Padrinos, Hospedaje y Hashtag/Redes, pero el `FeatureGate` en `InvitationRenderer` las bloqueaba porque `features.showXxx === false` para Gold.

### Features que faltaban en Gold

| Feature | Antes | Después |
|---|---|---|
| `showStoryBook` | `false` | `true` |
| `showGiftRegistry` | `false` | `true` |
| `showParents` | `false` | `true` |
| `showPadrinos` | `false` | `true` |
| `showAccommodation` | `false` | `true` |
| `showHashtag` | `false` | `true` |

### Arquitectura de planes tras el fix

```
basicFeatures    → hero, countdown, RSVP, WhatsApp, finalMessage
goldFeatures     → basic + maps, QR, gallery, music, itinerary, dressCode,
                   timeline, storyBook, giftRegistry, parents, padrinos,
                   accommodation, hashtag
platinumFeatures → gold + showIntro, showGuestbook, showMessages
```

Platinum-exclusivo: `showIntro` (intro cinemática), `showGuestbook`, `showMessages`.

### Archivos modificados

- `src/domain/plans/features.ts` — `goldFeatures` extendido con 6 features; `platinumFeatures` simplificado a solo sus exclusivos
- `src/components/invitation/Hashtag.tsx` — guard `if (!hasSocialContent) return null` antes del render: si hashtag, instagramHandle, tiktokHandle, facebookUrl y youtubeUrl están todos vacíos, la sección no se muestra
- `src/components/invitation/InvitationRenderer.tsx` — logs de diagnóstico expandidos a showStoryBook, showPadrinos, showHashtag, showAccommodation, showGiftRegistry

### Comportamiento por caso

| Caso | Antes | Después |
|---|---|---|
| Gold + StoryBook con slides | ❌ Oculto | ✅ Visible |
| Gold + GiftRegistry | ❌ Oculto | ✅ Visible |
| Gold + Padrinos | ❌ Oculto | ✅ Visible |
| Gold + Hospedaje | ❌ Oculto | ✅ Visible |
| Gold + Hashtag con datos | ❌ Oculto | ✅ Visible |
| Cualquier plan + Redes vacías | Mostraba vacío | ✅ Sección oculta |
| Platinum + Intro cinemática | ✅ Visible | ✅ Visible (exclusivo) |

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK (9 warnings preexistentes, 0 errores)
- `npm run build`: OK
- Commit: `54ccfc0`
- Push: `main → main`

### Notas

- No se tocaron Stripe, webhook, Auth, Supabase orders, upload de imágenes, video fix ni itinerary fix.
- Aplica en `/preview/[id]`, `/i/[slug]`, `/invitacion/[slug]` y rutas públicas equivalentes.
- Los logs de `[features]` en consola del navegador confirmarán qué features están activas por plan en producción.

---

## FASE RENDERER-VIDEO-ITINERARY-FIX — Video embebido y centrado dinámico del itinerario

Fecha: 2026-06-20

### Objetivo

1. Corregir que al ingresar un link de YouTube en el editor, el Hero quedara en blanco (la imagen desaparecía pero el video no se mostraba).
2. Corregir el itinerario para que con 1 o 2 eventos quede centrado, no alineado a la izquierda.

### Causa raíz

**Video**: `Hero.tsx` usaba `<video src={videoUrl}>` directamente. Las URLs de YouTube (`youtu.be/...`, `youtube.com/watch?v=...`) no funcionan como `src` de `<video>` — requieren `<iframe>` con URL de embed. Como `videoUrl` era truthy, la imagen quedaba oculta y el video no cargaba.

**Itinerario**: El grid `grid-cols-1 md:grid-cols-2 lg:grid-cols-4` alinea los items a la izquierda cuando hay menos items que columnas (1 o 2 cards no se centraban).

### Archivos creados

- `src/lib/video/getVideoEmbedUrl.ts` — helper que detecta tipo de URL y devuelve embed seguro:
  - YouTube (youtu.be, youtube.com/watch, youtube.com/embed, /shorts, m.youtube.com) → `youtube.com/embed/ID`
  - Directo (.mp4, .webm, .ogg) → URL original
  - Inválido/vacío → `null`

### Archivos modificados

- `src/components/invitation/Hero.tsx` — usa `getVideoEmbedUrl()`:
  - YouTube → `<iframe>` con `autoplay=1&mute=1&loop=1&controls=0` + `allow` completo + `scale(1.08)` para ocultar barra inferior
  - MP4/WebM → `<video autoPlay muted loop playsInline>`
  - URL inválida o vacía → `<img>` (imagen principal) — nunca queda vacío el Hero
- `src/components/invitation\Itinerary.tsx` — grid → `flex flex-wrap justify-center`:
  - Cards: `w-full sm:w-[280px] md:w-[300px]`
  - 1 item: centrado solo
  - 2 items: par centrado
  - 3+ items: wrap centrado responsive
  - Filtro de items válidos: solo muestra eventos con al menos título, hora o lugar
  - Removido import `LucideIcon` unused

### Comportamiento por caso

| Caso | Antes | Después |
|---|---|---|
| `videoUrl` vacío + `imageUrl` lleno | Imagen | Imagen |
| `videoUrl` = youtu.be/... | ❌ Blanco | ✅ iframe YouTube |
| `videoUrl` inválido + `imageUrl` lleno | ❌ Blanco | ✅ Imagen fallback |
| `videoUrl` .mp4 | Video HTML5 | Video HTML5 |
| Itinerario 1 item | Alineado izq | Centrado |
| Itinerario 2 items | Alineados izq | Par centrado |
| Itinerario 3+ items | Grid rígido | Wrap centrado responsive |

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK (9 warnings preexistentes, 0 errores — 1 menos que antes por LucideIcon removido)
- `npm run build`: OK
- Commit: `187537f`
- Push: `main → main`

### Notas

- No se tocaron Stripe, webhook, Auth, Supabase orders, upload de imágenes, precios ni checkout.
- El iframe de YouTube tiene `pointerEvents: none` para evitar interacciones accidentales en el hero.
- El helper `getVideoEmbedUrl` es puro (sin side effects), testeable en aislamiento.
- Aplica en `/preview/[id]` y en la ruta pública (`/[slug]`, `/i/[slug]`) porque ambas usan `InvitationRenderer`.

---

## FASE STORAGE-BUCKET-MISMATCH-FIX — Diagnóstico y corrección de "Bucket not found"

Fecha: 2026-06-20

### Objetivo

Detectar por qué el editor de producción lanzaba `Error al subir imagen: Bucket not found` aunque el bucket `invitation-assets` existe en Supabase Storage marcado como Public.

### Causa raíz

Los tres helpers de Storage usaban `'invitations'` como nombre de bucket hardcodeado, pero el bucket real en Supabase se llama `'invitation-assets'`. El nombre nunca había coincidido.

| Archivo | Bucket antes | Bucket ahora |
|---|---|---|
| `src/lib/storage/uploadImage.ts` | `invitations` | `invitation-assets` |
| `src/lib/storage/getPublicUrl.ts` | `invitations` | `invitation-assets` |
| `src/lib/storage/deleteImage.ts` | `invitations` | `invitation-assets` |

### Archivos modificados

- `src/lib/storage/uploadImage.ts` — nombre de bucket corregido + logs de diagnóstico + mensaje de error mejorado
- `src/lib/storage/getPublicUrl.ts` — nombre de bucket corregido
- `src/lib/storage/deleteImage.ts` — nombre de bucket corregido + `extractPath` compatible con URLs antiguas `invitations/` y nuevas `invitation-assets/`

### Cambios realizados

1. `BUCKET = 'invitations'` → `BUCKET = 'invitation-assets'` en los tres archivos.
2. Logs seguros antes del upload en `uploadImage.ts`:
   - `[upload] supabaseUrl` — confirma proyecto Supabase conectado
   - `[upload] bucket` — confirma nombre de bucket usado
   - `[upload] folder` y `[upload] filePath`
   - `[upload] buckets` — lista de buckets via `listBuckets()` (si la anon key lo permite)
   - `[upload] bucketsError` — loguea si `listBuckets` no está permitido, sin bloquear el upload
3. Mensaje mejorado cuando `error.message` incluye "Bucket not found":
   > "No encontramos el bucket invitation-assets en el proyecto Supabase conectado. Revisa que NEXT_PUBLIC_SUPABASE_URL apunte al mismo proyecto donde creaste el bucket."
4. `extractPath` en `deleteImage.ts` ahora detecta automáticamente si la URL contiene `/invitations/` o `/invitation-assets/` para soportar imágenes subidas antes del cambio.

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK (10 warnings preexistentes, 0 errores)
- `npm run build`: OK
- Commit: `8b6e54a`
- Push: `main → main`

### Notas

- No se tocaron Stripe, webhook, Auth, Theme Engine, InvitationRenderer ni Dashboard Assistant.
- Si después del deploy los logs muestran que `NEXT_PUBLIC_SUPABASE_URL` apunta a un proyecto diferente al que tiene el bucket, el problema es de variables de entorno en Vercel y no de código.
- Los logs de `listBuckets` en consola del navegador confirmarán qué buckets son visibles desde la anon key del proyecto conectado.

---

## FASE EDITOR-UX-FINAL-FIX — Mejoras UX del editor

Fecha: 2026-06-19

### Objetivo

Corregir error de upload ("Missing environment variable: NEXT_PUBLIC_SUPABASE_URL"), agregar botón de upload de imagen al Timeline, hacer opcionales las redes sociales en SocialForm.

### Archivos modificados

- `src/lib/supabase/client.ts` — usa `tryGetSupabaseEnv()` (non-throwing) en lugar de `getSupabaseEnv()` (throwing); error user-friendly en español
- `src/lib/storage/uploadImage.ts` — agrega `'timeline'` al tipo `StorageFolder`
- `src/app/dashboard/invitations/[id]/edit/TimelineForm.tsx` — agrega `ImageUploadButton` en cada evento de la línea de tiempo
- `src/app/dashboard/invitations/[id]/edit/SocialForm.tsx` — hashtag ya no marcado como required; agrega botón "✕ Quitar" en campos opcionales con valor

### Cambios

**Upload fix**: `createBrowserSupabaseClient()` llamaba `getSupabaseEnv()` que lanza `Error('Missing environment variable: NEXT_PUBLIC_SUPABASE_URL...')` si la variable falta en Vercel. Ahora usa `tryGetSupabaseEnv()` y lanza un mensaje en español amigable para el usuario.

**Timeline upload**: El `TimelineForm` solo tenía campo de URL de texto. Se agregó `ImageUploadButton` (folder: `'timeline'`) encima del campo URL en cada evento, para subir directamente a Supabase Storage.

**Social opcional**: El campo `hashtag` estaba marcado visualmente como requerido (`required` prop). Se removió. Se agregó botón "✕ Quitar" que aparece solo cuando el campo tiene valor (Instagram, TikTok, Facebook, YouTube). El botón limpia el valor del campo.

### Estado

✅ `tsc --noEmit` sin errores

---

## FASE LOGIN-FALLBACK-INVALID-PATH-FIX — Corregir "Invalid path specified in request URL"

Fecha: 2026-06-19

### Objetivo

Corregir el error "Invalid path specified in request URL" que aparecía en `/login` al intentar enviar un enlace de acceso (Magic Link de Supabase fallback).

### Archivos modificados

- `src/app/login/actions.ts` — corrección de `emailRedirectTo` malformado

### Causa exacta

`sendMagicLink` construía:
```ts
const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? '';
emailRedirectTo: `${appUrl}/auth/callback?redirect=...`
```

Dos escenarios de falla:
1. `NEXT_PUBLIC_APP_URL` con trailing slash → `https://kompralo.vercel.app//auth/callback` (doble slash, Supabase GoTrue rechaza con "Invalid path").
2. `NEXT_PUBLIC_APP_URL` vacío → URL relativa `/auth/callback` → Supabase rechaza por no ser absoluta.

### Cambios realizados

1. `new URL(rawAppUrl).origin` — extrae solo `https://kompralo.vercel.app` sin trailing slash ni path, independiente del formato de `NEXT_PUBLIC_APP_URL`.
2. Validación temprana: si `NEXT_PUBLIC_APP_URL` no está configurado o es inválido, retorna error descriptivo al usuario y loguea el problema.
3. Sanitización de `redirectTo`: solo acepta rutas internas (`/` pero no `//`) antes de incrustar en `emailRedirectTo`, previniendo open redirect.
4. Logging seguro (solo `error.message` y contexto, sin tokens).

### No había `.from("public.X")` — se revisaron todos los `.from()` del proyecto y usan tabla sin prefijo de schema. La causa fue exclusivamente la URL malformada.

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK
- `npm run build`: OK
- Commit: `15679e7`

### Notas para producción

Verificar en Supabase Dashboard → Authentication → URL Configuration:
- **Site URL**: `https://kompralo.vercel.app`
- **Allowed redirect URLs**: `https://kompralo.vercel.app/**`

Sin este wildcard, Supabase rechaza el `emailRedirectTo` independientemente del formato de URL.

---

## FASE REDESIGN-PUBLIC-PAGES-EDITORIAL-PREMIUM — Rediseño editorial premium de páginas públicas

Fecha: 2026-06-19

### Objetivo

Elevar las páginas públicas (`/invitaciones`, `/invitaciones/precios`, `/checkout/success`, `/login`, `/cliente`) a una estética editorial de revista y eventos de lujo (tipo Awwwards), utilizando una composición de collage en el hero con imágenes reales generadas, tarjetas de eventos visuales con zoom, sección de testimonios honesta, y optimización de flujos y tipografía sin romper la lógica crítica de negocio.

### Archivos creados / modificados

- `src/app/invitaciones/page.tsx` — reescritura de landing page (collage editorial de imágenes reales, tarjetas visuales de eventos, sección Social Proof con testimonios y foto editorial, acordeón FAQ limpio, hover effects con CSS puro para evitar problemas de hidratación en server components).
- `src/app/invitaciones/precios/page.tsx` — reestructuración de tarjetas con borde dorado viejo, badge "MÁS ELEGIDO" en Premium, microcopy post-compra con Stripe y WhatsApp, orbes decorativos.
- `src/app/checkout/success/page.tsx` — rediseño de confirmación de pago recibido con check SVG, desglose de 4 pasos para Magic Link y edición, botones premium a `/login` y `/cliente` sin redirecciones directas.
- `src/app/login/page.tsx` — rediseño de login con tarjeta warm-minimalist, fondo marfil, logo Kompralo, textos persuasivos sin contraseñas y corrección de tag HTML/JSX mismatch.
- `src/app/cliente/page.tsx` — rediseño de tarjetas de órdenes, pills de estados con colores semánticos, empty state con llamada a la acción y preservación de seguridad por sesión Supabase.
- `public/images/invitaciones/` — **NUEVAS IMÁGENES** generadas con IA (boda, papelería, flores, bautizo, quinceañera, baby shower, cumpleaños, social proof y textura de papel).

### Cambios realizados

1. **Assets generados**: Creación de 9 assets de eventos en formato `.webp` de alta calidad y colocación en `public/images/invitaciones/`.
2. **Textura de papel**: Implementación de una textura de papel `.paper-noise` global aplicada a todas las páginas rediseñadas.
3. **Hero sin Mockup**: Sustitución de PhoneMockup CSS en Hero por un collage de fotos reales con sombras y bordes suavizados de estilo revista.
4. **Tipografía sofisticada**: Uso de fuentes `Playfair Display`, `Cormorant Garamond` e `Inter` para dotar de una jerarquía de tipografía premium a todos los textos comerciales.
5. **Tarjetas de Eventos Visuales**: Tarjetas de tipos de evento que usan las imágenes generadas como fondo, con superposición oscura, efecto de zoom dinámico, filtro de blanco y negro por defecto en pantallas de escritorio (que pasa a color en hover) y color completo por defecto en dispositivos móviles.
6. **Prueba Social Editorial**: Sección de testimonios reales "Creada para momentos que merecen compartirse bonito" con alineación en dos columnas (foto editorial + citas con tipografía Lora cursiva).
7. **Diseño de Precios**: Destacado sutil del plan Premium con color Negro Editorial (`#0F0C09`), badge dorado "MÁS ELEGIDO" y borde old-gold (`#B8966A`).
8. **Flujos guiados**: Explicación de los próximos pasos en `/checkout/success` y `/login` de forma guiada para reducir la fricción en el Magic Link.
9. **Compatibilidad RSC**: Corrección de error de compilación Next.js por uso de manejadores de eventos JavaScript (`onMouseEnter`/`onMouseLeave`) en componentes del servidor (RSC); reemplazado por hover en CSS puro (`.aw-btn-primary:hover` y `.aw-btn-secondary:hover`).
10. **QA y Compilación**: Pruebas de compilación TypeScript y linter 100% exitosas.

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK (0 errores)
- `npm run build`: OK

---

## FASE AWWWARDS-PUBLIC-LANDING-UPGRADE — Diseño editorial premium con Framer Motion

Fecha: 2026-06-19

### Objetivo

Elevar todas las páginas públicas a calidad Awwwards usando Framer Motion (ya instalado v12.40.0), tipografía editorial (Playfair Display / Cormorant Garamond), paleta ivory/cream/gold/dark y motion con curva `[0.65, 0, 0.35, 1]`. Mockup de teléfono CSS puro con dynamic island y badges flotantes.

### Archivos creados / modificados

- `src/components/public/Motion.tsx` — **NUEVO** — Client Component con Reveal, Stagger, Item, HoverCard, HoverButton
- `src/app/invitaciones/page.tsx` — reescritura completa (editorial, phone mockup, DemoTeaser, dark benefits, event cards)
- `src/app/invitaciones/precios/page.tsx` — Stagger/Item/HoverCard en cards, badge MÁS POPULAR, planMeta, microcopy post-compra
- `src/app/checkout/success/page.tsx` — Reveal, check animado SVG, próximos pasos con íconos, sin `/dashboard` links
- `src/app/login/page.tsx` — animación de entrada, orbs decorativos, gold accent top, inputs con focus ring gold

### Cambios realizados

1. **`Motion.tsx`** — utilidades de scroll reveal (`Reveal`, `Stagger`, `Item`) y hover (`HoverCard`, `HoverButton`) con `useInView`. Fire-once, margin `-72px 0px`. Easing cubic `[0.65, 0, 0.35, 1]`.
2. **`/invitaciones` hero** — animaciones CSS puras (no JS) para LCP rápido: `aw-hero-label`, `aw-hero-h1`, `aw-hero-body`, `aw-hero-cta`, `aw-phone-in`. Framer Motion solo debajo del fold.
3. **Phone mockup CSS** — iPhone simulado con dynamic island (oval recortado), contenido de invitación de boda, 3 badges flotantes (`aw-badge-a/b/c`) con rotación + float estagger.
4. **DemoTeaser** — nueva sección con enlace a demo `/sofia-y-alejandro`.
5. **5 event cards** — gradientes únicos por tipo de evento, inicial decorativa fantasma, hover lift.
6. **Benefits section** — fondo dark, íconos en anillo gold, stagger reveals.
7. **`/precios`** — `ProductCard` envuelto en `HoverCard`, featured card dark con inset box-shadow dorado, badge MÁS POPULAR, `planMeta` con copy `ideal` + `highlight`.
8. **`/checkout/success`** — eliminados links a `/dashboard`, eliminado `?email=` de URLs, email mostrado solo en la UI del card de próximos pasos.
9. **`/login`** — animación de entrada card, orbs radial gradient, top accent gold 3px, foco gold `rgba(184,150,106,0.14)`.
10. **`prefers-reduced-motion`** — todos los `@keyframes` deshabilitados vía media query CSS en cada página.
11. Fix TS1117: eliminada propiedad `color` duplicada en `TopNav` del `<Link>` de "Ver planes".

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK
- `npm run build`: OK
- Commit: `d672020`

### Notas

- GSAP instalado pero no utilizado — Framer Motion fue suficiente.
- Páginas raíz permanecen Server Components (`○` static en build output).
- `CheckoutButton` no modificado; recibe `productId`, `label`, `className` sin cambios.

---

## FASE PUBLIC-PAGES-PREMIUM-MOTION-VISUALS — Animaciones CSS y mejoras visuales premium

Fecha: 2026-06-19

### Objetivo

Agregar animaciones CSS/JS, phone mockup, hover lifts, event cards con gradientes únicos y mejoras visuales a todas las páginas públicas sin tocar lógica crítica (Stripe, Auth, Supabase, checkout, webhook).

### Archivos modificados

- `src/app/invitaciones/page.tsx` — phone mockup, badges flotantes, event cards con color, benefits dark section, step connectors
- `src/app/invitaciones/precios/page.tsx` — pricing cards con hover, badge MÁS POPULAR, trust microcopy
- `src/app/checkout/success/page.tsx` — check animado, próximos pasos, eliminados links a `/dashboard`
- `src/app/login/page.tsx` — animación de entrada, focus ring gold, back link, "Ver planes" footer
- `src/app/cliente/page.tsx` — `OrderCard` mejorado, empty state con CTA a precios

### Cambios realizados

1. Phone mockup CSS puro en hero de `/invitaciones`: dynamic island, contenido de invitación, badges flotantes.
2. 5 cards de tipo de evento con gradientes únicos y letra decorativa fantasma.
3. Benefits section con fondo dark y anillos icon dorados.
4. Hover lift en pricing cards (`transform: translateY`).
5. Badge "MÁS POPULAR" sobre la card de Premium.
6. Success page: check SVG animado con spring, card de próximos pasos, eliminado `?email=` de URL.
7. Login: animación entrada card, orb decorativo, focus gold, footer link.
8. Cliente: `OrderCard` con border verde en `paid`, pills de estado con color, empty state descriptivo.
9. `prefers-reduced-motion` en todos los `@keyframes`.

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK
- `npm run build`: OK
- Commit: `d58d6a7`

---

## FASE EXPERT-TEAM-PUBLIC-PAGES-UPGRADE — Creación y mejora de páginas públicas

Fecha: 2026-06-19

### Objetivo

Crear la landing `/invitaciones` (inexistente, daba 404), mejorar `/invitaciones/precios`, corregir `/checkout/success` y redirigir `/` a `/invitaciones` en producción.

### Archivos creados / modificados

- `src/app/invitaciones/page.tsx` — **CREADO** — landing page completa con hero, features, HowItWorks, event types, pricing teaser, FAQs, footer
- `src/app/invitaciones/precios/page.tsx` — mejorado con mejor copy, trust signals, CheckoutButton funcional
- `src/app/checkout/success/page.tsx` — eliminados links a `/dashboard`, eliminado `?email=` en URL, guidance de magic link
- `src/app/page.tsx` — redirect a `/invitaciones` en producción, muestra DevPlayground en desarrollo
- `src/app/login/page.tsx` — mejoras de copy y UX
- `src/app/cliente/page.tsx` — mejoras de OrderCard y empty state

### Cambios realizados

1. `src/app/invitaciones/page.tsx` creado desde cero — ruta antes era 404.
2. `src/app/page.tsx` actualizado: `redirect('/invitaciones')` en producción, `<DevPlayground />` en desarrollo.
3. `/checkout/success`: removidos dos links a `/dashboard` (ruta admin), removido `?email=` de href de `/cliente`.
4. `/invitaciones/precios`: mejor copy por plan, microcopy post-compra, trust signals.
5. `/login`: copy actualizado, link de regreso a `/invitaciones`.
6. `/cliente`: OrderCard mejorado, empty state con CTA.

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK
- `npm run build`: OK
- Commit: `b708439`

### Notas

- Las tres rutas públicas (`/invitaciones`, `/invitaciones/precios`, `/login`) permanecen `○` (static) en el build output de Next.js.
- `CheckoutButton` no fue modificado en ningún momento.
- No se tocaron: Stripe, webhook, Supabase, Auth, Theme Engine V2, InvitationRenderer, MultilayerBackground, checkout flow, magic link flow.

---

## FASE FEATURES-UI-SPACING-FIX — Espaciado y layout responsive del catálogo de features

Fecha: 2026-06-19

### Objetivo

Mejorar el espaciado, padding y legibilidad del catálogo de features en `/dashboard/features` sin cambiar lógica ni contenido.

### Archivos modificados

- `src/app/dashboard/features/page.tsx`

### Cambios realizados

1. Padding de filas de tabla: `py-3 pr-4` → `1rem 1.5rem` por celda (16px vertical, 24px horizontal).
2. Primera columna: ahora tiene `paddingLeft: 1.5rem` tanto en `<th>` como en `<td>`.
3. Badges: tamaño `text-[9px]` → `0.6875rem`; padding `0.25rem 0.625rem`; gap entre badges de `4px` a `6px`.
4. Descripciones: `lineHeight: 1.6` explícito; color `#6B5B4E` (más legible que `#9B8878`).
5. Feature key (monospace): `text-[10px]` → `0.7rem` con margen superior explícito.
6. Tabla en desktop: `overflowX: auto` para evitar overflow en contenedores angostos.
7. Mobile (< 768px): tabla oculta, reemplazada por cards por feature con nombre + badges + descripción + flags.
8. Leyenda: gap `0.625rem`, padding `1rem 1.25rem`, badges más grandes.
9. Separación entre secciones: `mb-8` → `marginBottom: 2.5rem`.
10. `maxWidth: 960` en el contenedor — no se estira en pantallas anchas.

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK, 10 warnings preexistentes
- `npx next build`: OK
- Commit: `b5c2771`

### Notas

- No se tocaron Stripe, webhook, Supabase, Auth, Dashboard Assistant, Theme Engine ni InvitationRenderer.
- No se cambió ninguna lógica de features ni estados.
- Solo cambios visuales/layout.

---

## FASE CLIENT-DASHBOARD-REAL-SESSION-QA — Seguridad y guardado del dashboard de cliente

Fecha: 2026-06-19

### Objetivo

QA del flujo completo de sesión real: Magic Link → `/cliente` → dashboard → editar → guardar → persistir en Supabase. Se detectaron y corrigieron bugs de seguridad y guardado antes del push.

### Bugs encontrados y corregidos

1. `actions.ts` bloqueaba saves cuando `customer_email` es null en la DB.
   - Archivo: `src/app/dashboard/invitations/[id]/edit/actions.ts`
   - Causa: `!ownerEmail` en la condición de ownership hacía throw aunque hubiera sesión válida.
   - Síntoma: cliente con sesión real no podía guardar cambios si su invitación no tenía `customer_email` registrado (e.g., patch SQL no aplicado aún, o invitación anterior al campo).
   - Corrección: separada la lógica en dos condiciones: (a) sin sesión → error; (b) con ownerEmail Y mismatch → error. Si ownerEmail es null, se confía en la sesión.

2. Clientes autenticados podían acceder a `/dashboard`, `/dashboard/invitations`, `/dashboard/rsvps` y `/dashboard/features` que listaban TODAS las invitaciones de todos los clientes.
   - Archivos: `src/app/dashboard/layout.tsx`, `src/app/dashboard/page.tsx`, `src/app/dashboard/invitations/page.tsx`, `src/app/dashboard/rsvps/page.tsx`, `src/app/dashboard/features/page.tsx`
   - Corrección: nav links divididos en `ADMIN_NAV_LINKS` y `CUSTOMER_NAV_LINKS` (clientes solo ven "← Mis invitaciones" y "← Ver sitio"). Cada página de listado tiene `if (!isAdminMode()) redirect('/cliente')` al inicio.

### Archivos modificados

- `src/app/dashboard/invitations/[id]/edit/actions.ts`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/page.tsx`
- `src/app/dashboard/invitations/page.tsx`
- `src/app/dashboard/rsvps/page.tsx`
- `src/app/dashboard/features/page.tsx`

### Observaciones pendientes (acción manual)

- Confirmar `NEXT_PUBLIC_APP_URL=https://kompralo.vercel.app` en Vercel.
- Confirmar Site URL y Redirect URL en Supabase Dashboard → Authentication → URL Configuration.
- Confirmar que la columna `customer_email` existe en la tabla `invitations` (SQL patch `supabase/auth_7b_customer_access_patch.sql`).
- Hacer prueba real del flujo completo con un email que tenga una orden en la DB.

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK, 10 warnings preexistentes
- `npx next build`: OK
- Commit: `4bd98ae`

### Notas

- No se tocaron Stripe, webhook, orders, Resend, Pricing, Theme Engine, InvitationRenderer ni Dashboard Assistant.
- Solo se corrigieron bugs de Auth, seguridad de datos y guardado del editor.

---

## FASE AV-1-QA — Auditoría completa del asistente virtual local

Fecha: 2026-06-19

### Objetivo

Auditar el asistente virtual local de KOMPRALO para confirmar que aparece solo donde debe, no rompe SSR, no causa errores de hidratación, las intenciones locales funcionan, localStorage es robusto, el apagado por variable funciona y TypeScript/lint/build siguen limpios.

### Bugs encontrados y corregidos

1. `'quinceañera'` como keyword no normalizada.
   - Archivo: `src/features/virtual-assistant/assistantRules.ts`
   - Causa: la función `has()` compara texto normalizado (sin ñ) contra keywords con ñ — nunca coinciden.
   - Corrección: cambiado a `'quinceanera'` (ya normalizado).

2. `'edito'` no detectado en la intención de edición.
   - Archivo: `src/features/virtual-assistant/assistantRules.ts`
   - Síntoma: "cómo edito mi invitación" caía a fallback en lugar de responder sobre el editor.
   - Corrección: agregados `'edito'` y `'como edito'` a los keywords de edición.

3. `'mensaje'` ausente de la intención de textos.
   - Archivo: `src/features/virtual-assistant/assistantRules.ts`
   - Síntoma: "dame un mensaje para boda" caía a fallback.
   - Corrección: agregados `'mensaje para'` y `'dame un mensaje'` al intent H (textos).

4. `'magic link'` en el paso 4 de "Cómo funciona" confundía tráfico frío.
   - Archivo: `src/features/virtual-assistant/assistantRules.ts`
   - Corrección: cambiado a "Haces clic en el enlace del correo para entrar."

5. `'donde esta'` demasiado amplio en post-compra.
   - Archivo: `src/features/virtual-assistant/assistantRules.ts`
   - Corrección: cambiado a `'donde esta mi invitacion'` para evitar falsos positivos.

6. `'boda'` duplicado en keywords de textos.
   - Archivo: `src/features/virtual-assistant/assistantRules.ts`
   - Corrección: eliminado el duplicado.

7. z-index excesivo (9000/8999) en burbuja y panel.
   - Archivos: `src/features/virtual-assistant/AssistantBubble.tsx`, `AssistantChat.tsx`
   - Corrección: reducido a 1050 (burbuja) y 1040 (panel) — por encima de modales comunes, sin excesos.

8. Copy de RSVP técnico y vago.
   - Archivo: `src/features/virtual-assistant/assistantRules.ts`
   - Corrección: reescrito con lenguaje directo y empuje comercial.

9. Copy de WhatsApp sin cierre.
   - Archivo: `src/features/virtual-assistant/assistantRules.ts`
   - Corrección: mejorado para cerrar en beneficio (sin app, desde el celular).

### Archivos modificados

- `src/features/virtual-assistant/assistantRules.ts`
- `src/features/virtual-assistant/AssistantBubble.tsx`
- `src/features/virtual-assistant/AssistantChat.tsx`

### Validación final

- `npx tsc --noEmit`: OK
- `npx eslint src/features/virtual-assistant/`: OK, 0 warnings
- `npx next build`: OK

### Notas

- No se tocaron Stripe, webhook, Supabase Auth, Theme Engine, InvitationRenderer ni MultilayerBackground.
- No se conectó OpenAI. El asistente sigue siendo 100% local.
- No se modificó el flujo de login/magic link.

---

## FASE AV-1 — Asistente virtual local para KOMPRALO

Fecha: 2026-06-19

### Objetivo

Agregar un widget de chat flotante 100% local (sin IA externa) para visitantes de KOMPRALO. Aparece solo en rutas permitidas, se controla por variable de entorno y no toca el dashboard ni servicios externos.

### Archivos creados

- `src/features/virtual-assistant/types.ts`
- `src/features/virtual-assistant/assistantConfig.ts`
- `src/features/virtual-assistant/assistantKnowledgeBase.ts`
- `src/features/virtual-assistant/assistantRules.ts`
- `src/features/virtual-assistant/AssistantBubble.tsx`
- `src/features/virtual-assistant/AssistantMessage.tsx`
- `src/features/virtual-assistant/AssistantInput.tsx`
- `src/features/virtual-assistant/AssistantChat.tsx`
- `src/features/virtual-assistant/VirtualAssistantWidget.tsx`
- `src/features/virtual-assistant/VirtualAssistantMount.tsx`
- `src/features/virtual-assistant/index.ts`

### Archivos modificados

- `src/app/layout.tsx` — agrega `<VirtualAssistantMount />` antes de `</body>`
- `.env.example` — agrega `NEXT_PUBLIC_VIRTUAL_ASSISTANT_ENABLED=false`

### Variable de entorno

```
NEXT_PUBLIC_VIRTUAL_ASSISTANT_ENABLED=true   # muestra el widget
NEXT_PUBLIC_VIRTUAL_ASSISTANT_ENABLED=false  # oculta el widget (default seguro)
```

### Rutas donde aparece el widget

- `/invitaciones`
- `/invitaciones/precios`
- `/checkout/success`
- `/cliente`

### Intenciones implementadas (9)

| Intent | Detecta | Acción |
|--------|---------|--------|
| A. Precios | precio, costo, cuanto cuesta, planes, paquetes... | Muestra 3 planes con precio + CTA Ver precios |
| B. Recomendador | qué plan me conviene, cuál elijo, recomiéndame... | Explica diferencias y pregunta por categoría |
| C. Cómo funciona | cómo funciona, proceso, pasos... | 6 pasos: elegir → pagar → correo → entrar → editar → compartir |
| D. Post-compra | ya compré, pagué, no me llegó... | Instruye revisar spam + botón acceso login |
| E. Edición | editar, edito, cómo edito, cambiar nombre... | Lista campos editables + botón acceso |
| F. WhatsApp | whatsapp, compartir, link de la invitación... | Explica compartir por link sin app |
| G. RSVP | rsvp, confirmación, asistencia... | Explica confirmación desde el enlace |
| H. Textos | texto, frase, mensaje para, escribe... | Devuelve texto por categoría: boda/xv/baby/bautizo/cumpleaños |
| I. Fallback | todo lo demás | Lista capacidades + quick actions |

### Características técnicas

- SSR-safe: `if (!widgetState.hydrated) return null` evita hidratación mismatch.
- localStorage: `safeGetItem`/`safeSetItem` con try/catch. Claves: `kompralo_virtual_assistant_messages`, `kompralo_virtual_assistant_open`.
- Animación: `AnimatePresence` + `motion.div` de Framer Motion.
- Escape key cierra el panel.
- Acciones rápidas en el mensaje inicial: Ver precios · ¿Qué plan me conviene? · ¿Cómo funciona? · Ya compré.

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK
- `npx next build`: OK

### Notas

- No se tocaron Stripe, webhook, Supabase Auth, Theme Engine, InvitationRenderer ni MultilayerBackground.
- El asistente es un módulo aislado en `src/features/virtual-assistant/`. No se agrega al dashboard editor.
- No conecta OpenAI. Toda la lógica es local en `assistantRules.ts`.

---

## FASE 7B — Auth Cliente / Magic Link

Fecha: 2026-06-19

### Objetivo

Implementar Supabase Auth con magic link para proteger el dashboard y el área de cliente. Los clientes acceden a su editor via enlace mágico enviado al correo de compra. Admin bypass disponible con `ADMIN_ACCESS_ENABLED=true`.

### Archivos creados

- `src/app/login/page.tsx` — formulario de magic link con `useActionState`, pre-rellena email desde `?email=`, muestra estado success/error
- `src/app/login/actions.ts` — Server Action `sendMagicLink()`, llama `supabase.auth.signInWithOtp()`
- `src/app/auth/callback/route.ts` — GET handler, maneja flujo PKCE (`code`) y OTP (`token_hash+type`), sanitiza `redirect` contra open redirect
- `src/middleware.ts` — inyecta header `x-pathname`, refresca sesión Supabase, matcher excluye estáticos
- `supabase/auth_7b_customer_access_patch.sql` — `ALTER TABLE invitations ADD COLUMN IF NOT EXISTS customer_email text` + índice

### Archivos modificados

- `src/app/dashboard/layout.tsx` — async, lee `x-pathname` vía `headers()`, redirige a login con path exacto si no hay sesión
- `src/app/dashboard/invitations/[id]/edit/page.tsx` — verifica sesión, verifica ownership (`invitation.customerEmail === session.user.email`), muestra "Acceso no autorizado" si no coincide
- `src/domain/invitations/types.ts` — agrega `customerEmail?: string | null` a `InvitationContent`
- `src/domain/invitations/supabase.repository.ts` — mapea `customer_email` del row
- `src/app/cliente/page.tsx` — sesión toma precedencia sobre `?email=`; si no hay sesión y admin mode está apagado, redirige a login
- `src/lib/resend/emailTemplates.ts` — CTA del correo de compra ahora apunta a `/login?email=...&redirect=.../edit` cuando hay `customerEmail`
- `src/lib/resend/sendOrderConfirmationEmail.ts` — pasa `customerEmail: params.to`
- `.env.example` — documenta comportamiento de `ADMIN_ACCESS_ENABLED` en producción vs desarrollo
- `docs/AUTH_CLIENT_ACCESS.md` — documentación completa del flujo

### Flujo magic link

```
Compra Stripe → webhook → Resend email con CTA →
  /login?email=cliente@email.com&redirect=/dashboard/invitations/[id]/edit →
    signInWithOtp() → correo con enlace →
      /auth/callback?code=...&redirect=... →
        exchangeCodeForSession() → cookies de sesión →
          /dashboard/invitations/[id]/edit (con sesión válida)
```

### Seguridad implementada

- Open redirect sanitizado: `startsWith('/') && !startsWith('//')`.
- Ownership check: `customerEmail.toLowerCase() === session.user.email.toLowerCase()`.
- `x-pathname` header para redirect exacto desde layout sin conocer la URL actual.
- `ADMIN_ACCESS_ENABLED=false` en producción bloquea acceso sin sesión.

### Bugs corregidos en QA (FASE 7B-QA)

1. Open redirect en `/auth/callback` — fix: validar que el redirect sea relativo.
2. Layout redirigía siempre a `/login?redirect=/dashboard` sin importar la ruta — fix: middleware inyecta `x-pathname`.
3. `isAdminMode()` declarada entre imports en el edit page — fix: movida después de todos los imports.

### Validación final

- `npx tsc --noEmit`: OK
- `npm run lint`: OK
- `npx next build`: OK

### Notas

- No se tocaron Stripe, webhook, Theme Engine, InvitationRenderer ni MultilayerBackground.
- Supabase Dashboard requiere: Email Provider habilitado, Site URL configurado, Redirect URL `/auth/callback` permitida.
- SQL patch es idempotente (`IF NOT EXISTS`) — seguro de re-ejecutar.

---

## FASE CLIENT-DASHBOARD-E2E-QA - Fix de guardado real del editor

Fecha: 2026-06-19

### Objetivo

Validar login, `/cliente`, dashboard y guardado persistente real en Supabase.

### Archivos modificados

- `src/app/dashboard/invitations/[id]/edit/actions.ts`

### Resultado

- Se detecto que las Server Actions del editor usaban el repositorio global con cliente anonimo/fallback.
- Se agrego validacion server-side de propietario por sesion Supabase contra `invitation.customerEmail`.
- Las escrituras del editor ahora usan `SupabaseInvitationRepository` con service role solo despues de validar permiso.
- `ADMIN_ACCESS_ENABLED=true` conserva modo admin/dev.
- No se tocaron Stripe, webhook, orders, Resend, Theme Engine, InvitationRenderer, Pricing ni asistentes.

### Validacion local

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

---

## FASE PRODUCTION-CONFIG-SETUP - Configuracion incompleta por falta de URL

Fecha: 2026-06-18

### Objetivo

Preparar ambiente real/test para poder ejecutar compra final de prueba.

### Archivos creados

- `docs/PRODUCTION_CONFIG_SETUP_REPORT.md`

### Resultado

- Veredicto: `Configuracion incompleta`.
- Motivo: no existe URL publica HTTPS real configurada en repo ni entorno.
- Sin URL real no se puede configurar correctamente `NEXT_PUBLIC_APP_URL`, Stripe webhook, Supabase Auth Redirect URLs ni redeploy final.

### Revisado

- `.env.example` existe solo con placeholders.
- No existe `.env.local`, `.env.production` ni `.env`.
- No se detecto configuracion local de Vercel/Hostinger/Netlify.
- No se detecto URL real tipo `kompralo.com.mx`, `hostingersite.com` o `vercel.app`.

### Pendiente manual

- Definir URL publica HTTPS real.
- Configurar variables publicas y privadas en hosting.
- Aplicar/verificar SQL en Supabase.
- Configurar bucket `invitations`.
- Configurar Supabase Auth Email + Redirect URLs.
- Configurar Stripe test keys y webhook del dominio real.
- Configurar Resend API key y remitente verificado.
- Ejecutar redeploy.
- Probar rutas y apertura de Stripe Checkout.

### Validacion local

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

---

## FASE PRODUCTION-E2E-REAL - Validacion real bloqueada por ambiente

Fecha: 2026-06-18

### Objetivo

Validar flujo real con Stripe, Supabase, Resend y Magic Link.

### Archivos creados

- `docs/PRODUCTION_E2E_REAL_REPORT.md`

### Resultado

- Veredicto: `No listo`.
- Motivo: no hay `.env.local`, `.env.production`, `.env` ni variables criticas cargadas en el proceso.
- Sin variables reales no se puede ejecutar compra Stripe, webhook, Supabase real, Resend real, Magic Link real, guardado persistente ni idempotencia real.

### Precheck local

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

### Variables auditadas

Todas faltantes en el proceso:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `OPENAI_API_KEY`
- `ASSISTANT_AI_ENABLED`
- `DASHBOARD_ASSISTANT_ALLOWED_PLANS`
- `ADMIN_ACCESS_ENABLED`

### Secret scan

- No se detectaron claves reales en codigo fuente.
- Solo placeholders documentales en `docs/SUPABASE_SETUP.md` y `docs/VIRTUAL_ASSISTANT.md`.

### Pendiente para aprobar lanzamiento

- Probar Stripe test/live real.
- Confirmar webhook real.
- Confirmar Supabase real y SQL aplicado.
- Confirmar Resend real.
- Confirmar Magic Link real.
- Confirmar `/cliente` con sesion real.
- Confirmar guardado persistente en Supabase.
- Confirmar idempotencia reenviando evento desde Stripe Dashboard.

---

## FASE SECURITY-CLIENTE-PRODUCTION - Endurecer /cliente

Fecha: 2026-06-18

### Objetivo

Proteger `/cliente` para que en produccion solo muestre ordenes del usuario autenticado por Supabase Auth.

### Archivos modificados

- `src/app/cliente/page.tsx`
- `docs/FINAL_LAUNCH_TEST_REPORT.md`
- `docs/AUTH_CLIENT_ACCESS.md`
- `CHANGELOG.md`

### Cambios realizados

1. `/cliente` ahora resuelve email de forma segura:
   - Si existe sesion, usa solo `session.user.email`.
   - Si no hay sesion y `ADMIN_ACCESS_ENABLED=false`, redirige a `/login?redirect=/cliente`.
   - Si no hay sesion y `ADMIN_ACCESS_ENABLED=true`, permite fallback admin/dev con `?email=`.

2. `?email=` queda deshabilitado en produccion:
   - Se ignora cuando hay sesion.
   - Se ignora cuando no hay sesion y admin mode esta apagado.

3. UI admin/dev:
   - Muestra aviso `Modo admin/dev: vista por email habilitada.`
   - El formulario de busqueda por email solo aparece en admin/dev sin sesion.

4. Documentacion:
   - `AUTH_CLIENT_ACCESS.md` actualizado con comportamiento de produccion y admin/dev.
   - `FINAL_LAUNCH_TEST_REPORT.md` actualizado para marcar `/cliente` como corregido.

### QA ejecutado

- `ADMIN_ACCESS_ENABLED=false` + sin sesion + `/cliente` -> `307 /login?redirect=/cliente`.
- `ADMIN_ACCESS_ENABLED=false` + sin sesion + `/cliente?email=test@test.com` -> `307 /login?redirect=/cliente`.
- Con sesion, `/cliente?email=otro@email.com` usa el email de sesion por flujo de codigo (`sessionEmail ?? adminEmail`).
- `ADMIN_ACCESS_ENABLED=true` + sin sesion + `/cliente?email=test@test.com` -> `200` con aviso admin/dev.
- `ADMIN_ACCESS_ENABLED=true` + sin sesion + `/cliente` -> `200` con aviso admin/dev y mensaje controlado.

### Validacion final

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

---

## FASE LAUNCH-TEST-FINAL - Prueba final de lanzamiento SaaS

Fecha: 2026-06-18

### Objetivo

Auditar el estado final de lanzamiento de KOMPRALO SaaS con validacion local, revision de configuracion, scan de secretos, rutas criticas e integraciones Stripe/Supabase/Resend/OpenAI.

### Archivos creados

- `docs/FINAL_LAUNCH_TEST_REPORT.md`

### Archivos modificados

- `.env.example`
- `CHANGELOG.md`

### Cambios aplicados

1. `.env.example` quedo con defaults seguros para lanzamiento:
   - `NEXT_PUBLIC_APP_URL=`
   - `ADMIN_ACCESS_ENABLED=false`

2. Se creo reporte final de launch test con:
   - Ambiente probado
   - Variables criticas
   - Resultado Supabase/Stripe/Resend/Magic Link
   - Resultado dashboard movil
   - Resultado asistentes
   - Bugs encontrados/corregidos/pendientes
   - Veredicto final

### Evidencia local

- Rutas locales probadas en `http://127.0.0.1:3003`:
  - `/`
  - `/invitaciones/precios`
  - `/checkout/success?session_id=falso`
  - `/cliente`
  - `/login`
  - `/dashboard/invitations/wedding-sofia-alejandro/edit`
- `/api/assistant` respondio 200 con `source: "local-rules"`.
- Secret scan redaccionado no encontro llaves reales en codigo fuente.

### Veredicto

- Estado: `No listo para vender en produccion todavia`.
- Motivo: falta E2E real con Stripe + Supabase + Resend y quedan riesgos pendientes de seguridad/persistencia antes de ventas reales.

### Pendientes criticos

- Ejecutar compra real/test con Stripe Dashboard.
- Confirmar webhook e idempotencia real.
- Confirmar SQL aplicado en Supabase real.
- Confirmar email real con Resend.
- Confirmar Magic Link real.
- Confirmar persistencia real del dashboard contra Supabase.
- Endurecer `/cliente` para no mostrar ordenes por email sin sesion.

---

## FASE DASHBOARD-MOBILE-FIX - Dashboard responsive en movil

Fecha: 2026-06-18

### Objetivo

Corregir el layout responsive del dashboard editor para que `/dashboard/invitations/wedding-sofia-alejandro/edit` sea usable desde celular sin redisenar el dashboard ni tocar servicios externos.

### Archivos creados

- `src/app/dashboard/DashboardShell.tsx`

### Archivos modificados

- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/invitations/[id]/edit/page.tsx`
- `src/app/dashboard/invitations/[id]/edit/EditForm.tsx`
- `CHANGELOG.md`

### Cambios realizados

1. Sidebar responsive.
   - Desktop mantiene sidebar lateral.
   - Mobile cierra el sidebar por defecto.
   - Mobile usa drawer overlay con boton `Menu` y control `Cerrar`.
   - El contenido deja de quedar comprimido por el sidebar.

2. Layout movil del editor.
   - Wrapper principal con `min-w-0` y `overflow-x-hidden`.
   - Editor ocupa `100%` del ancho disponible en mobile.
   - Preview lateral queda solo desde `xl`, como antes.
   - Titulo y slug ahora pueden hacer wrap sin forzar overflow horizontal.

3. Formularios.
   - Grids de dos columnas pasan a una columna en mobile y dos desde `sm`.
   - Acciones permiten wrap para no desbordar.
   - Inputs y textareas conservan `w-full`.

### QA visual ejecutada

Chrome headless contra `http://127.0.0.1:3003/dashboard/invitations/wedding-sofia-alejandro/edit`:

- 375px: `scrollWidth=375`, sin overflow horizontal, sidebar cerrado por defecto, input principal usable.
- 390px: `scrollWidth=390`, sin overflow horizontal, sidebar cerrado por defecto, input principal usable.
- 430px: `scrollWidth=430`, sin overflow horizontal, sidebar cerrado por defecto, input principal usable.
- Drawer mobile abre sin provocar overflow horizontal.

### Validacion final

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

### Notas

- No se tocaron Stripe, webhook, Supabase Auth, Theme Engine, InvitationRenderer ni MultilayerBackground.
- Dashboard Assistant no fue modificado en esta fase y conserva su gating por env/ruta/plan.

---

## FASE AV-4B-QA - Seguimiento con servidor local y Chrome headless

Fecha: 2026-06-18

### Objetivo

Completar la QA visual pendiente levantando servidor local y usando Chrome headless contra `/dashboard/invitations/wedding-sofia-alejandro/edit`.

### Entorno de prueba

- Servidor local: `http://127.0.0.1:3003`
- Variables usadas:
  - `ADMIN_ACCESS_ENABLED=true`
  - `NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED=true`
  - `DASHBOARD_ASSISTANT_ALLOWED_PLANS=premium,deluxe`
  - `ASSISTANT_AI_ENABLED=false`

### Bugs encontrados y corregidos

1. Boton SSR no interactivo por diferencia entre server/client env.
   - Archivos:
     - `src/features/dashboard-assistant/DashboardAssistantMount.tsx`
     - `src/app/dashboard/invitations/[id]/edit/page.tsx`
   - Sintoma: el HTML prerenderizaba `Ayuda para textos`, pero el click en Chrome headless no abria el panel.
   - Causa probable: el gate de `NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED` se evaluaba en cliente y podia diferir del prerender del servidor.
   - Correccion:
     - El servidor ahora calcula `assistantEnabledByEnv = isDashboardAssistantEnabled()`.
     - El cliente recibe solo `enabledByEnv` como boolean seguro.
     - `DashboardAssistantMount` espera a estar montado antes de renderizar el widget, evitando boton SSR visible sin interactividad.

2. Lint `react-hooks/set-state-in-effect`.
   - Archivo: `src/features/dashboard-assistant/DashboardAssistantMount.tsx`
   - Correccion: activacion diferida con `requestAnimationFrame`.

### QA ejecutada

- `/dashboard/invitations` responde 200.
- `/dashboard/invitations/wedding-sofia-alejandro/edit` responde 200 sin login cuando `ADMIN_ACCESS_ENABLED=true`.
- `POST /api/assistant` desde contexto dashboard responde 200.
- Con `ASSISTANT_AI_ENABLED=false`, la respuesta usa `source: "local-rules"`, comportamiento esperado.
- Chrome headless confirmo que no hay errores de runtime ni chunks fallidos relevantes.
- Chrome headless confirmo que no hay overflow horizontal en desktop ni mobile durante la carga del editor.

### Limitacion

- En Chrome headless de este entorno, los efectos cliente no llegaron a ejecutarse de forma fiable: tambien `LivePreview` quedo en `Cargando preview...`.
- Por eso no se pudo confirmar visualmente el panel abierto desde headless despues de mover el render a cliente.
- La correccion evita el estado peor: HTML SSR visible pero no interactivo.

### Validacion final

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

### Notas

- Servidor local temporal en `3003` quedo iniciado para revision manual.
- Capturas headless generadas en `C:\tmp\kompralo-av4bqa-desktop-final.png` y `C:\tmp\kompralo-av4bqa-mobile-final.png`, pero no muestran el panel porque el entorno headless no ejecuto efectos cliente.
- No se tocaron Stripe, webhook, Supabase Auth, Theme Engine, InvitationRenderer ni MultilayerBackground.

---

## FASE AV-4B-QA - QA visual, mobile, seguridad y plan gating

Fecha: 2026-06-18

### Objetivo

Auditar el Dashboard Assistant para confirmar route gating, plan gating, seguridad de payload, prompts, estados UX, mobile/desktop y compatibilidad con build.

### Bugs encontrados y corregidos

1. Riesgo menor de overflow en mobile.
   - Archivo: `src/features/dashboard-assistant/DashboardAssistantPanel.tsx`
   - Antes: `width: clamp(300px, calc(100vw - 24px), 410px)`
   - Despues: `width: min(410px, calc(100vw - 24px))`
   - Motivo: evita desbordes en viewports muy angostos.

### Archivos modificados

- `src/features/dashboard-assistant/DashboardAssistantPanel.tsx`
- `CHANGELOG.md`

### Validaciones realizadas

Plan gating:

- `DASHBOARD_ASSISTANT_ALLOWED_PLANS=premium,deluxe`
  - `basic`: false
  - `premium`/`gold`: true
  - `deluxe`/`platinum`: true
  - `unknown`/`null`: false
- `DASHBOARD_ASSISTANT_ALLOWED_PLANS=deluxe`
  - `basic`: false
  - `premium`/`gold`: false
  - `deluxe`/`platinum`: true
- Variable vacia:
  - todos los planes: false

Route gating:

- `/dashboard/invitations/abc/edit`: true
- `/dashboard`: false
- `/dashboard/invitations`: false
- `/dashboard/invitations/abc`: false
- `/invitaciones`: false
- `/invitaciones/precios`: false
- `/cliente`: false
- `/login`: false
- `/auth/callback`: false
- `/api`: false

Seguridad:

- `DashboardAssistantMount` recibe solo `enabledForPlan` y `eventType`.
- `DashboardAssistantWidget` recibe solo `enabledForPlan`, `eventType` y `pathname`.
- `DashboardAssistantPanel` manda a `/api/assistant` solo `message` y `pageContext.pathname`.
- No se encontro envio de `invitationId`, `customerEmail`, tokens, session, orderId ni stripeSessionId.

Prompts:

- Los 12 prompts internos devuelven `shouldUseAssistantAI(...) === true`.
- No requieren datos privados de la invitacion.
- No guardan ni modifican campos automaticamente.

UX y accesibilidad:

- Boton principal con `aria-label`.
- Boton cerrar con `aria-label`.
- Cards renderizadas como `button`.
- Escape cierra el panel.
- El panel tiene scroll interno, max-height y ancho mobile seguro.
- Copiar texto usa `navigator.clipboard.writeText` con `try/catch`.

### Validacion final

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

### Notas

- No se pudo ejecutar inspeccion visual en navegador porque el entorno bloqueo el servidor temporal local.
- No se tocaron Stripe, webhook, Supabase Auth, Theme Engine, InvitationRenderer ni MultilayerBackground.
- El build mantiene warnings preexistentes de middleware/proxy, config legacy del webhook Stripe y fallbacks locales de Supabase.

---

## FASE AV-4B - Dashboard Assistant UI y generacion de textos

Fecha: 2026-06-18

### Objetivo

Agregar una UI funcional del asistente dentro del editor del dashboard para generar textos de invitacion y copiarlos manualmente, sin guardar automaticamente en Supabase ni modificar campos.

### Archivos creados

- `src/features/dashboard-assistant/types.ts`
- `src/features/dashboard-assistant/dashboardAssistantPrompts.ts`
- `src/features/dashboard-assistant/DashboardAssistantWidget.tsx`
- `src/features/dashboard-assistant/DashboardAssistantPanel.tsx`
- `src/features/dashboard-assistant/DashboardAssistantPromptCard.tsx`
- `src/features/dashboard-assistant/index.ts`

### Archivos modificados

- `src/features/dashboard-assistant/DashboardAssistantMount.tsx`
- `src/app/dashboard/invitations/[id]/edit/page.tsx`
- `docs/VIRTUAL_ASSISTANT.md`
- `CHANGELOG.md`

### Cambios principales

- `DashboardAssistantMount` ya no reutiliza el widget publico; ahora monta `DashboardAssistantWidget`.
- El widget solo aparece si:
  - `NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED=true`
  - `enabledForPlan=true`
  - la ruta es `/dashboard/invitations/[id]/edit`
- La ruta del editor sigue calculando permiso por plan en servidor desde `invitation.planId`.
- Se pasa solo `eventType` no sensible derivado de `invitation.category`.
- El panel llama `POST /api/assistant` enviando solo:
  - prompt interno
  - `pageContext.pathname`
- No se envia `customerEmail`, `invitationId`, tokens, sesion, historial ni contenido completo de invitacion.
- Se agrego boton `Copiar texto` con manejo de exito y fallo de clipboard.
- Se agrego estado de loading, error y generado.

### Prompts incluidos

- Mensaje de bienvenida
- Frase de portada
- Historia de amor / StoryBook
- Mensaje final
- Confirmacion de asistencia
- Dress Code
- Mesa de regalos
- Padres
- Padrinos
- Itinerario
- Hospedaje
- Redes sociales

### QA

- Se valido que los 12 prompts internos sean elegibles para IA con `shouldUseAssistantAI(...) === true`.
- Se corrigio el copy interno para no incluir la palabra `premium`, porque el router la reserva para dudas de planes y mandaba los prompts a reglas locales.

### Validacion final

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

### Notas

- No se tocaron Stripe, webhook, Supabase Auth, Theme Engine, InvitationRenderer ni MultilayerBackground.
- El build mantiene warnings preexistentes de middleware/proxy, config legacy del webhook Stripe y fallbacks locales de Supabase.

---

## Dashboard Assistant - Control por plan

Fecha: 2026-06-18

### Objetivo

Permitir que el asistente dentro del dashboard se active solo para planes autorizados, usando validacion server-side basada en el `planId` real de la invitacion.

### Archivos creados

- `src/features/dashboard-assistant/dashboardAssistantConfig.ts`
- `src/features/dashboard-assistant/DashboardAssistantMount.tsx`

### Archivos modificados

- `src/app/dashboard/invitations/[id]/edit/page.tsx`
- `.env.example`
- `docs/VIRTUAL_ASSISTANT.md`
- `CHANGELOG.md`

### Cambios principales

- Se agrego `DASHBOARD_ASSISTANT_ALLOWED_PLANS` como variable server-only.
- Se agrego `NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED` solo para mostrar/ocultar el widget en cliente.
- La ruta `/dashboard/invitations/[id]/edit` calcula `assistantAllowedForPlan` desde `invitation.planId` en servidor.
- El cliente recibe solo `enabledForPlan`, no recibe email, tokens ni datos sensibles para decidir plan.
- El mount del dashboard renderiza el widget solo si:
  - `NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED=true`
  - `enabledForPlan=true`
- Se mantienen aliases de compatibilidad:
  - `premium` equivale a `gold`
  - `deluxe` equivale a `platinum`

### Casos validados

- `DASHBOARD_ASSISTANT_ALLOWED_PLANS=premium,deluxe`
  - `basic`: false
  - `premium`/`gold`: true
  - `deluxe`/`platinum`: true
- `DASHBOARD_ASSISTANT_ALLOWED_PLANS=deluxe`
  - `basic`: false
  - `premium`/`gold`: false
  - `deluxe`/`platinum`: true
- Variable vacia:
  - todos los planes: false

### Validacion final

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

### Notas

- No se tocaron Stripe, webhook, Supabase Auth, Theme Engine, InvitationRenderer ni MultilayerBackground.
- El build mantiene warnings preexistentes de middleware/proxy, config legacy del webhook Stripe y fallbacks locales de Supabase.

---

## FASE AV-3-QA - Auditoria de IA, seguridad, costos y fallback

Fecha: 2026-06-18

### Objetivo

Auditar la implementacion de IA del asistente KOMPRALO y corregir solo bugs criticos de seguridad, costo o fallback.

### Bugs encontrados y corregidos

1. `pathname` hacia OpenAI no tenia sanitizacion defensiva si un cliente llamaba el endpoint manualmente.
   - Archivo: `src/features/virtual-assistant/assistantAiService.ts`
   - Correccion: antes de enviar contexto a OpenAI se eliminan query/hash y se descartan rutas con senales sensibles como token, email, session, secret, stripe, resend, service_role o api_key.

2. `assistantRules.ts` tenia una regex corrupta para remover acentos.
   - Archivo: `src/features/virtual-assistant/assistantRules.ts`
   - Correccion: se restauro `[\u0300-\u036f]`, evitando degradacion de reglas locales con mensajes acentuados como "que plan me conviene" / "que plan me conviene".

### Archivos modificados

- `src/features/virtual-assistant/assistantAiService.ts`
- `src/features/virtual-assistant/assistantRules.ts`
- `docs/VIRTUAL_ASSISTANT.md`
- `CHANGELOG.md`

### Validaciones de routing IA

Mensajes simples auditados como `shouldUseAssistantAI(message) === false`:

- cuanto cuesta
- precios
- que plan me conviene
- como funciona
- ya compre
- no me llego correo
- se puede mandar por WhatsApp
- tiene RSVP
- como edito mi invitacion

Mensajes creativos auditados como `shouldUseAssistantAI(message) === true`:

- redacta un mensaje elegante para boda
- dame votos matrimoniales cortos
- mejora este texto para que suene mas emotivo
- escribe una historia de amor breve
- dame una frase para XV anos elegante
- crea un mensaje final para baby shower

### Validacion final

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

### Notas

- No se ejecuto llamada real a OpenAI.
- Las pruebas HTTP con servidor temporal no pudieron ejecutarse por bloqueo de procesos de PowerShell en este entorno; build y pruebas directas del helper de routing si pasaron.
- No se tocaron Stripe, webhook, Supabase Auth, Theme Engine, InvitationRenderer ni MultilayerBackground.

---

## FASE AV-3 - IA controlada para asistente virtual

Fecha: 2026-06-18

### Objetivo

Conectar OpenAI al asistente virtual de KOMPRALO de forma controlada, manteniendo reglas locales como primera capa y fallback obligatorio.

### Archivos creados

- `src/lib/openai/openai.ts`
- `src/features/virtual-assistant/assistantAiRouting.ts`
- `src/features/virtual-assistant/assistantAiService.ts`

### Archivos modificados

- `src/app/api/assistant/route.ts`
- `src/features/virtual-assistant/types.ts`
- `src/features/virtual-assistant/assistantConfig.ts`
- `src/features/virtual-assistant/VirtualAssistantWidget.tsx`
- `src/features/virtual-assistant/index.ts`
- `.env.example`
- `docs/VIRTUAL_ASSISTANT.md`
- `package.json`
- `package-lock.json`

### Dependencias

- `openai@^6.44.0`

### Cambios principales

- `/api/assistant` sigue validando request y limitando `message` a 1000 caracteres.
- El flujo ahora es: reglas locales -> IA solo si aporta valor -> fallback local si IA falla.
- La IA solo se activa con `ASSISTANT_AI_ENABLED=true` y `OPENAI_API_KEY` presente.
- Si falta la variable o la key, todo queda en modo local sin romper dev, build ni runtime.
- Se agrego routing de intencion para usar IA en redaccion, frases, votos, mensajes, copy e inputs largos/ambiguos.
- Precios, planes, como funciona, post-compra, login, WhatsApp y RSVP siguen resolviendose con reglas locales.
- El servicio IA no envia emails, `invitationId`, tokens, sesiones ni historial de conversacion.
- El frontend acepta `source: "local-rules" | "ai" | "local-fallback"` y conserva fallback local.

### Validacion

- `npx.cmd --no-install tsc --noEmit`: OK
- `npm.cmd run lint`: OK, 10 warnings preexistentes
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK

### Notas

- Build emitio warnings no relacionados: convencion `middleware` de Next, `config.api.bodyParser` en webhook Stripe y fallbacks de Supabase por variables locales ausentes.
- No se tocaron Stripe, webhook, Supabase Auth, Theme Engine, InvitationRenderer ni MultilayerBackground.
- No se guarda conversacion en Supabase y no hay streaming ni tool calls.

---

## Stack

- Next.js 16.2.9 (App Router)
- React 19.2.4 + TypeScript 5
- Tailwind CSS v4
- Framer Motion 12 + GSAP 3 + Lenis 1.3
- Sin base de datos todavía (fixtures locales)
- Sin Supabase, sin Stripe, sin Resend

---

## Fases completadas

### FASE 1 — Content Engine ✅
Definición de tipos de dominio para invitaciones.
- `src/domain/invitations/types.ts` — `InvitationContent` y todos los sub-tipos
- `src/domain/invitations/fixtures/wedding.sofia-alejandro.ts` — datos de prueba

### FASE 2 — Themes Engine ✅
Sistema de temas tipados con CSS variables.
- `src/domain/themes/types.ts` — interfaz `InvitationTheme`
- `src/domain/themes/registry.ts` — `getThemeById`, `defaultThemeId = 'champagne'`
- `src/domain/themes/themes/champagne.ts`
- `src/domain/themes/themes/floral.ts`
- `src/domain/themes/themes/modern.ts`
- `src/domain/themes/themes/azure.ts`

### FASE 3 — Plans Engine ✅
Sistema de planes con feature flags.
- `src/domain/plans/types.ts` — `PlanId`, `InvitationFeatureKey`, `InvitationFeatures`, `InvitationPlan`
- `src/domain/plans/features.ts` — matrices basic / gold / platinum
- `src/domain/plans/registry.ts` — `getPlanById`, `getFeaturesForPlan`, `defaultPlanId = 'platinum'`

### FASE 4A — InvitationRenderer ✅
Componente orquestador de secciones.
- `src/components/invitation/InvitationRenderer.tsx`
  - Props: `invitation`, `theme`, `plan`, `features`, `mode`
  - Aplica CSS variables del tema en el root div
  - Renderiza secciones condicionalmente via `FeatureGate`

### FASE 4B — UI Components ✅
Todos los componentes de sección implementados:
- `CinematicIntro` — overlay de entrada con cortinas GSAP, bloquea scroll con `window.lenis`
- `Hero` — parallax con Framer Motion
- `Countdown` — flip cards con `setInterval`
- `Parents` — glass morphism cards
- `StoryBook` — 3D page turner con GSAP
- `HorizontalGallery` — GSAP ScrollTrigger pin (desktop) / snap scroll (mobile)
- `Timeline` — línea animada con scroll progress
- `Itinerary` — grid con iconos lucide-react
- `Location` — SVG animado con ruta dibujada
- `DressCode` — swatches de colores del tema
- `GiftRegistry` — CLABE con copy button
- `Padrinos` — grid de sponsors
- `Hospedaje` — hotel cards
- `Hashtag` — mockup Instagram
- `RSVPForm` — glass form → WhatsApp link (sin persistencia)
- `FinalMessage` — signature SVG animado
- `MusicController` — botón fijo audio loop
- `MultilayerBackground` — 3 capas parallax + canvas hearts
- `SmoothScroll` — Lenis wrapper (asigna `window.lenis`)
- `LiquidCard`, `SectionShell`, `SectionHeader`, `FeatureGate`, `InvitationSectionGate`

### FASE 4C — Stabilization ✅
Limpieza y estabilización post-componentes.

### FASE 5A — Dynamic Routes ✅
Rutas dinámicas de Next.js App Router.
- `src/app/i/[slug]/page.tsx` — ruta pública
- `src/app/preview/[id]/page.tsx` — ruta preview

### FASE 5B — Repository → Dynamic Routes → Renderer ✅
Conexión del flujo completo.
- `src/domain/invitations/repository.ts` — funciones `listInvitations`, `getInvitationBySlug`, `getInvitationById`
- `src/domain/invitations/adapters.ts` — `normalizeInvitation`
- `src/domain/invitations/status.ts` — `isPublicInvitationStatus`, `isPreviewableInvitationStatus`
- `src/components/invitation/InvitationRouteRenderer.tsx` — wrapper con badge de preview

---

## Fases de refactor (sesión actual)

### FASE 5C-1 — Repository Contract + Context Resolver ✅
**Fecha:** 2026-06-17
**Objetivo:** Preparar el repository para ser reemplazado por Supabase sin tocar rutas ni componentes.

**Archivos creados:**

`src/domain/invitations/repository.types.ts`
- Exporta `IInvitationRepository` con métodos:
  - `list(): InvitationContent[]`
  - `getBySlug(slug: string): InvitationContent | null`
  - `getById(id: string): InvitationContent | null`
  - `getPreviewById(id: string): InvitationContent | null`
- Nota: `getById` busca por ID exacto; `getPreviewById` resuelve aliases (`demo` → ID real)

`src/domain/invitations/resolveInvitationContext.ts`
- Exporta `resolveInvitationContext(invitation): InvitationContext`
- Exporta interfaz `InvitationContext { invitation, theme, plan, features }`
- Centraliza la lógica que antes se repetía en cada ruta:
  `getPlanById + getThemeById + getFeaturesForPlan`

**Archivos modificados:**

`src/domain/invitations/repository.ts`
- Clase interna `LocalInvitationRepository implements IInvitationRepository`
- Exporta singleton `invitationRepository` (punto de inyección para Supabase)
- Mantiene exports legacy `listInvitations`, `getInvitationBySlug`, `getInvitationById`

`src/app/i/[slug]/page.tsx`
- Usa `invitationRepository.getBySlug(slug)` en lugar de función libre
- Usa `resolveInvitationContext(invitation)` en lugar de 3 llamadas separadas

`src/app/preview/[id]/page.tsx`
- Usa `invitationRepository.getPreviewById(id)`
- Usa `resolveInvitationContext(invitation)`

**Para conectar Supabase en el futuro:**
1. Crear `SupabaseInvitationRepository implements IInvitationRepository`
2. Cambiar `invitationRepository` en `repository.ts` para apuntar a la nueva clase
3. Nada más cambia

---

### FASE 5C-2 — generateMetadata dinámico ✅
**Fecha:** 2026-06-17
**Objetivo:** Open Graph real para que WhatsApp / Facebook / Instagram muestren preview atractiva al compartir invitaciones.

**Archivos creados:**

`src/domain/invitations/metadata.ts`
- `buildInvitationMetadata(invitation): Metadata`
  - `title`: `"{Nombre1} & {Nombre2} | {subtitle}"`
  - `description`: frase fija de conversión
  - `og:title`, `og:description`, `og:image` (hero image de la invitación)
  - `og:url`: `${NEXT_PUBLIC_APP_URL}/i/${slug}`
  - `og:siteName`: "Kompralo"
  - `og:locale`: "es_MX"
  - `twitter:card`: "summary_large_image"
  - `robots`: index=true, follow=false
- `buildNoIndexMetadata(): Metadata`
  - Para rutas preview
  - `robots`: index=false, follow=false
  - `title`: "Vista previa — Kompralo"

**Archivos modificados:**

`src/app/i/[slug]/page.tsx`
- Agrega `export async function generateMetadata()` usando `buildInvitationMetadata`
- Si slug no existe o no es público, devuelve `{ title: 'Invitación no encontrada' }`
- Lee de `process.env.NEXT_PUBLIC_APP_URL` con fallback `http://localhost:3000`

`src/app/preview/[id]/page.tsx`
- Agrega `export async function generateMetadata()` usando `buildNoIndexMetadata`

**Variable de entorno requerida en producción:**
```
NEXT_PUBLIC_APP_URL=https://tudominio.com
```

---

## Estado actual del proyecto

```
Repository Local (fixtures)
  invitationRepository (IInvitationRepository)
    ↓
resolveInvitationContext(invitation)
  → { invitation, theme, plan, features }
    ↓
Route Page (server component)
  generateMetadata() ← NUEVO 5C-2
    ↓
InvitationRouteRenderer
    ↓
InvitationRenderer
    ↓
Sections (FeatureGate → Componente)
```

## Rutas activas

| URL | Comportamiento |
|-----|----------------|
| `/` | Dev page con toolbar (accesible en producción — pendiente guard) |
| `/i/sofia-y-alejandro` | Invitación pública con OG metadata |
| `/preview/demo` | Preview con badge, noindex |
| `/preview/wedding-sofia-alejandro` | Preview por ID directo, noindex |
| `/i/no-existe` | 404 |
| `/preview/no-existe` | 404 |

---

### FASE 5C-3 — Dev Guard + Domain Barrel ✅
**Fecha:** 2026-06-17
**Objetivo:** Evitar exposición del playground en producción y crear punto de entrada limpio para el dominio.

**Archivos creados:**

`src/components/invitation/dev/DevPlayground.tsx`
- Extracción de la lógica cliente que antes vivía en `app/page.tsx`
- Componente `'use client'` con useState para plan/theme/toolbar
- Renderiza `InvitationRenderer` + `InvitationDevToolbar`

`src/components/home/HomePlaceholder.tsx`
- Landing placeholder sobria para producción
- Sin dependencias del motor de invitación
- Texto: "Próximamente / Kompralo / Invitaciones digitales premium..."

`src/domain/invitations/index.ts`
- Barrel de dominio — punto único de importación para todo el módulo
- Re-exporta: types, repository.types, repository, resolveInvitationContext, metadata, status, adapters

**Archivos modificados:**

`src/app/page.tsx`
- Convertido a server component (eliminado `'use client'`)
- Bifurca en `process.env.NODE_ENV`:
  - `'development'` → renderiza `<DevPlayground />` (playground completo)
  - cualquier otro → renderiza `<HomePlaceholder />` (sin DevToolbar)
- `NODE_ENV` se evalúa en build time por Next.js — el código de DevPlayground
  NO se incluye en el bundle de producción

`src/app/i/[slug]/page.tsx`
- Imports migrados al barrel `@/domain/invitations`

`src/app/preview/[id]/page.tsx`
- Imports migrados al barrel `@/domain/invitations`

**Cómo quedó protegida la home:**
- En `development`: Next.js incluye DevPlayground en el bundle → playground visible
- En `production`: Next.js evalúa `NODE_ENV !== 'development'` → rama eliminada por tree-shaking → solo HomePlaceholder se sirve
- DevToolbar no aparece en producción en ninguna URL

---

---

### FASE 5C-4 — Schema Relacional + Contrato RSVP Stub ✅
**Fecha:** 2026-06-17
**Objetivo:** Preparar estructura para Supabase y dashboard sin conectar servicios reales.

**Archivos creados:**

`docs/SUPABASE_SCHEMA_DRAFT.md`
- Esquema completo de 9 tablas: `users`, `invitations`, `invitation_versions`, `invitation_content`, `invitation_theme_overrides`, `invitation_feature_overrides`, `invitation_sections`, `rsvp_responses`, `payments`, `events_analytics`
- Para cada tabla: propósito, campos SQL, relaciones, política RLS
- Flujo de estados de invitación documentado
- Notas de migración: cómo conectar con el adapter/repository existente

`src/domain/rsvp/types.ts`
- `RSVPAttendance`: `'yes' | 'no' | 'maybe'`
- `RSVPStatus`: `'pending' | 'confirmed' | 'cancelled'`
- `RSVPResponse` — forma completa de una respuesta guardada
- `RSVPSubmissionInput` — datos que llegan del formulario
- `RSVPSubmissionResult` — union type: `{ success: true, response }` | `{ success: false, error }`

`src/domain/rsvp/repository.types.ts`
- `IRSVPRepository` con métodos:
  - `submit(input): Promise<RSVPSubmissionResult>`
  - `listByInvitationId(id): Promise<RSVPResponse[]>`
  - `countByInvitationId(id): Promise<number>`

`src/domain/rsvp/repository.ts`
- `LocalRSVPRepository implements IRSVPRepository`
- Store in-memory (`RSVPResponse[]`) — sin persistencia real
- Exporta singleton `rsvpRepository`

`src/domain/rsvp/index.ts`
- Barrel del módulo RSVP

`src/app/api/rsvp/route.ts`
- `POST /api/rsvp`
- Validación mínima: `invitationId`, `name`, `attendance` requeridos; `guestCount >= 0`
- Responde `201` con `{ success: true, response }` o `422`/`400`/`500` con `{ success: false, error }`
- TODOs inline: conectar Supabase, conectar RSVPForm

**RSVPForm.tsx — NO MODIFICADO**
- Sigue abriendo WhatsApp
- TODO marcado en `route.ts` para la fase de conexión

---

---

### FASE 5C-5 — RSVPForm conectado a /api/rsvp ✅
**Fecha:** 2026-06-17
**Objetivo:** RSVPForm envía datos al endpoint local en lugar de solo abrir WhatsApp.

**Archivos modificados:**

`src/components/invitation/RSVPForm.tsx`
- Nueva prop: `invitationId: string`
- Nuevo tipo local: `FormState = 'idle' | 'submitting' | 'success' | 'error'`
- `handleSubmit` convertido a `async`: hace `fetch('POST /api/rsvp')` antes de mostrar success
- Validación cliente: `name.trim()` requerido, `attending !== null` requerido, `guestCount >= 0`
- Estado `submitting`: botón muestra "Enviando…" y queda deshabilitado
- Estado `error`: mensaje inline en rojo con la respuesta del servidor, el formulario permanece editable para reintentar
- Estado `success`: pantalla de confirmación existente sin cambios visuales
- WhatsApp: sigue presente como botón secundario en el success screen ("Enviar Copia por WhatsApp")
- `handleReset` extrae la lógica de reset del botón inline

`src/components/invitation/InvitationRenderer.tsx`
- Pasa `invitationId={invitation.id}` a `<RSVPForm />`

**Flujo RSVP resultante:**
```
Usuario llena formulario
  → click "Confirmar Asistencia"
  → formState: 'submitting' (botón deshabilitado, texto "Enviando…")
  → POST /api/rsvp
    ├─ 201 OK  → formState: 'success' → pantalla de confirmación
    │              └─ botón secundario: "Enviar Copia por WhatsApp"
    └─ error   → formState: 'error'   → mensaje inline, formulario editable, puede reintentar
```

---

---

### FASE 5C-6 — Countdown eventPassed + .env.example ✅
**Fecha:** 2026-06-17
**Objetivo:** UX de fecha pasada + documentación de variables de entorno.

**Archivos creados:**

`.env.example`
- Documenta todas las variables de entorno del proyecto
- Variables: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `STRIPE_SECRET_KEY`, `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`, `RESEND_API_KEY`
- Sin valores reales — solo estructura y comentarios de dónde obtener cada key

**Archivos modificados:**

`src/components/invitation/Countdown.tsx`
- Nueva función `isEventPast(eventDate): boolean`
- Nuevo estado `eventPassed: boolean` (calculado en mount y en el intervalo de 1s)
- El intervalo también actualiza `eventPassed` para manejar el caso de transición en vivo
- Cuando `eventPassed === true`:
  - Header: "Un Momento Especial" (en lugar de "Cuenta Regresiva")
  - Corazón pulsante animado (`♡` con `scale` loop)
  - Título: "El gran día ya llegó"
  - Subtítulo: "Gracias por acompañarnos en este momento tan especial."
  - Sin flip cards (no se muestran ceros)
- Cuando `eventPassed === false`: comportamiento idéntico al anterior
- Ornamentos SVG superior e inferior se mantienen en ambos estados

**Estado eventPassed — aspecto visual:**
```
[ Un Momento Especial ]
──●──

        ♡  (pulsa suavemente)

  El gran día ya llegó

  Gracias por acompañarnos en este
  momento tan especial.

──●──
```

---

---

### FASE 5C-7 — Fixtures baby-shower-demo + birthday-demo ✅
**Fecha:** 2026-06-17
**Objetivo:** Agregar dos invitaciones demo para baby shower y cumpleaños.

**Archivos creados:**

`src/domain/invitations/fixtures/baby-shower-demo.ts`
- id: `baby-shower-demo`, slug: `baby-shower-demo`
- category: `baby-shower`, variant: `girl`, theme: `floral`, plan: `platinum`
- Protagonista: Valentina — evento 2027-03-15
- Venue: Jardín Rosaleda, Guadalajara
- `featureOverrides`: StoryBook y Timeline desactivados (no aplican al formato)
- Secciones activas: Hero, Countdown, Itinerary, DressCode, GiftRegistry, Hospedaje, Hashtag, RSVP, FinalMessage, Parents, Gallery, Music

`src/domain/invitations/fixtures/birthday-demo.ts`
- id: `birthday-demo`, slug: `birthday-demo`
- category: `birthday`, variant: `woman`, theme: `azure`, plan: `gold`
- Protagonista: Isabella — 30 años — evento 2027-05-20
- Venue: Terraza Vista Hermosa, CDMX (piso 14, Reforma)
- `featureOverrides`: StoryBook, Timeline, Parents y Padrinos desactivados
- Secciones activas: Hero, Countdown, Itinerary, DressCode, GiftRegistry, Hospedaje, Hashtag, RSVP, FinalMessage, Gallery, Music

**Archivos modificados:**

`src/domain/invitations/fixtures/index.ts`
- Agrega exports de `babyShowerDemoInvitation` y `birthdayDemoInvitation`

`src/domain/invitations/repository.ts`
- Agrega ambos fixtures a `localInvitations`
- Agrega aliases en `previewAliases`: `'baby-shower-demo'` y `'birthday-demo'`

**Rutas disponibles:**
| URL | Resultado |
|-----|-----------|
| `/i/baby-shower-demo` | Baby Shower Valentina — tema Floral |
| `/preview/baby-shower-demo` | Preview con badge |
| `/i/birthday-demo` | Cumpleaños Isabella 30 — tema Azure |
| `/preview/birthday-demo` | Preview con badge |

---

---

### FASE 5C-8 — Fixture Bautizo demo ✅
**Fecha:** 2026-06-17
**Objetivo:** Validar que el motor soporta la categoría `baptism`.

**Archivos creados:**

`src/domain/invitations/fixtures/baptism-demo.ts`
- id/slug: `baptism-demo`
- category: `baptism`, variant: `girl`, theme: `azure`, plan: `gold`
- Protagonista: Emilia — evento 2027-04-18 — San Miguel de Allende
- Venue: Parroquia del Sagrado Corazón + recepción en Hacienda El Recreo
- featureOverrides: `showStoryBook: false`, `showTimeline: false`, `showAccommodation: false`, `showPadrinos: true`, `showHashtag: true`, `showGiftRegistry: true`
- 5 padrinos: Bautismo, Flores, Pastel, Fotografía, Recuerdos
- 1 par de padres
- GiftRegistry con 3 opciones (Amazon, Liverpool, Banco)

**Archivos modificados:**

`src/domain/invitations/fixtures/index.ts` — export de `baptismDemoInvitation`
`src/domain/invitations/repository.ts` — fixture en `localInvitations` + alias `'baptism-demo'` en `previewAliases`

**Rutas disponibles:**
| URL | Resultado |
|-----|-----------|
| `/i/baptism-demo` | Bautizo Emilia — tema Azure — plan Gold |
| `/preview/baptism-demo` | Preview con badge |

**featureOverrides usados:**
```ts
showStoryBook: false      // no aplica para bautizo
showTimeline: false       // no hay historia de pareja
showAccommodation: false  // evento de día, sin hospedaje
showPadrinos: true        // tradición clave en bautizos
showHashtag: true
showGiftRegistry: true
```

---

## Fixtures disponibles (4 total)

| Fixture | Slug | Categoría | Tema | Plan |
|---------|------|-----------|------|------|
| Sofía & Alejandro | `sofia-y-alejandro` | wedding | champagne | platinum |
| Baby Shower Valentina | `baby-shower-demo` | baby-shower | floral | platinum |
| Cumpleaños Isabella | `birthday-demo` | birthday | azure | gold |
| Bautizo Emilia | `baptism-demo` | baptism | azure | gold |

---

---

### FASE 5D-1 — Seguridad mínima RSVP antes de Supabase ✅
**Fecha:** 2026-06-17
**Objetivo:** Cerrar dos riesgos críticos detectados en la auditoría arquitectónica.

**Archivos modificados:**

`src/domain/rsvp/repository.ts`
- `LocalRSVPRepository` lanza `Error` en el constructor si `NODE_ENV === 'production'`
- Mensaje: `"LocalRSVPRepository cannot be used in production. Replace rsvpRepository with SupabaseRSVPRepository before deploying."`
- El error ocurre en inicialización del módulo — la app no arranca en producción hasta que se swappee el repositorio
- En `development` y `test`: comportamiento idéntico al anterior

`src/app/api/rsvp/route.ts`
- Importa `invitationRepository` desde `@/domain/invitations`
- Después de validar campos, llama `invitationRepository.getById(invitationId)`
- Si la invitación no existe: devuelve `404` con `{ success: false, error: "Invitación no encontrada." }`
- El RSVP solo se persiste si la invitación existe en el repositorio

**Flujo de validación resultante en POST /api/rsvp:**
```
1. JSON válido                → 400 si falla
2. invitationId presente      → 422 si falta
3. name presente              → 422 si falta
4. attendance válido          → 422 si inválido
5. guestCount >= 0            → 422 si inválido
6. invitationId existe en DB  → 404 si no existe   ← NUEVO
7. rsvpRepository.submit()    → 201 / 500
```

---

---

### FASE 5D-2 — Barrels de dominio + cache de invitación pública ✅
**Fecha:** 2026-06-17
**Objetivo:** Punto de entrada limpio para plans/themes + deduplicar query en /i/[slug].

**Archivos creados:**

`src/domain/plans/index.ts`
- Re-exporta todo: types (`PlanId`, `InvitationPlan`, `InvitationFeatures`, `FeatureOverrides`, `InvitationFeatureKey`), features (`basicFeatures`, `goldFeatures`, `platinumFeatures`, `mergePlanFeatures`), registry (`getPlanById`, `getFeaturesForPlan`, `availablePlans`, `defaultPlanId`, `plansById`)

`src/domain/themes/index.ts`
- Re-exporta todo: types (`ThemeId`, `InvitationTheme`, `Theme`, todas las interfaces de sub-theme), registry (`getThemeById`, `availableThemes`, `defaultThemeId`, `themesById`), helper `createThemeCssVariables`

**Archivos modificados:**

`src/domain/invitations/resolveInvitationContext.ts`
- Imports migrados: `@/domain/plans/types` → `@/domain/plans`, `@/domain/themes/types` y `@/domain/themes/registry` → `@/domain/themes`

`src/app/i/[slug]/page.tsx`
- `getPublicInvitation = cache((slug) => ...)` — función memoizada por request con `react.cache`
- Encapsula `getBySlug` + `isPublicInvitationStatus` en un solo punto
- Tanto `generateMetadata` como `PublicInvitationPage` llaman `getPublicInvitation(slug)` — la segunda call del mismo request devuelve el valor cacheado sin re-ejecutar
- Código total de la página se simplificó: la guard de status se centraliza en la función cacheada

**Cómo funciona `cache()`:**
```
Request llega a /i/sofia-y-alejandro
  generateMetadata()        → getPublicInvitation('sofia-y-alejandro')  → ejecuta getBySlug()
  PublicInvitationPage()    → getPublicInvitation('sofia-y-alejandro')  → devuelve resultado cacheado
Total queries al repository: 1 (era 2)

Siguiente request a /i/sofia-y-alejandro
  cache() se descarta (es per-request, no persistente)
  → vuelve a ejecutar getBySlug() 1 vez
```
`react.cache` es per-request, no global. Seguro para uso con Supabase sin riesgo de datos stale entre requests.

---

---

### FASE 5D-3 — Páginas 404 y Error con branding Kompralo ✅
**Fecha:** 2026-06-17
**Objetivo:** UX de error premium sin tocar el motor de invitaciones.

**Archivos creados:**

`src/app/not-found.tsx`
- Server component (sin `'use client'`)
- Background `#F9F5EF` (marfil cálido), tipografía Georgia/serif
- Ornamentos SVG línea-círculo-línea en dorado `#C5A880` (mismo pattern que los componentes de invitación)
- Eyebrow "Kompralo", código "404" en tono `#E8DDD0`, título y subtítulo en sepia
- Botón outline dorado con `<Link href="/">` — sin JS requerido
- Activado por: `notFound()` en `/i/[slug]` y `/preview/[id]`

`src/app/error.tsx`
- `'use client'` — requerido por Next.js para error boundaries
- Props: `error: Error & { digest?: string }`, `reset: () => void`
- Mismo lenguaje visual que `not-found.tsx` (fondo, tipografía, ornamentos)
- Ícono `✦` en lugar del código 404
- Dos acciones:
  - "Intentar de nuevo" → llama `reset()` (reintenta el render del segmento)
  - "Volver al inicio" → `<Link href="/">`
- Activado por: errores no capturados en cualquier ruta bajo `app/`

**Diseño — aspecto visual:**
```
        ──●──

       KOMPRALO

          404

  Esta invitación no está disponible

  Puede que el enlace haya cambiado
  o que la invitación ya no esté activa.

    [ Volver al inicio ]

        ──●──
```

---

---

### FASE 5D-4 — CinematicIntro multi-categoría ✅
**Fecha:** 2026-06-17
**Objetivo:** Eliminar los props hardcodeados `brideName`/`groomName` y hacer que CinematicIntro funcione para las 4 categorías de evento.

**Archivos modificados:**

`src/components/invitation/CinematicIntro.tsx`
- Nuevo `CinematicIntroProps`: `{ protagonists, title, subtitle, eventDate, theme, onEnter }` (se removió `location` del interface — no se usa en el intro, el componente `Location` lo maneja)
- `GoldenHeart` ahora acepta `showConjunction?: boolean` — oculta la "y" SVG cuando hay un solo protagonista
- Nuevo `NamesDisplay` component: si `protagonists.length >= 2` muestra nombre1 + corazón con "y" + nombre2; si no, muestra 1 nombre + corazón sin "y"
- Helper `formatEventDate(dateStr): string` — convierte ISO a `DD.MM.YYYY`
- La línea de fecha muestra `{formattedDate} — {subtitle}` (subtitle contiene el venue/descripción del evento)
- Import de `InvitationLocation` eliminado (ya no necesario)
- Function signature usa `CinematicIntroProps` completo; solo se desestructuran las 5 props usadas (`protagonists`, `subtitle`, `eventDate`, `theme`, `onEnter`) — `title` existe en el interface para compatibilidad futura pero no se desestructura, evitando la warning ESLint

`src/components/invitation/InvitationRenderer.tsx`
- Reemplaza `brideName` y `groomName` por `protagonists={protagonists}`
- Pasa `title={invitation.title}`, `subtitle={invitation.subtitle}`, `eventDate={invitation.eventDate}`
- No pasa `location` (no está en el interface)

**Cómo se ve por categoría:**
| Categoría | NamesDisplay |
|-----------|-------------|
| wedding (2 protagonistas) | "Sofía ♡(y) Alejandro" |
| baby-shower (1 protagonista) | "Valentina ♡" |
| birthday (1 protagonista) | "Isabella ♡" |
| baptism (1 protagonista) | "Emilia ♡" |

**Resultado:** 0 errores TypeScript, 0 warnings nuevos introducidos.

---

---

### FASE 5D-5 — Rate limiting básico para POST /api/rsvp ✅
**Fecha:** 2026-06-17
**Objetivo:** Protección mínima contra abuso del endpoint público antes de conectar Supabase.

**Archivos creados:**

`src/lib/rate-limit/in-memory.ts`
- `createRateLimiter({ limit, windowMs })` → devuelve función `check(key): RateLimitResult`
- `RateLimitResult`: `{ allowed: boolean, remaining: number, resetAt: number }`
- Store: `Map<string, { count, windowStart }>` en memoria — se reinicia en cada deploy/restart
- Lógica de ventana fija: si `now - windowStart >= windowMs` se abre una nueva ventana
- Comentario JSDoc explícito: este limiter es dev-only; reemplazar con Upstash Redis antes de producción

**Archivos modificados:**

`src/app/api/rsvp/route.ts`
- Importa `createRateLimiter` y crea instancia singleton `rsvpRateLimit` (10 req / 60 000 ms)
- IP extraída de `x-forwarded-for` (primer valor) → `x-real-ip` → fallback `"unknown"`
- Rate limit se aplica como primer guard, antes de parsear body
- Si `!rl.allowed`: devuelve `429` con headers estándar:
  - `Retry-After`: segundos hasta que se reinicia la ventana
  - `X-RateLimit-Limit: 10`
  - `X-RateLimit-Remaining: 0`
  - `X-RateLimit-Reset`: timestamp Unix ms del reset
- Mensaje en body: `"Demasiados intentos. Intenta de nuevo más tarde."`
- El resto de la validación (invitationId, name, attendance, guestCount, invitationId existe) sigue intacto

**Configuración activa:**
```
Límite:   10 requests
Ventana:  60 segundos (por IP)
Fallback: IP = "unknown" si no hay headers de proxy
```

**Orden de guards en POST /api/rsvp:**
```
1. Rate limit (IP)                → 429 si excede
2. Parse JSON                     → 400 si inválido
3. invitationId presente          → 422 si falta
4. name presente                  → 422 si falta
5. attendance válido              → 422 si inválido
6. guestCount >= 0                → 422 si inválido
7. invitationId existe en repo    → 404 si no existe
8. rsvpRepository.submit()        → 201 / 500
```

**Para producción (qué falta):**
- Instalar `@upstash/ratelimit` + `@upstash/redis`
- Reemplazar `createRateLimiter` por `new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(10, '1 m') })`
- O mover el guard a Next.js Middleware (edge runtime) para bloquear antes de llegar al handler
- El store `Map` del limiter in-memory NO persiste entre instancias serverless ni entre deploys

**Resultado:** 0 errores TypeScript, 0 warnings nuevos. Todos los warnings del lint son preexistentes.

---

---

### FASE 6A — Supabase Foundation ✅
**Fecha:** 2026-06-17
**Objetivo:** Infraestructura de Supabase lista sin modificar ningún repository activo ni ninguna ruta.

**Dependencias instaladas:**
- `@supabase/supabase-js` — cliente JavaScript oficial
- `@supabase/ssr` — helpers para cookies en App Router (Server Components, Route Handlers)

**Archivos creados:**

`src/lib/supabase/env.ts`
- `getSupabaseEnv()` → `{ url, anonKey }` — para uso en browser y server
- `getSupabaseServiceEnv()` → `{ url, serviceRoleKey }` — para operaciones privilegiadas server-side
- Ambas lanzan `Error` descriptivo si la variable de entorno falta — el error ocurre en load-time, no en runtime silencioso

`src/lib/supabase/client.ts`
- `'use client'`
- `createBrowserSupabaseClient()` → `SupabaseClient<Database>`
- Usa anon key — sujeto a políticas RLS
- Para Client Components únicamente

`src/lib/supabase/server.ts`
- `createServerSupabaseClient()` → `Promise<SupabaseClient<Database>>`
- Usa `@supabase/ssr` + `await cookies()` (API async de Next.js 16)
- Implementa `getAll()` y `setAll()` para manejo de sesión por cookies
- Para Server Components, Route Handlers y Server Actions

`src/lib/supabase/types.ts`
- `export type Database = any` — placeholder tipado
- Comentario con instrucción exacta para reemplazar con tipos generados:
  `npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts`

**Archivos no modificados:**
- `.env.example` — ya tenía las 3 variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`)
- `invitationRepository` — sin cambios
- `rsvpRepository` — sin cambios
- Ninguna ruta ni componente modificado

**Qué queda listo para FASE 6B:**
| Pieza | Estado |
|-------|--------|
| `createBrowserSupabaseClient()` | ✅ lista para Client Components |
| `createServerSupabaseClient()` | ✅ lista para Server Components / Route Handlers |
| `Database` type | ⏳ placeholder — reemplazar tras `supabase gen types` |
| `SupabaseInvitationRepository` | ⏳ pendiente FASE 6B |
| `SupabaseRSVPRepository` | ⏳ pendiente FASE 6B |
| Swap de repositorios | ⏳ pendiente FASE 6C |

---

---

### FASE 6B — Supabase Repositories (inactivos) ✅
**Fecha:** 2026-06-17
**Objetivo:** Implementaciones Supabase de ambos repositories listos para compilar, sin activar.

**Archivos creados:**

`src/domain/invitations/supabase.repository.ts`
- `mapSupabaseInvitationToInvitationContent(row)` — adapter snake_case → camelCase para todas las columnas de `invitations`
- `SupabaseInvitationRepository` — NO declara `implements IInvitationRepository` (ver razón abajo)
- Métodos: `list()`, `getBySlug(slug)`, `getById(id)`, `getPreviewById(id)` — todos async
- Constructor recibe `SupabaseClient<Database>`
- `list()` ordena por `created_at DESC`
- `getBySlug` y `getById` usan `.eq().single()` — devuelve `null` si no existe o hay error

`src/domain/rsvp/supabase.repository.ts`
- `mapRSVPRowToRSVPResponse(row)` — adapter snake_case → camelCase para columnas de `rsvp_responses`
- `SupabaseRSVPRepository implements IRSVPRepository` — puede implementar el interface porque IRSVPRepository ya es async
- `submit(input)` — INSERT en `rsvp_responses` con `.select().single()`, devuelve `RSVPSubmissionResult`
- `listByInvitationId(id)` — SELECT filtrado por `invitation_id`, orden `created_at DESC`
- `countByInvitationId(id)` — SELECT con `count: 'exact', head: true` — solo el conteo, sin filas

**Por qué SupabaseInvitationRepository NO implementa IInvitationRepository:**
`IInvitationRepository` tiene métodos síncronos (`getBySlug(): InvitationContent | null`).
Supabase requiere async. TypeScript prohíbe asignar `Promise<T>` donde se espera `T`.
Para no romper las rutas activas (que llaman síncronamente), se mantiene el contrato actual.

**Tablas que espera cada repository:**

| Repository | Tabla | Columnas clave |
|------------|-------|----------------|
| SupabaseInvitationRepository | `invitations` | `id, slug, category, variant, template_id, plan_id, status, theme_id, feature_overrides (JSONB), title, subtitle, protagonists (JSONB), event_date, event_time, location (JSONB), hero (JSONB), story (JSONB), gallery (JSONB), timeline (JSONB), itinerary (JSONB), dress_code (JSONB), gift_registry (JSONB), music (JSONB), final_message (JSONB), parents (JSONB), padrinos (JSONB), hotels (JSONB), social (JSONB), rsvp_whatsapp_number, created_at, updated_at, published_at` |
| SupabaseRSVPRepository | `rsvp_responses` | `id (uuid), invitation_id (uuid FK), name, phone, attendance, guest_count, message, status, created_at, updated_at` |

**Qué falta antes de FASE 6C (swap):**
1. Aplicar schema SQL (`docs/SUPABASE_SCHEMA_DRAFT.md`) en el proyecto Supabase real
2. Ejecutar `npx supabase gen types typescript` → reemplazar `src/lib/supabase/types.ts`
3. Migrar `IInvitationRepository` a métodos async (rompe contrato actual, requiere actualizar LocalInvitationRepository + callers en rutas)
4. Agregar `implements IInvitationRepository` a `SupabaseInvitationRepository`
5. Cambiar `invitationRepository` en `repository.ts` al Supabase implementation
6. Cambiar `rsvpRepository` en `rsvp/repository.ts` al Supabase implementation
7. Configurar `.env.local` con las variables reales del proyecto Supabase

---

---

### FASE 6C-1 — IInvitationRepository migrado a async ✅
**Fecha:** 2026-06-17
**Objetivo:** Convertir el contrato a async para que LocalInvitationRepository y SupabaseInvitationRepository compartan el mismo interface. Sin activar Supabase.

**Archivos modificados:**

`src/domain/invitations/repository.types.ts`
- Todos los métodos ahora retornan Promise:
  - `list(): Promise<InvitationContent[]>`
  - `getBySlug(slug): Promise<InvitationContent | null>`
  - `getById(id): Promise<InvitationContent | null>`
  - `getPreviewById(id): Promise<InvitationContent | null>`

`src/domain/invitations/repository.ts`
- `LocalInvitationRepository`: todos los métodos marcados `async`, retornan valores directamente (el runtime los envuelve en Promise)
- Legacy exports (`listInvitations`, `getInvitationBySlug`, `getInvitationById`) también se volvieron `async` para mantener la compatibilidad de tipo con el interface

`src/domain/invitations/supabase.repository.ts`
- Agrega `import type { IInvitationRepository }`
- Ahora declara `implements IInvitationRepository` — posible porque el contrato ya es async
- Comentario de "NOT ACTIVE" simplificado: sigue apuntando a FASE 6C-2

**Callers migrados a `await`:**

| Archivo | Cambio |
|---------|--------|
| `src/app/i/[slug]/page.tsx` | `cache(async (slug) => ...)`, `await invitationRepository.getBySlug()`, `await getPublicInvitation()` en ambos: `generateMetadata` y `PublicInvitationPage` |
| `src/app/preview/[id]/page.tsx` | `await invitationRepository.getPreviewById(id)` |
| `src/app/api/rsvp/route.ts` | `await invitationRepository.getById(invitationId)` |

**Confirmación SupabaseInvitationRepository:**
```ts
export class SupabaseInvitationRepository implements IInvitationRepository { ... }
```
Compila sin error. Todos los métodos retornan `Promise<T>` — coinciden con el contrato.

**Qué falta para FASE 6C-2 (swap):**
1. Crear `.env.local` con `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` reales
2. Aplicar schema SQL en el proyecto Supabase (tablas `invitations` y `rsvp_responses`)
3. Ejecutar `supabase gen types typescript` → reemplazar `src/lib/supabase/types.ts`
4. En `src/domain/invitations/repository.ts`: cambiar `new LocalInvitationRepository()` por `new SupabaseInvitationRepository(supabase)`
5. En `src/domain/rsvp/repository.ts`: cambiar `new LocalRSVPRepository()` por `new SupabaseRSVPRepository(supabase)`

---

---

### FASE 6C-2 — Supabase Schema + Seed + Setup ✅
**Fecha:** 2026-06-17
**Objetivo:** Base de datos lista para activar repositories Supabase. Sin cambio de comportamiento.

**Archivos creados:**

`supabase/schema.sql`
- Función `set_updated_at()` — trigger reutilizable para auto-actualizar `updated_at`
- 8 tablas con PKs, FKs, índices, RLS y políticas
- Trigger `*_updated_at` en todas las tablas con `updated_at`
- `ON CONFLICT DO NOTHING` implícito por uso de `IF NOT EXISTS`

`supabase/seed.sql`
- Demo user: `00000000-0000-0000-0000-000000000001` / `demo@kompralo.mx`
- 4 invitaciones (UUIDs fijos: `1000...001` a `1000...004`)
- 4 registros en `invitation_content` (UUIDs fijos: `2000...001` a `2000...004`)
- Seed idempotente: `ON CONFLICT (id) DO NOTHING` en todos los inserts

`docs/SUPABASE_SETUP.md`
- Guía paso a paso: crear proyecto → credenciales → schema → seed → tipos → swap
- Instrucción exacta de `supabase gen types typescript`
- Muestra cómo activar `SupabaseInvitationRepository` y `SupabaseRSVPRepository` (FASE 6D)
- Incluye queries de verificación RLS

**Archivos modificados:**

`src/domain/invitations/supabase.repository.ts`
- Queries actualizadas de `select('*')` a `select('*, invitation_content(*)')` — PostgREST embedded join
- Adapter `mapSupabaseInvitationToInvitationContent` refactorizado: separa campos de `invitations` (metadatos) vs `invitation_content` (secciones JSONB)
- Constante `INVITATION_SELECT` documenta el selector de join
- Comentario de header actualizado: referencia al schema real
- Nota FASE 6C-2 → FASE 6D

**Tablas finales:**

| Tabla | Propósito | Índices |
|-------|-----------|---------|
| `users` | Perfil extendido de auth.users | PK = auth.users FK |
| `invitations` | Master record (metadata + estado) | `user_id`, `status`, `category`, `slug` (UNIQUE) |
| `invitation_content` | Secciones JSONB (1:1) | `invitation_id` (UNIQUE) |
| `invitation_versions` | Snapshots inmutables al publicar | `invitation_id`, `(invitation_id, version_number)` UNIQUE |
| `invitation_theme_overrides` | Overrides de tema por invitación (1:1) | `invitation_id` (UNIQUE) |
| `invitation_feature_overrides` | Feature flags por feature key (N:1) | `invitation_id`, `(invitation_id, feature_key)` UNIQUE |
| `rsvp_responses` | RSVPs de invitados | `invitation_id`, `(invitation_id, attendance)` |
| `payments` | Pagos Stripe (service role only) | `invitation_id`, `user_id`, `status` |

**Qué falta antes de FASE 6D (swap real):**
1. Crear proyecto Supabase y seguir `docs/SUPABASE_SETUP.md`
2. Ejecutar `supabase/schema.sql` en el SQL Editor
3. Ejecutar `supabase/seed.sql` (staging/dev)
4. Generar tipos: `npx supabase gen types typescript --project-id ID > src/lib/supabase/types.ts`
5. Crear `.env.local` con las 3 variables reales
6. Swap `invitationRepository` → `new SupabaseInvitationRepository(supabase)`
7. Swap `rsvpRepository` → `new SupabaseRSVPRepository(supabase)`

---

---

### FASE 6D — Repositories Supabase activos con fallback local ✅
**Fecha:** 2026-06-17
**Objetivo:** Supabase como fuente principal; local como respaldo automático. Sin cambio de comportamiento visible.

**Archivos modificados:**

`src/lib/supabase/env.ts`
- Nueva función `tryGetSupabaseEnv(): { url, anonKey } | null`
- No lanza Error — devuelve `null` si las variables faltan
- Usada por los factories de repository para decidir el path sin crashear

`src/domain/invitations/repository.ts`
- `LocalInvitationRepository` se mantiene idéntico (async, mismo comportamiento)
- Nueva clase `FallbackInvitationRepository implements IInvitationRepository`
  - Envuelve `primary` (Supabase) y `fallback` (Local)
  - Cada método: `try { primary } catch { warn + fallback }`
  - Logs `[Supabase]` en éxito, `[Fallback Local]` en error
- `buildInvitationRepository()` factory:
  - Si `tryGetSupabaseEnv()` retorna `null` → solo local (log de aviso)
  - Si hay env vars → `new FallbackInvitationRepository(supabase, local)`
- Legacy exports (`listInvitations`, `getInvitationBySlug`, `getInvitationById`) sin cambio

`src/domain/rsvp/repository.ts`
- Mismo patrón: `LocalRSVPRepository` + `FallbackRSVPRepository` + `buildRSVPRepository()`
- `LocalRSVPRepository` mantiene el guard de producción (lanza si `NODE_ENV === 'production'` y no hay Supabase)
- `FallbackRSVPRepository`: en producción el fallback nunca llega porque `LocalRSVPRepository` lanza en su constructor — esto es intencional; si Supabase falla en producción, el error es visible en lugar de silenciarse con datos en memoria

**Dónde se activa el fallback:**
| Condición | Comportamiento |
|-----------|----------------|
| Env vars ausentes | `[Fallback Local]` desde el inicio, sin intentar Supabase |
| Env vars presentes, Supabase responde | `[Supabase]` — datos desde DB |
| Env vars presentes, Supabase error (timeout, RLS, etc.) | `[Fallback Local]` — datos locales, warning en consola |
| Producción sin env vars | Error explícito al arrancar (LocalRSVPRepository guard) |

**Cómo verificar que está leyendo desde Supabase:**
```
# En la consola del servidor (npm run dev):
[Supabase] invitationRepository initialized — primary: Supabase, fallback: Local
[Supabase] invitations.getBySlug(sofia-y-alejandro) — found
[Supabase] rsvpRepository initialized — primary: Supabase, fallback: Local
[Supabase] rsvp.submit() OK — id: <uuid>

# Si las env vars no están:
[Fallback Local] NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY not set — using local repository.
```

**Qué falta para FASE 7 (Dashboard):**
1. Auth de usuarios (Supabase Auth — sign up, sign in, session)
2. Rutas protegidas: `/dashboard/*` con middleware de auth
3. CRUD de invitaciones propias (usa `SupabaseInvitationRepository` directamente, no el fallback)
4. Vista de RSVPs por invitación (usa `SupabaseRSVPRepository.listByInvitationId`)
5. Subida de imágenes (Supabase Storage)
6. Editor de contenido (modifica `invitation_content` via service role o RLS de propietario)

---

---

### FASE 7A — Dashboard Base protegido ✅
**Fecha:** 2026-06-17
**Objetivo:** Dashboard admin mínimo: lista de invitaciones, RSVPs por invitación, métricas básicas.

**Variable de entorno nueva:**
```
ADMIN_ACCESS_ENABLED=true   # habilita /dashboard
ADMIN_ACCESS_ENABLED=false  # redirige a / (default)
```
Documentada en `.env.example`. Sin esta variable activa, el layout redirige a `/` con `redirect('/')` en el Server Component — sin JS necesario.

**Archivos creados:**

`src/app/dashboard/layout.tsx`
- Server Component — evalúa `ADMIN_ACCESS_ENABLED` en tiempo de render
- Si no está activo: `redirect('/')` — usuarios externos nunca ven el dashboard
- Sidebar: marca "Kompralo / Admin", links a Inicio · Invitaciones · RSVPs · Ver sitio
- Layout: sidebar fijo izquierdo (#1A1410) + main content (#F5F3F0)
- Footer del sidebar muestra `ADMIN_ACCESS_ENABLED=true` como recordatorio visual

`src/app/dashboard/page.tsx`
- 4 stat cards: Total invitaciones · Publicadas · Pendientes · RSVPs totales
- RSVPs totales: `Promise.all(invitations.map(countByInvitationId))` sumado
- Lista de invitaciones recientes (primeras 5) con badge de status coloreado

`src/app/dashboard/invitations/page.tsx`
- Tabla completa de todas las invitaciones
- Columnas: Título/Slug · Categoría · Tema · Plan · Estado · Links
- Links: "Público" → `/i/[slug]` y "Preview" → `/preview/[id]` (ambos `target="_blank"`)
- Badge de status con colores semánticos por estado

`src/app/dashboard/rsvps/page.tsx`
- Agrupa RSVPs por invitación (`listByInvitationId` por cada invitación en paralelo)
- Header de grupo: contadores de ✓ Asisten / ? Tal vez / ✗ No asisten
- Tabla por grupo: Nombre · Asistencia · Invitados · Teléfono · Mensaje
- Si no hay RSVPs: placeholder "pendientes de datos reales"

**Datos que muestra el dashboard:**

| Página | Fuente de datos |
|--------|----------------|
| `/dashboard` | `invitationRepository.list()` + `rsvpRepository.countByInvitationId()` x N |
| `/dashboard/invitations` | `invitationRepository.list()` |
| `/dashboard/rsvps` | `invitationRepository.list()` + `rsvpRepository.listByInvitationId()` x N |

**Para habilitar el dashboard en desarrollo:**
```bash
# .env.local
ADMIN_ACCESS_ENABLED=true
```

**Qué falta para FASE 7B:**
1. Auth real (Supabase Auth o JWT) — reemplazar el env flag
2. Middleware de protección de rutas (`middleware.ts`) para edge-level auth
3. Acciones de edición: cambiar status, editar título/subtitle
4. Filtros y búsqueda en la tabla de invitaciones
5. Paginación de RSVPs
6. Export CSV de RSVPs

---

---

### FASE 7C — Feature Registry 2.0 ✅
**Fecha:** 2026-06-17
**Objetivo:** Catálogo central de features para roadmap, editor visual futuro y transparencia de planes.

**Archivos creados:**

`src/domain/features/types.ts`
- `FeatureStatus`: `'active' | 'comingSoon' | 'hidden'`
- `FeatureCategory`: `'core' | 'engagement' | 'media' | 'social' | 'logistics' | 'content' | 'ai'`
- `FeatureDescriptor`: interface completa con `id, label, description, category, status, minimumPlan, iconName, requiresPersistence, editableByCustomer, editableByAdmin, planFeatureKey?`

`src/domain/features/registry.ts`
- `featureRegistry: FeatureDescriptor[]` — catálogo completo (33 features)
- `featureRegistryById` — lookup por id
- `activeFeatures` — features con `status === 'active'` (21)
- `comingSoonFeatures` — features con `status === 'comingSoon'` (9)
- `getFeaturesForPlanFromRegistry(planId)` — delega al sistema existente (comportamiento idéntico, aditivo)
- `getActiveFeaturesForPlan(planId)` — features activas disponibles para un plan, enriquecidas con metadata
- `getComingSoonFeatures()` — lista de roadmap para UI

`src/domain/features/index.ts` — barrel del dominio

**Features activas registradas (21):**

| Feature | Plan mínimo | Categoría | Persistencia |
|---------|-------------|-----------|--------------|
| showIntro | platinum | core | No |
| showHero | basic | core | No |
| showCountdown | basic | core | No |
| showFinalMessage | basic | core | No |
| showRSVP | basic | engagement | Sí |
| showWhatsApp | basic | engagement | No |
| showGuestbook | platinum | engagement | Sí |
| showMessages | platinum | engagement | Sí |
| showGallery | gold | media | No |
| showMusic | gold | media | No |
| showStoryBook | platinum | media | No |
| showHashtag | platinum | social | No |
| showMaps | gold | logistics | No |
| showQRCode | gold | logistics | No |
| showItinerary | gold | logistics | No |
| showAccommodation | platinum | logistics | No |
| showTimeline | platinum | content | No |
| showDressCode | gold | content | No |
| showGiftRegistry | platinum | content | No |
| showParents | platinum | content | No |
| showPadrinos | platinum | content | No |

**Features comingSoon registradas (9):**

| Feature | Plan mínimo | Categoría |
|---------|-------------|-----------|
| guestbook | gold | engagement |
| videoMessage | gold | engagement |
| liveStream | platinum | engagement |
| photoUpload | platinum | engagement |
| spotifyPlaylist | gold | media |
| youtubeEmbed | gold | media |
| multipleLocations | gold | logistics |
| aiStoryGenerator | platinum | ai |

**Compatibilidad con sistema anterior:**
- `getFeaturesForPlan()` en `src/domain/plans/registry.ts` — sin cambios
- `InvitationFeatureKey` en `src/domain/plans/types.ts` — sin cambios
- `InvitationRenderer` — sin cambios
- `FeatureGate` — sin cambios
- Todos los planes (`basic`, `gold`, `platinum`) — comportamiento idéntico

**Qué falta para el editor visual:**
1. UI de catálogo de features en el dashboard (`/dashboard/features`)
2. Toggle de feature por invitación usando `editableByCustomer` para mostrar/ocultar controles
3. Conectar `getActiveFeaturesForPlan(inv.planId)` al editor de secciones
4. Badge "Próximamente" para `comingSoon` features en el catálogo del cliente
5. Admin override: usar `editableByAdmin: true` para permitir activar features fuera del plan

---

---

### FASE 7D — Dashboard Features Catalog ✅
**Fecha:** 2026-06-17
**Objetivo:** Vista administrativa del catálogo completo de features, agrupado por categoría con badges de estado y flags.

**Archivos creados:**

`src/app/dashboard/features/page.tsx`
- Server Component — lee `featureRegistry` directamente (sin red, sin await)
- Header: contadores totales (activas · próximamente · total)
- Leyenda visual de todos los badges posibles
- 7 secciones por categoría: Core · Engagement · Media · Social · Logística · Contenido · IA
- Cada sección muestra: subcontador activas + próximamente
- Tabla por sección con columnas: Feature · Estado · Plan mínimo · Flags
- Cada fila muestra: `label`, `description`, `planFeatureKey` (si existe, en monospace), status badge, plan badge, flags badges

**Archivos modificados:**

`src/app/dashboard/layout.tsx`
- Link "Features" agregado al sidebar entre RSVPs y ← Ver sitio

**Badges implementados:**

| Badge | Color | Significado |
|-------|-------|-------------|
| Activa | verde | feature en producción |
| Próximamente | ámbar | roadmap confirmado |
| Oculta | gris | desactivada temporalmente |
| Requiere DB | rojo suave | necesita tabla Supabase |
| Cliente | azul | customer puede togglarlo |
| Admin | teal | admin puede togglarlo |
| basic / gold / platinum | gris/dorado/violeta | plan mínimo requerido |

**Qué muestra el catálogo:**
- 21 features activas con su `planFeatureKey` para trazar la conexión al sistema de planes
- 9 features comingSoon documentadas con plan objetivo y si requieren DB
- Ninguna feature nueva activada — solo visibilidad del roadmap

**Qué falta para el editor visual:**
1. `/dashboard/invitations/[id]` — página de detalle por invitación
2. Tabla de features editables por invitación usando `getActiveFeaturesForPlan(inv.planId)`
3. Toggle server action para `invitation_feature_overrides` en Supabase
4. Vista de `comingSoon` features como "upgrade a Platinum" en el self-serve del cliente
5. Columna `editableByCustomer` → controla qué ve el cliente; `editableByAdmin` → lo que ve el admin

---

## Pendiente (siguiente fase)

En orden de prioridad:

1. **Eliminar `window.lenis` global**
   - `SmoothScroll.tsx` asigna `window.lenis` como side-effect
   - `CinematicIntro.tsx` lo lee directamente
   - Mover a React Context tipado

3. **Esquema relacional para Supabase**
   - Diseñar tablas: `invitations`, `rsvp_responses`, `invitation_plans`
   - El adapter ya devuelve `InvitationContent` — Supabase debe mapear a esa forma

4. **RSVP con persistencia**
   - `RSVPForm.tsx` actualmente abre WhatsApp
   - Crear `POST /api/rsvp` stub vacío listo para Supabase

5. **Countdown sin estado para fecha pasada**
   - Si la boda ya pasó, muestra `0:0:0:0`
   - Agregar estado `eventPassed` con mensaje alternativo

6. **Warnings de lint preexistentes**
   - 53 warnings (0 errores) — todos preexistentes, ninguno introducido en 5C
   - Principalmente: `no-img-element` en `MultilayerBackground`, unused vars en varios componentes

## Comandos de validación

```bash
npx --no-install tsc --noEmit --incremental false   # debe salir sin output (0 errores)
npm run lint                                         # 0 errors, 53 warnings (preexistentes)
```

## Notas para la siguiente IA

- No hay Supabase. Todo es fixtures en memoria.
- No hay Stripe. El status `pending_payment` existe en el enum pero no hay flujo de pago.
- No hay auth. Las rutas son públicas.
- El renderer (`InvitationRenderer.tsx`) es puro — solo recibe props, no hace fetch.
- Los temas se aplican como CSS variables en el div raíz del renderer.
- `window.lenis` es un global frágil — no modificar hasta FASE 5C-4.
- Los exports legacy en `repository.ts` se mantienen por compatibilidad (ninguna ruta activa los usa ya — solo por si acaso).
- `DevPlayground` está en `src/components/invitation/dev/DevPlayground.tsx` — no importar desde rutas de producción.
- `NEXT_PUBLIC_APP_URL` debe configurarse en `.env.local` para que OG URLs sean correctas en desarrollo.

---

## FASE INVITATION-MOBILE-PERFORMANCE-LAYERS-FIX - Invitacion publica movil, contador y fondos

Fecha: 2026-06-19

### Objetivo

Corregir la experiencia publica de invitacion en movil sin tocar Stripe, webhook, orders, Resend, Auth, dashboard, pricing, asistentes ni logica de compra.

### Archivos modificados

- `src/components/invitation/Countdown.tsx` - contador responsive en 2 columnas para movil y fila original en desktop.
- `src/components/invitation/InvitationRenderer.tsx` - contencion horizontal del renderer publico.
- `src/components/invitation/MultilayerBackground.tsx` - clases por capa y menor carga de particulas en movil.
- `src/app/globals.css` - mascaras/opacity responsive para fondos decorativos y soporte reduced motion.

### Cambios realizados

1. El contador dejo de depender de una sola fila fija en movil; ahora usa grid 2x2 bajo `md` y conserva separadores solo en desktop.
2. Las flip cards usan tamanos compactos en pantallas menores a 768px para evitar cortes laterales.
3. El renderer publico usa `overflow-x-hidden` y `min-w-0` para evitar scroll horizontal accidental.
4. Las imagenes decorativas de fondo reciben mascara radial, opacity reducida y blur leve en movil para eliminar bordes cuadrados visibles.
5. Las particulas del fondo bajan su limite en movil para reducir trabajo de canvas.
6. Se agrego regla `prefers-reduced-motion` para desactivar animaciones decorativas de capas cuando el usuario lo solicita.

### Estado

- Finalizado: validacion visual y tecnica completada.

### Validacion final de INVITATION-MOBILE-PERFORMANCE-LAYERS-FIX

- `http://127.0.0.1:3003/sofia-y-alejandro`: 200 local.
- `http://127.0.0.1:3003/i/sofia-y-alejandro`: 200 local.
- `http://127.0.0.1:3003/invitacion/sofia-y-alejandro`: 200 local.
- `http://127.0.0.1:3003/invitaciones/sofia-y-alejandro`: 200 local.
- `http://127.0.0.1:3003/no-existe`: 404 local controlado.
- Viewports medidos: 390px, 430px, 768px, 1440px.
- Overflow horizontal medido: 0px en 390px y 430px; sin overflow positivo en 768px y 1440px.
- `npx.cmd --no-install tsc --noEmit`: OK.
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint`: OK con 11 warnings preexistentes.
- `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build`: OK.

---

## FASE ONE-EMAIL-ACCESS-FLOW - Acceso post-pago con un solo correo

Fecha: 2026-06-19

### Decisión técnica

- El webhook genera un token opaco de 32 bytes y guarda únicamente su hash SHA-256.
- El enlace es reutilizable durante 7 días para reducir incidencias por aperturas repetidas.
- `/access/consume` valida token, expiración, orden pagada, invitación y email antes de crear acceso.
- La cookie `kompralo_access` es HttpOnly, SameSite=Lax, Secure en producción y está firmada con HMAC-SHA256 mediante `ACCESS_TOKEN_SECRET`.
- La cookie solo autoriza la invitación indicada; no habilita el dashboard general, listados ni otras invitaciones.

### Archivos creados

- `supabase/invitation_access_tokens.sql`
- `src/lib/access/createInvitationAccessToken.ts`
- `src/lib/access/verifyInvitationAccess.ts`
- `src/app/access/consume/route.ts`

### Archivos modificados

- `.env.example`
- `src/app/api/webhook/stripe/route.ts`
- `src/lib/resend/emailTemplates.ts`
- `src/lib/resend/sendOrderConfirmationEmail.ts`
- `src/app/checkout/success/page.tsx`
- `src/app/dashboard/layout.tsx`
- `src/app/dashboard/invitations/[id]/edit/page.tsx`
- `src/app/dashboard/invitations/[id]/edit/actions.ts`

### Seguridad

- El token original no se guarda ni se registra en logs.
- La cookie no contiene email, token de acceso, service role ni secretos.
- El editor y sus server actions aceptan sesión Supabase del propietario o cookie firmada para el mismo `invitationId`.
- Tokens inválidos o vencidos redirigen a `/login` con error controlado.
- La verificación de firma del webhook Stripe continúa usando el body crudo y no fue modificada.

### Requisitos de despliegue pendientes

1. Aplicar `supabase/invitation_access_tokens.sql` en Supabase SQL Editor.
2. Configurar `ACCESS_TOKEN_SECRET` con un valor aleatorio de al menos 32 caracteres en Vercel.
3. Confirmar `NEXT_PUBLIC_APP_URL` con HTTPS en Vercel.
4. Desplegar y ejecutar una compra test nueva para validar Resend, cookie y persistencia real.

### Validación local

- `npx.cmd --no-install tsc --noEmit`: OK.
- `npm.cmd run lint`: OK con 10 warnings preexistentes y 0 errores.
- `npm.cmd run build`: OK.
- Prueba E2E real: pendiente de aplicar SQL, configurar secreto y desplegar.

---

## FASE CRO-LANDING-META-ADS-UPGRADE - Landing para tráfico frío

Fecha: 2026-06-19

### Objetivo

Convertir `/invitaciones` de catálogo visual a landing orientada a deseo, confianza, demostración y compra, conservando Checkout, precios y lógica crítica.

### Archivos modificados

- `src/app/invitaciones/page.tsx`
- `src/app/invitaciones/precios/page.tsx`
- `src/components/public/Motion.tsx`

### Cambios principales

1. Hero full-bleed con posicionamiento “La forma más elegante de organizar tu evento desde un solo enlace”.
2. Demo visual 16:9 preparada para sustituirse por video real, con flujo de seis pasos.
3. Franja de confianza: Stripe, uso sin app, WhatsApp y edición móvil.
4. Kompralo se presenta como centro digital del evento, no solo como invitación.
5. Beneficios redactados alrededor de dolores reales: confirmación, ubicación, regalos, expectativa y cambios.
6. Comparación directa entre invitación tradicional y Kompralo.
7. Cinco tipos de evento con fotografía editorial local.
8. Premium marcado como “Más vendido”, dominante y conectado al `CheckoutButton` original.
9. Casos representativos sin métricas inventadas y comentario interno para sustituir por reseñas verificadas.
10. Garantía de acompañamiento, urgencia suave para eventos próximos, FAQ de siete objeciones y CTA emocional final.
11. `next/image` para assets locales y motion reducido cuando el sistema solicita `prefers-reduced-motion`.

### Validación

- `/invitaciones`: HTTP 200 local y contenido CRO principal presente.
- `/invitaciones/precios`: HTTP 200 local.
- `/sofia-y-alejandro`: HTTP 200; la ruta pública no se alteró.
- Los tres planes conservan `CheckoutButton` con `productId` Basic, Premium y Deluxe.
- Automatización visual por viewport: bloqueada por el entorno del navegador; se validaron breakpoints y contención responsive en código, sin afirmar inspección por captura.
