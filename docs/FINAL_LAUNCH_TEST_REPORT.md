# KOMPRALO - Final Launch Test Report

Fecha: 2026-06-18

## Resumen

Esta prueba final valido el estado local del SaaS KOMPRALO antes de lanzamiento.

Resultado: **No listo para vender en produccion todavia**.

Motivo principal: el build local pasa, las rutas base responden y no se detectaron secrets reales en codigo fuente, pero el flujo real de pago no fue probado contra Stripe + Supabase + Resend en un deployment con variables reales. Ademas, se detectaron riesgos pendientes que deben resolverse o verificarse antes de aceptar ventas reales.

## Ambiente

| Campo | Resultado |
|---|---|
| Ambiente probado | Local |
| URL probada | `http://127.0.0.1:3003` |
| Dominio produccion | Pendiente |
| Modo Stripe | No probado contra Stripe real/test dashboard |
| Modo IA | Local, `ASSISTANT_AI_ENABLED=false` |
| Planes probados | Verificacion estatica de Basic, Premium, Deluxe |
| Dispositivo usado | Validacion HTTP local + QA mobile previa en Chrome headless |

## Validacion tecnica local

| Check | Resultado |
|---|---|
| `npx.cmd --no-install tsc --noEmit` | OK |
| `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run lint` | OK, 10 warnings preexistentes |
| `npm.cmd --prefix "D:\josed\Descargas\invitacion maestra" run build` | OK |

Warnings no bloqueantes detectados en build:

- Convencion `middleware` deprecated en Next 16; migrar a `proxy` despues.
- `src/app/api/webhook/stripe/route.ts` exporta `config`, deprecated/ignored en App Router. El webhook usa `request.arrayBuffer()`, por lo que no se modifico en esta fase.
- Build local corrio sin Supabase env y uso fallbacks locales.

## Variables y secretos

### `.env.example`

Corregido durante esta fase:

- `NEXT_PUBLIC_APP_URL=` quedo sin valor real.
- `ADMIN_ACCESS_ENABLED=false` quedo como default seguro.

Variables esperadas presentes:

- `NEXT_PUBLIC_APP_URL`
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `RESEND_API_KEY`
- `RESEND_FROM_EMAIL`
- `OPENAI_API_KEY`
- `ASSISTANT_AI_ENABLED`
- `NEXT_PUBLIC_VIRTUAL_ASSISTANT_ENABLED`
- `NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED`
- `DASHBOARD_ASSISTANT_ALLOWED_PLANS`
- `ADMIN_ACCESS_ENABLED`

### `.gitignore`

Confirmado:

- `.env*` esta ignorado.
- `.env.local` queda cubierto.
- `.env.production` queda cubierto.

### Secret scan

Escaneo redaccionado sin imprimir valores:

- No se encontraron secrets reales tipo `STRIPE_LIVE_SECRET_KEY_PREFIX`, `STRIPE_TEST_SECRET_KEY_PREFIX`, `STRIPE_LIVE_PUBLISHABLE_KEY_PREFIX`, `STRIPE_TEST_PUBLISHABLE_KEY_PREFIX`, `STRIPE_WEBHOOK_SECRET_PREFIX`, Resend real, OpenAI real ni service role real en codigo fuente.
- Se detectaron solo placeholders documentales:
  - `docs/SUPABASE_SETUP.md`: `SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key`
  - `docs/VIRTUAL_ASSISTANT.md`: `OPENAI_API_KEY=<server-only-key>`

## Supabase

Archivos SQL locales presentes:

1. `supabase/orders.sql`
2. `supabase/orders_7y4_email_patch.sql`
3. `supabase/invitations_7y6_auto_create_patch.sql`
4. `supabase/qa_7y7_missing_columns_patch.sql`
5. `supabase/auth_7b_customer_access_patch.sql`

Tablas esperadas detectadas en SQL local:

- `invitations`
- `invitation_content`
- `rsvp_responses`
- `orders`

Columnas importantes detectadas en SQL local:

