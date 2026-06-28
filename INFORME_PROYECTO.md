# KOMPRALO — Informe de Estado del Proyecto
**Fecha:** 28 de junio de 2026  
**Stack:** Next.js App Router · TypeScript · Supabase · Stripe · Vercel  
**Repo local:** D:\josed\Descargas\invitacion maestra  
**URL producción:** https://kompralo.vercel.app  
**Invitación propia:** https://kompralo.vercel.app/i/nuestrabodaarletteymayorga  

---

## 1. ARQUITECTURA GENERAL

### Rutas principales
- `/` — Landing page pública
- `/cliente` — Panel Mis Eventos (lista de invitaciones del usuario)
- `/cliente/invitaciones/[id]` — Centro de Control de cada boda
- `/dashboard/invitations/[id]/edit` — Editor V4 (único editor activo)
- `/i/[slug]` — Invitación pública (vista del invitado)
- `/preview/[id]` — Preview del editor
- `/auth/*` — Autenticación

### Stack de datos
- Supabase: tablas `invitations`, `invitation_content`, `orders`, `guests`, `rsvp_responses`
- Campo clave: `invitation.themeId` → resuelve el tema visual
- Bucket Storage: `invitation-assets/backgrounds/` → fondos florales WebP

---

## 2. SISTEMA DE TEMAS

13 temas registrados en `src/domain/themes-v2/registry.ts`:
- `ivory-editorial` (DEFAULT) — Cream & Botanical, fondo floral
- `luxury-gold`, `editorial`, `floral`, `modern-dark`
- `luxury-champagne`, `modern-pastel`, `garden-romance`
- `boho-terracotta`, `black-tie`
- `pastel-rose-editorial`, `pastel-sage-editorial`, `pastel-sky-editorial`

El tema activo se resuelve en `InvitationRenderer.tsx`:
```
const resolvedThemeId = themePreviewId ?? invitation.themeId ?? 'ivory-editorial'
```

**IMPORTANTE:** El fondo floral `fondo_1.webp` solo se aplica 
cuando `themeV2.id === 'ivory-editorial'`. No afecta otros temas.

---

## 3. EDITOR V4 — ESTADO ACTUAL

### Componentes clave
- `EditorV4Shell.tsx` — wrapper principal del editor
- `EditorV4Toolbar.tsx` — navbar superior (sin botón "Editor clásico")
- `src/components/editor-v4/` — todos los inspectores de secciones

### 15 secciones con inspector completo
CinematicIntro, Hero, Countdown, Familias, Historia, Galería,
Línea del Tiempo, Itinerario, Ubicación, Vestimenta, Regalos,
Padrinos, Hospedaje, Hashtag/Social, Mensaje Final

### Pendientes del Editor V4
- CinematicIntro: quitar fallback "NINGUNO", consolidar Save buttons,
  fix orden subtítulo
- Mesa de Regalos: lluvia de sobres sin campo URL, sin duplicados
- Verificar link público /i/[slug] con slug real en producción

### Canvas Engine V2
- HoverManager, HighlightEngine, BoundingBox, SelectionRenderer
- postMessage types: EDITOR_V4_SECTION_HOVER, EDITOR_V4_SECTION_HOVER_END,
  KOMPRALO_SCROLL_TO_SECTION, EDITOR_V4_FIELD_SAVED, EDITOR_V4_ELEMENT_SELECTED
- refreshAndScrollTo(sectionId) con 1500ms delay para GSAP init
- Zoom 50-150%, Device Switch PC/Tab/Móvil con localStorage
- Preview params: ?from=editor&editorPreview=1&skipIntro=1

### RESTRICCIONES CRÍTICAS — nunca tocar
- InvitationRenderer render logic
- Hero.tsx
- SaveManager
- Registry core
- Stripe
- Schema de base de datos
- Rutas públicas
- public/images/invitaciones/mapa.png (nunca commitear)

---

## 4. INVITACIÓN PÚBLICA (/i/[slug])

### Flujo de renderizado
1. CinematicIntro → pantalla de entrada con nombres + fecha + botón ABRIR
2. Hero → portada con foto/video de fondo
3. Secciones en orden según hiddenSections en feature_overrides

### Diseño actual (ivory-editorial)
- Fondo: fondo_1.webp (95KB, WebP) con opacity 0.35, repeat-y
- Paleta: crema #fdf6ec, dorado #c9a84c, texto #2c1810
- Tipografía: serif para títulos, letra-spacing en etiquetas
- Cards: rgba(255,255,255,0.75) + backdrop-filter blur(4px)
- Countdown: números limpios sin cajas, clamp(56px,10vw,96px) serif

### Fondos disponibles en Supabase
- fondo_1.webp — rosas rosadas + marco dorado (95KB)
- fondo_2.webp — moños + perlas + encaje (121KB)
- fondo_3.webp — perlas + anillos dorados (88KB)
- hero_1.webp — marco ornamental horizontal (107KB)

