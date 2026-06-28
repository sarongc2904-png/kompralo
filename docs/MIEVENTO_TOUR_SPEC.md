# MiEventoTour — Especificación

> Fuente de verdad del tour guiado del Centro de Control (`/cliente/invitaciones/[id]`).
> Cuando cambien secciones, botones o IDs del dashboard, **actualiza primero este archivo** y luego genera el prompt para Claude Code desde aquí.

---

## 1. Overview

El **MiEventoTour** es un spotlight tour interactivo que se ejecuta automáticamente la primera vez que un cliente entra al Centro de Control de su invitación. Guía paso a paso por las funciones principales, resaltando un elemento a la vez sobre un fondo oscurecido.

**Componentes involucrados:**

| Archivo | Propósito |
|---------|-----------|
| `src/app/cliente/invitaciones/[id]/MiEventoTour.tsx` | Componente del tour (STEPS + UI spotlight) |
| `src/app/cliente/invitaciones/[id]/CentroControlHelpModal.tsx` | Modal estático del botón `?` (manual completo) |
| `src/app/cliente/invitaciones/[id]/CentroControlHelpButton.tsx` | Botón `?` flotante que abre el modal |
| `src/app/cliente/invitaciones/[id]/page.tsx` | Host de IDs `tour-*` para los anchors del spotlight |
| `src/components/cliente/GuestPassSection.tsx` | Host de IDs de la sección "Mis invitados" |

---

## 2. Lista de pasos (STEPS)

| # | ID | Título | Texto |
|---|----|--------|-------|
| 1 | `tour-header` | ¡Bienvenida a tu Centro de Control! 🎉 | Este es el panel donde administras tu evento. Te voy a mostrar lo más importante en menos de un minuto. |
| 2 | `tour-btn-ver` | Ver tu invitación | Abre tu invitación digital tal como la verán tus invitados. |
| 3 | `tour-btn-stats` | Estadísticas | Mira cuántas veces se ha abierto tu invitación y cuántas confirmaciones llevas. |
| 4 | `tour-btn-plan` | Tu plan actual | Aquí ves el plan que tienes contratado y las funciones que incluye. |
| 5 | `tour-countdown` | Cuenta regresiva | Te mantendremos al tanto de cuántos días faltan para tu gran momento. |
| 6 | `tour-stats-row` | Resumen de confirmaciones | Aquí verás de un vistazo cuántos confirmaron, cuántos faltan y el total de personas que asistirán. |
| 7 | `tour-tabla-confirmados` | Lista de confirmaciones | Cada vez que un invitado confirme, aparecerá automáticamente en esta lista. |
| 8 | `tour-btn-qr` | Código QR | Descarga un QR de tu invitación para imprimirlo en save-the-dates o mostrarlo donde quieras. |
| 9 | `tour-mis-invitados` | Mis invitados | Crea pases personalizados para cada familia. Envíales su invitación con su pase de acceso por WhatsApp. |
| 10 | `tour-btn-crear` | Crear un nuevo invitado | Agrega familias o personas individuales con nombre, teléfono y cantidad de pases. |
| 11 | `tour-tabs-filtro` | Filtra tus invitados | Encuentra rápido quién ya confirmó, quién falta o quién no tiene WhatsApp registrado. |
| 12 | `tour-acciones-fila` | Acciones por invitado | Por cada familia puedes ver su QR, enviar la invitación por WhatsApp, editar datos o eliminarla. |
| 13 | `tour-control-evento` | Control de acceso (día del evento) | Cerca del evento aparecerá aquí el botón para escanear los pases de tus invitados al entrar. |
| 14 | `centro-control-help-btn` | ¿Necesitas ayuda después? | Toca este botón en cualquier momento para volver a ver esta guía o consultar el manual. |

---

## 3. IDs requeridos en el DOM

| ID | Archivo | Ubicación | Phase visible |
|----|---------|-----------|---------------|
| `tour-header` | `page.tsx` | Wrapper del título "Mi invitación digital" | Todas |
| `tour-btn-ver` | `page.tsx` | Pill "Ver invitación" en header | Todas (si `publicUrl`) |
| `tour-btn-stats` | `page.tsx` | Pill "Estadísticas" en header | Todas |
| `tour-btn-plan` | `page.tsx` | Pill "Plan X" en header | Todas |
| `tour-countdown` | `page.tsx` | Banner "Faltan N días" / "Hoy es tu gran día" | `lista`, `confirmaciones`, `semana`, `dia` |
| `tour-stats-row` | `page.tsx` | Grid de 4 StatCard | `confirmaciones`, `semana`, `dia` |
| `tour-tabla-confirmados` | `page.tsx` | Tabla/cards de RSVP | `confirmaciones`, `semana`, `dia` |
| `tour-btn-qr` | `page.tsx` | Botón "Ver código QR" del header de tabla | `confirmaciones`, `semana`, `dia` |
| `tour-mis-invitados` | `page.tsx` | Wrapper de `<GuestPassSection>` | `confirmaciones`, `semana`, `dia`, `passes_only` |
| `tour-btn-crear` | `GuestPassSection.tsx` | Botón "+ Crear invitado" en fila de filtros | Mismo que `tour-mis-invitados` |
| `tour-tabs-filtro` | `GuestPassSection.tsx` | Contenedor de chips Todas/Pendientes/Confirmados/Sin WhatsApp | Mismo |
| `tour-acciones-fila` | `GuestPassSection.tsx` | Celda de acciones de la **primera fila** de la tabla | Mismo (si hay ≥1 invitado) |
| `tour-control-evento` | `page.tsx` | Bloque "CONTROL DEL EVENTO" con botón scanner | `semana`, `dia` |
| `centro-control-help-btn` | `CentroControlHelpButton.tsx` | Botón flotante `?` en nav | Todas |

---

## 4. Comportamiento

Auto-trigger en primer acceso vía `localStorage`:
- key: `kompralo_centro_control_tour_done`
- delay: 800ms
- al completar/saltar: `setItem('1')`

Re-trigger manual (desde modal de ayuda):
```ts
window.dispatchEvent(new Event('kompralo:centro-control-tour-open'))
```

Filtrado por phase: el tour filtra STEPS por `document.getElementById(s.id)`. IDs ausentes se omiten silenciosamente.

---

## 5. Cómo actualizar

1. Actualiza tabla del punto 2 o 3
2. Genera prompt para Claude Code con plantilla del paso 6
3. Verifica visualmente
4. Commitea spec + código juntos

---

## 6. Plantilla de prompt para actualizar

```

ACTUALIZAR MiEventoTour según docs/MIEVENTO_TOUR_SPEC.md

Lee:
- docs/MIEVENTO_TOUR_SPEC.md
- src/app/cliente/invitaciones/[id]/MiEventoTour.tsx

CAMBIOS:
[describir qué cambió respecto al spec]

NO tocar: localStorage, HelpHint, filtro
document.getElementById, InvitationRenderer, Hero,
SaveManager, Registry, Stripe, schema, rutas públicas.

npx tsc --noEmit && npm run build && push a main

```

---

## 7. Historial

| Fecha | Cambio |
|-------|--------|
| 2026-06-28 | Versión inicial — 14 STEPS + IDs faltantes |