- `orders.invitation_id`
- `orders.plan_id`
- `orders.customer_email`
- `orders.customer_name`
- `orders.stripe_session_id`
- `orders.status`
- `orders.amount_total`
- `orders.currency`
- `orders.confirmation_email_sent_at`
- `orders.confirmation_email_error`
- `invitations.plan_id`
- `invitations.status`
- `invitations.customer_email`
- `invitation_content.invitation_id`

Pendiente obligatorio:

- Confirmar en Supabase real que los SQL fueron aplicados en ese orden.
- Confirmar Storage bucket `invitations`.
- Confirmar folders y politicas de upload para:
  - `hero`
  - `gallery`
  - `storybook`
  - `protagonists`
  - `hotels`
  - `final-message`
- Confirmar Auth Email provider, Site URL y Redirect URLs.

## Stripe

Verificacion estatica:

- `/api/checkout` valida `productId`.
- Planes detectados:
  - Basic: `$499 MXN`
  - Premium: `$899 MXN`
  - Deluxe: `$1499 MXN`
- Checkout metadata incluye:
  - `productId`
  - `planId`
  - `invitationId` opcional
- Webhook maneja `checkout.session.completed`.
- Webhook usa firma con `STRIPE_WEBHOOK_SECRET`.
- Webhook crea o reutiliza `orders` por `stripe_session_id`.
- Webhook crea invitacion automaticamente si no hay `invitationId`.
- Email post-pago tiene guard por `confirmation_email_sent_at`.

Pendiente obligatorio:

- Ejecutar compra real/test desde Stripe Checkout.
- Confirmar que el webhook productivo usa el `STRIPE_WEBHOOK_SECRET` correcto.
- Reenviar evento desde Stripe Dashboard para validar idempotencia real.

## Resend

Verificacion estatica:

- `sendOrderConfirmationEmail` usa Resend server-side.
- `RESEND_FROM_EMAIL` se resuelve desde config server-side.
- El envio se captura en webhook sin romper Stripe si Resend falla.

Pendiente obligatorio:

- Confirmar dominio verificado en Resend.
- Confirmar `RESEND_FROM_EMAIL` verificado.
- Confirmar entrega real de email post-pago.

## Magic Link y Auth

Verificacion estatica:

- `/auth/callback` sanitiza `redirect`: solo permite rutas relativas que empiezan con `/` y no `//`.
- `/dashboard` requiere sesion cuando `ADMIN_ACCESS_ENABLED=false`.
- `/dashboard/invitations/[id]/edit` valida `customerEmail` contra email de sesion cuando no esta en admin mode.
- `/cliente` requiere sesion cuando `ADMIN_ACCESS_ENABLED=false`.
- `/cliente?email=...` queda deshabilitado en produccion; el query param solo funciona en admin/dev con `ADMIN_ACCESS_ENABLED=true`.
- Con sesion autenticada, `/cliente` usa solo `session.user.email` e ignora cualquier email de la URL.

## Dashboard movil

Estado:

- Fase mobile fix aplicada antes de este reporte.
- QA previa en 375px, 390px y 430px: sin overflow horizontal.
- Sidebar mobile cerrado por defecto.
- Drawer mobile abre sin comprimir el editor.
- Inputs principales usables.

Pendiente:

- Repetir prueba desde celular real en deployment productivo.
- Confirmar que `Guardar` persiste contra Supabase real.

## Asistente publico

Prueba local ejecutada:

`POST /api/assistant` con mensaje `cuanto cuesta` en `/invitaciones/precios`.

Resultado:

- HTTP 200
- `source: "local-rules"`
- Respuesta de precios correcta.

Pendiente:

- Validar visibilidad exacta por rutas en navegador real de produccion.
- Validar IA con `ASSISTANT_AI_ENABLED=true` y `OPENAI_API_KEY` real si se desea activar.

## Dashboard Assistant

Verificacion estatica:

- `NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED` controla visibilidad cliente.
- `DASHBOARD_ASSISTANT_ALLOWED_PLANS` se evalua server-side.
- Aliases:
  - `gold` -> `premium` (solo alias heredado de lectura)
  - `platinum` -> `deluxe` (solo alias heredado de lectura)
