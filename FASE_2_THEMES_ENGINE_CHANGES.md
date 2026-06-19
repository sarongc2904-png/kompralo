# Fase 2 - Themes Engine

Registro operativo de cambios para coordinar esta fase con otros programas.

## Cambios

- Inicio de Fase 2: se creara un Themes Engine tipado sin redisenar la invitacion.
- Creado contrato base en `src/domain/themes/types.ts`.
- Creados temas `champagne`, `floral`, `modern` y `azure` en `src/domain/themes/themes`.
- Creado registry en `src/domain/themes/registry.ts` con fallback a `champagne`.
- Se usaran variables CSS y un bloque de clases legacy explicitas para evitar clases Tailwind dinamicas.
- `src/config/invitation.config.ts` ahora queda enfocado en la invitacion y declara `themeId: "champagne"`.
- `src/app/page.tsx` resuelve temas desde `src/domain/themes/registry.ts` y aplica variables CSS en el contenedor raiz.
- Migrados tokens principales en `MultilayerBackground`, `RSVPForm`, `StoryBook`, `Countdown` y `Location`.

## Fase 3 - Feature Flags por plan

- Creado contrato de planes en `src/domain/plans/types.ts`.
- Creada matriz centralizada de features en `src/domain/plans/features.ts`.
- Creado registry de planes en `src/domain/plans/registry.ts` con fallback a `platinum`.
- Agregado `planId: "platinum"` y `featureOverrides` preparado en la invitacion actual.
- Creado `InvitationSectionGate` y adaptado `FeatureGate` para delegar en ese gate.
- `page.tsx` ahora resuelve `plan`, `features` y aplica gates por seccion publica.

## Fase 4 A - Renderer y UI base

- Creado `InvitationRenderer.tsx` para mover la composicion de la invitacion fuera de `page.tsx`.
- Creado `SectionHeader.tsx`.
- Creado `SectionShell.tsx`.
- Creado `LiquidCard.tsx`.
- Creado `ActionButton.tsx`.
- Creado `ResponsiveImage.tsx`.
- `src/app/page.tsx` ahora solo renderiza `InvitationRenderer` con `invitationConfig`.
- No se modificaron componentes internos de seccion en esta fase.

## Fase 4 B - Adopcion gradual de UI reutilizable

- `Location.tsx` usa `SectionShell` y `SectionHeader`.
- `Itinerary.tsx` usa `SectionShell` y `SectionHeader`.
- `GiftRegistry.tsx` usa `SectionShell` y `SectionHeader`, conservando su texto descriptivo visible.
- `Hospedaje.tsx` usa `SectionShell`; su header custom se mantiene por el divisor con icono.
- `RSVPForm.tsx` usa `SectionShell` y `LiquidCard` para la tarjeta principal, preservando animaciones internas.
- No se toco `HorizontalGallery.tsx` por dependencia de GSAP, IntersectionObserver y transiciones de imagen.

## Fase 4 C - Stabilization Before SaaS Routes

- `InvitationRenderer.tsx` queda sin selectores internos de plan/theme y recibe `invitation`, `theme`, `plan`, `features` y `mode`.
- Creado `src/components/invitation/dev/InvitationDevToolbar.tsx` para aislar controles de demo/local.
- `src/app/page.tsx` resuelve plan, theme y features para la demo local y monta el toolbar fuera del renderer.
- Eliminado el campo duplicado `plan`; `planId` queda como fuente de verdad.
- `themeId` queda tipado con `ThemeId`.
- `invitation.config.ts` usa `satisfies InvitationContent` y ya no depende de casts en `page.tsx`.
- Corregida la consistencia de `Sofía` en el fixture y verificado que no quedan patrones de mojibake en el fixture.
- Migrados imports seguros de tipos legacy desde `config` hacia `domain`.
- Features sin UI real quedan como placeholders no visibles dentro del renderer: QR, WhatsApp standalone, Guestbook y Messages.

## Fase 5 B - Routing dinamico limpio con repository local

- Eliminadas las rutas estaticas exactas `src/app/i/sofia-y-alejandro/page.tsx` y `src/app/preview/demo/page.tsx`.
- `src/app/i/[slug]/page.tsx` queda como Server Component ligero: resuelve params, consulta repository local, valida status, resuelve plan/theme/features y usa `notFound()`.
- `src/app/preview/[id]/page.tsx` queda como Server Component ligero con el mismo flujo para preview.
- `InvitationRouteRenderer.tsx` queda como unico wrapper cliente para rutas publicas/preview y recibe `invitation`, `theme`, `plan` y `features` ya resueltos.
- Se elimino la dependencia de `generateStaticParams()` para evitar acoplamiento al prerender manifest corrupto de dev y permitir resolucion request-time desde fixtures locales.
- Verificadas rutas dinamicas: `/i/sofia-y-alejandro`, `/preview/demo`, `/preview/wedding-sofia-alejandro`, y 404 seguro para inexistentes.
