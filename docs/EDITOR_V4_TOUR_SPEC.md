# EditorV4Tour & EditorHelpModal — Especificación

> Fuente de verdad del tour y manual del Editor Visual V4 (`/dashboard/invitations/[id]/edit`).

---

## 1. Overview

Dos sistemas complementarios:

| Sistema | Componente | Trigger |
|---------|-----------|---------|
| Spotlight tour | `EditorTour.tsx` | Botón "🎬 Ver tutorial" o evento global |
| Manual completo | `EditorHelpModal.tsx` | Botón `?` en toolbar |

**Componentes:**

| Archivo | Propósito |
|---------|-----------|
| `src/components/editor-v4/EditorTour.tsx` | Spotlight tour |
| `src/components/editor-v4/EditorHelpModal.tsx` | Manual con sidebar |
| `src/app/dashboard/invitations/[id]/edit/editor-v4/EditorV4Toolbar.tsx` | Toolbar con anchors |
| `src/app/dashboard/invitations/[id]/edit/editor-v4/EditorV4Shell.tsx` | Layout canvas/sidebar/inspector |

---

## 2. STEPS del Tour

| # | ID | Título | Texto |
|---|----|--------|-------|
| 1 | `editor-v4-title-area` | Tu invitación | Aquí aparece el nombre de tu boda. El slug es la URL que compartirás con tus invitados. |
| 2 | `editor-v4-device-switch` | Vista por dispositivo | Previsualiza tu invitación como se verá en computadora, tableta o celular. Cambia entre ellos con un clic. |
| 3 | `editor-v4-zoom-controls` | Zoom del canvas | Acerca o aleja la vista del canvas. No afecta cómo se ve la invitación para tus invitados, solo tu área de trabajo. |
| 4 | `editor-v4-refresh-btn` | Refrescar canvas | Si algo no se actualiza visualmente, usa Refrescar para recargar la previsualización sin perder cambios. |
| 5 | `editor-v4-preview-btn` | Vista previa real | Abre tu invitación exactamente como la verán tus invitados, en una pestaña nueva. |
| 6 | `editor-v4-layers` | Secciones de tu invitación | Haz clic en cualquier sección para editarla. También puedes hacer clic directo sobre el canvas. |
| 7 | `editor-v4-canvas` | Tu invitación en vivo | Todo lo que edites se refleja aquí al instante. Haz clic sobre cualquier elemento para seleccionarlo. |
| 8 | `editor-v4-inspector` | Inspector | Al seleccionar una sección aparecen aquí sus opciones de personalización: textos, fotos, colores y más. |
| 9 | `editor-v4-share-btn` | Comparte tu invitación | Cuando tu invitación esté lista, comparte el enlace con tus invitados desde aquí. |
| 10 | `editor-v4-help-btn` | ¿Necesitas ayuda? | Este botón abre la guía completa del editor en cualquier momento. ¡Úsala cuando quieras! |

---

## 3. IDs en el DOM

| ID | Archivo | Ubicación |
|----|---------|-----------|
| `editor-v4-title-area` | `EditorV4Toolbar.tsx` | Wrapper nombre + slug |
| `editor-v4-device-switch` | `EditorV4Toolbar.tsx` | Botones PC/Tab/Móvil |
| `editor-v4-zoom-controls` | `EditorV4Toolbar.tsx` | Controles − % + |
| `editor-v4-refresh-btn` | `EditorV4Toolbar.tsx` | Botón "↺ Refrescar" |
| `editor-v4-preview-btn` | `EditorV4Toolbar.tsx` | Botón "↗ Vista previa" |
| `editor-v4-share-btn` | `EditorV4Toolbar.tsx` | Botón "Compartir" |
| `editor-v4-help-btn` | `EditorV4Toolbar.tsx` | Botón "?" |
| `editor-v4-layers` | `EditorV4Shell.tsx` | Sidebar izq SECCIONES |
| `editor-v4-canvas` | `EditorV4Shell.tsx` | Canvas central |
| `editor-v4-inspector` | `EditorV4Shell.tsx` | Sidebar der INSPECTOR |

---

## 4. Secciones del Manual

| Orden | ID | Título | Contenido |
|-------|----|--------|-----------|
| 1 | `toolbar` | 🖥 Barra superior | Device switch, zoom, refrescar, vista previa, compartir |
| 2 | `portada` | 🎬 Intro cinematográfico | Eyebrow, nombres, subtítulo, botón ABRIR |
| 3 | `hero` | 🌟 Portada | Foto/video, frase, fecha, venue |
| 4 | `countdown` | ⏳ Cuenta regresiva | Estilos del contador |
| 5 | `historia` | 📖 Historia | 3 slides |
| 6 | `galeria` | 📸 Galería | Subir/eliminar fotos |
| 7 | `timeline` | 🗓️ Línea del tiempo | 4 hitos |
| 8 | `itinerario` | 📋 Itinerario | Eventos del día |
| 9 | `ubicacion` | 📍 Ubicación | URLs Maps y Waze |
| 10 | `dresscode` | 👔 Vestimenta | Paleta + nivel |
| 11 | `familias` | 👨‍👩‍👧 Familias | Padres |
| 12 | `padrinos` | 🤝 Padrinos | Categorías CRUD |
| 13 | `gifts` | 🎁 Mesa de regalos | 3 modalidades |
| 14 | `hospedaje` | 🏨 Hospedaje | Hoteles |
| 15 | `hashtag` | 📱 Hashtag | Hashtag auto |
| 16 | `mensaje` | 💌 Mensaje final | Cierre |

**Botón en header del modal:** "🎬 Ver tutorial guiado" — cierra modal y dispara evento del tour.

---

## 5. Comportamiento

Trigger del tour (no automático, solo manual):
```ts
window.dispatchEvent(new Event('kompralo:editor-v4-tour-open'))
```

Filtrado por `document.getElementById(s.id)` igual que MiEventoTour.

Sección `toolbar` del modal **no** tiene botón "Mostrar en el editor" (no es sección del canvas).

---

## 6. Cómo actualizar

Mismo workflow que MIEVENTO_TOUR_SPEC.md. Plantilla:

```

ACTUALIZAR EditorTour y EditorHelpModal según
docs/EDITOR_V4_TOUR_SPEC.md

Lee:
- docs/EDITOR_V4_TOUR_SPEC.md
- src/components/editor-v4/EditorTour.tsx
- src/components/editor-v4/EditorHelpModal.tsx
- src/app/dashboard/invitations/[id]/edit/editor-v4/EditorV4Toolbar.tsx

CAMBIOS: [...]

NO tocar: InvitationRenderer, Hero, SaveManager,
Registry, Stripe, schema, rutas públicas.

npx tsc --noEmit && npm run build && push a main

```

---

## 7. Historial

| Fecha | Cambio |
|-------|--------|
| 2026-06-28 | Versión inicial — 10 STEPS + 16 secciones manual |