- El editor pasa solo props seguras: `enabledByEnv`, `enabledForPlan`, `eventType`.
- La llamada a `/api/assistant` no debe enviar `customerEmail` ni `invitationId`.

Pendiente:

- Validar desde navegador productivo con planes Basic, Premium y Deluxe reales.

## Rutas locales probadas

Servidor local: `http://127.0.0.1:3003`

| Ruta | Resultado |
|---|---|
| `/` | 200 |
| `/invitaciones/precios` | 200 |
| `/checkout/success?session_id=falso` | 200, error controlado |
| `/cliente` | Redirige a login en modo produccion sin sesion |
| `/login` | 200 |
| `/dashboard/invitations/wedding-sofia-alejandro/edit` | 200 en ambiente local/admin |
| `/api/assistant` | 200 |

## Bugs corregidos en esta fase

1. `.env.example` tenia defaults no seguros para launch.
   - `NEXT_PUBLIC_APP_URL=http://localhost:3000` fue cambiado a `NEXT_PUBLIC_APP_URL=`.
   - `ADMIN_ACCESS_ENABLED=true` fue cambiado a `ADMIN_ACCESS_ENABLED=false`.

2. `/cliente` podia consultar ordenes por `?email=` sin sesion.
   - Ahora, con `ADMIN_ACCESS_ENABLED=false`, redirige a `/login?redirect=/cliente` si no hay sesion.
   - Si hay sesion, usa solo `session.user.email`.
   - El fallback `?email=` queda limitado a admin/dev con `ADMIN_ACCESS_ENABLED=true`.

## Bugs pendientes

### Critico

1. E2E real no ejecutado.
   - No se puede confirmar compra completa, webhook, creacion de order/invitation/content, email, Magic Link e idempotencia sin Stripe/Supabase/Resend reales configurados.

2. Persistencia del editor debe verificarse con Supabase real.
   - El repository de invitaciones usa Supabase si existen `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`, pero cae a local si faltan.
   - Si Supabase falla, el fallback local puede ocultar problemas de persistencia.
   - Antes de vender, `Guardar` debe comprobarse contra tabla real.

### Alto

1. Server Actions del editor no repiten ownership check por accion.
   - La pagina valida propiedad, pero cada accion deberia validar sesion y ownership antes de escribir.

2. Logs del webhook incluyen email del cliente.
   - Reducir PII en logs antes de produccion amplia.

3. `export const config` en webhook esta deprecated/ignored.
   - No rompe build, pero debe limpiarse despues de verificar el webhook en Next 16.

### Medio

1. Migrar `middleware` a `proxy` por warning de Next 16.
2. Corregir warnings lint preexistentes.
3. Confirmar politicas RLS/storage con Supabase real.

## Resultado por area

| Area | Resultado |
|---|---|
| Build local | OK |
| Secrets en codigo | OK, sin secrets reales detectados |
| `.env.example` | Corregido |
| SQL local | Presente |
| Supabase real | Pendiente |
| Stripe real/test dashboard | Pendiente |
| Resend real | Pendiente |
| Magic Link real | Pendiente |
| Dashboard movil local | OK con QA previa |
| Guardado real | Pendiente |
| Asistente publico local | OK |
| Dashboard Assistant | Verificacion estatica OK, prueba real pendiente |
| Idempotencia real | Pendiente |

## Veredicto

**No listo para vender en produccion todavia.**

El proyecto esta cerca, pero no debe lanzarse hasta completar:

1. E2E real con Stripe test o live controlado.
2. Confirmacion de SQL aplicado en Supabase real.
3. Confirmacion de Storage/Auth/Redirect URLs en Supabase.
4. Confirmacion de email real por Resend.
5. Confirmacion de guardado persistente en dashboard.
6. Validacion de idempotencia reenviando webhook desde Stripe Dashboard.

Cuando esos puntos pasen, el veredicto puede cambiar a **Listo con observaciones** o **Listo para vender**.