### Fix crítico de scroll
CinematicIntro tenía overflow:hidden en body que no se restauraba
si los refs eran null. Fix: cleanup en useEffect que siempre
restaura document.body.style.overflow = '' al desmontar.

---

## 5. CENTRO DE CONTROL (/cliente/invitaciones/[id])

### Componentes
- `src/app/cliente/invitaciones/[id]/page.tsx` — página principal
- `MiEventoTour.tsx` — tour spotlight 16 pasos
- `CentroControlHelpModal.tsx` — modal de ayuda 7 secciones
- `CentroControlHelpButton.tsx` — botón ? en nav

### Features activos
- Header con título en Pinyon Script dinámico (lee protagonistas)
- Thumbnail de invitación en banner countdown (reemplaza estrella)
- Stats row: Confirmaron / Asistirán / No asistirán / Asistentes
- Tabla invitados confirmados con Ver pase QR
- Sección Mis Invitados con búsqueda, filtros y tabla de acciones
- Modal de ayuda ? con 7 secciones responsive (desktop 2 cols, mobile tabs)
- Tour spotlight automático en primer acceso
- Hint post-tour apuntando al botón ?
- Título "Administrador de Invitados" sobre el buscador

### IDs para el tour
tour-header, tour-btn-ver, tour-btn-compartir, tour-btn-stats,
tour-btn-plan, tour-countdown, tour-card-invitacion,
tour-btn-administrar, tour-btn-ver-invitados, tour-stats-row,
tour-tabla-confirmados, tour-btn-qr, tour-mis-invitados,
tour-btn-crear, tour-tabs-filtro, tour-acciones-fila

---

## 6. MIS EVENTOS (/cliente)

### Estado actual
- Lista de invitaciones del usuario
- Card por invitación: stats RSVP + botones Abrir/Ver/Editar/Compartir
- Sin tour activo (MisEventosTour.tsx existe pero no se renderiza)
- Sin botones de manual (eliminados)
- Botón "Editar" apunta a /dashboard/invitations/[id]/edit

---

## 7. SISTEMA DE INVITADOS

### Guest passes
- canManageInvitation() autoriza por user_id, customer_email, o paid order
- Pase personalizado por familia: QR único con nombre del invitado
- Pase de confirmación: generado al confirmar asistencia en la invitación
- Ver pase desde tabla Mis Invitados (columna ACCIONES)
- Ver pase desde tabla Invitados Confirmados (columna PASE)

---

## 8. PERFORMANCE

### Optimizaciones activas
- Imágenes WebP: 96% más ligeras vs PNG original
- Preload condicional fondo_1.webp en PublicInvitationRoute.tsx
- backgroundAttachment: fixed removido (bug iOS Safari)
- Lazy loading en imágenes fuera del viewport inicial

### Pendiente de optimizar
- Video del Hero: verificar preload="metadata"
- Galería: lazy loading ya activo
- GSAP animations: verificar que no bloqueen LCP

---

## 9. DEMO DE LA LANDING

- Slug demo: `/sofia-y-alejandro`
- Hardcodeado en Hero3D.tsx y InvitacionesHeader.tsx
- Es una invitación separada en BD, diferente a la de Arlette/Mayorga
- PENDIENTE: actualizar demo con nuevo diseño ivory-editorial

---

## 10. PENDIENTES PRIORITARIOS

### Alta prioridad
- [ ] Actualizar invitación demo /sofia-y-alejandro con nuevo diseño
- [ ] CinematicIntro: quitar "NINGUNO", consolidar Save buttons
- [ ] Mesa de Regalos: lluvia de sobres sin URL, sin duplicados
- [ ] Verificar /i/nuestrabodaarletteymayorga en producción completo

### Media prioridad
- [ ] MisEventosTour: decidir si activar o mantener desactivado
- [ ] Optimizar video Hero con preload="metadata"
- [ ] Step checklist card en /cliente (PENDIENTE MM-2)

### Baja prioridad
- [ ] Subir más fondos florales para otros temas
- [ ] Explorar tema dark cinematic como alternativa

---

## 11. COMMITS RECIENTES

```
ab4023b perf: imágenes WebP 96% más ligeras + preload fondo_1
4b5b4c5 fix: restaurar scroll después de CinematicIntro
0018a19 fix: fondo_1 solo para tema ivory-editorial
a43ce25 design: fondo único fondo_1 en wrapper raíz
dfe20df fix(location): quitar fondo floral, solo crema sólido
c8e0df0 fix(sections): fondos florales aplicados correctamente
c4366a9 fix(countdown): eliminar cajas, números limpios
02a43b1 fix(centro-control): modal ayuda responsivo en mobile
8460459 design: tipografía y paleta global cream & botanical
ccdb77e fix(centro-control): título uniforme sin clipping
```

---

*Generado el 28 de junio de 2026*  
*Próxima sesión: continuar con demo landing + pendientes prioritarios*
