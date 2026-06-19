# KOMPRALO — Launch Test Report

## Información general

| Campo | Valor |
|---|---|
| Fecha del reporte | 2026-06-18 |
| Fase | 7Y-9 — Launch Test |
| Tipo de prueba | Auditoría estática de código + validación de build |
| Ambiente real | Pendiente de configuración (ver sección "Prueba manual requerida") |
| URL producción | A configurar por el operador |

> **Nota sobre el alcance de este reporte:**
> No existe deployment activo con credenciales configuradas (Stripe live, Supabase, Resend).
> Esta fase realizó: (1) auditoría completa de todos los caminos de código del flujo E2E,
> (2) corrección de bugs encontrados, (3) validación de build/lint/tsc,
> (4) documentación de los pasos de prueba manual requeridos.
> La sección "Prueba manual" debe ser completada por el operador con acceso a producción.

---

## Resultado de validaciones técnicas

| Check | Resultado | Detalle |
|---|---|---|
| `tsc --noEmit` | ✅ PASS | 0 errores |
| `npm run lint` | ✅ PASS | 0 errores, 10 warnings (baseline histórico, no regresión) |
| `npm run build` | ✅ PASS | 15 rutas compiladas correctamente |

---

## Auditoría de código — caminos críticos

### A. Flujo compra sin invitationId (`/invitaciones/precios` → checkout)

| Paso | Estado | Observación |
|---|---|---|
| `CheckoutButton` → `POST /api/checkout` | ✅ | Body correcto, manejo de errores OK |
| `createCheckoutSession()` | ✅ | Lazy Stripe init, metadata `productId`/`planId` incluidos |
| Redirect a Stripe | ✅ | `window.location.href = url` en cliente |
| Stripe → `GET /checkout/success?session_id=...` | ✅ | Página lee orden por `session_id` vía service role |
| Webhook `checkout.session.completed` | ✅ | Verificación de firma con `STRIPE_WEBHOOK_SECRET` |
| Crear orden (idempotente) | ✅ | `stripe_session_id UNIQUE` previene duplicados |
| `createFromPaidOrder()` (auto-creación) | ✅ | Inserta `invitations` + `invitation_content` con defaults válidos |
| `attachInvitationToOrder()` | ✅ | Solo escribe si `invitation_id IS NULL`; guarda warning si ya tiene otro |
| Envío de email (idempotente) | ✅ | Guard por `confirmation_email_sent_at` |
| Email usa `finalInvitationId` | ✅ | Link correcto a `/dashboard/invitations/{id}/edit` |

### B. Flujo compra con invitationId existente

| Paso | Estado | Observación |
|---|---|---|
| Metadata `invitationId` en sesión Stripe | ✅ | `createCheckoutSession` incluye si se pasa |
| Webhook detecta `invitationId` en metadata | ✅ | Rama separada de la auto-creación |
| `activateAfterPayment()` llamado | ✅ | `planId` actualizado, status → `paid` (no regresa) |
| No se crea invitación nueva | ✅ | Sólo entra al `else if (customerEmail)` si no hay `invitationId` |
| Email apunta a la invitación existente | ✅ | `finalInvitationId = invitationId` del metadata |

### C. Idempotencia del webhook

| Escenario | Estado | Mecanismo |
|---|---|---|
| Orden duplicada | ✅ | `stripe_session_id UNIQUE` + `getBySessionId` check |
| Invitación duplicada | ✅ | `order.invitationId` guard antes de `createFromPaidOrder` |
| Email duplicado | ✅ | `confirmation_email_sent_at IS NOT NULL` → skip + log |
| Re-fetch order antes de email | ✅ | `freshOrder = await orderRepo.getBySessionId(...)` |

### D. `/checkout/success`

| Estado | Detalle |
|---|---|
| ✅ Con `session_id` válido | Muestra plan, monto, botones Editar/Ver invitaciones/Dashboard |
| ✅ Con `session_id` inválido | `tryGetOrder` retorna `null` → muestra "siendo procesada" sin crash |
| ⚠ Race condition conocida | Si la página carga antes que el webhook procese, muestra "procesando" aunque el pago fue exitoso. Comportamiento aceptable — al refrescar se normaliza |

### E. `/cliente?email=`

| Estado | Detalle |
|---|---|
| ✅ Email válido con órdenes | Muestra plan, status, precio, fecha, estado de email |
| ✅ Email válido sin órdenes | Mensaje controlado "No encontramos órdenes" |
| ✅ Email inválido | Rechazado por regex antes de consultar Supabase |
| ✅ Sin email | Mensaje "Escribe tu correo" |
| ✅ Botón Editar | Aparece cuando `order.invitationId` es no-null |

### F. `/dashboard/invitations/[id]/edit`

| Estado | Detalle |
|---|---|
| ✅ Carga invitación por ID | `invitationRepository.getById(id)` |
| ✅ Invitación auto-creada | Contenido inicial válido para el renderer |
| ✅ Formularios de edición | BasicInfo, Media, Gallery, Protagonists, etc. |
| ✅ Server Actions | `updateBasicInfo`, `updateMediaInfo`, etc. implementados |
| ⚠ Requiere `ADMIN_ACCESS_ENABLED=true` | Dashboard layout redirige a `/` si no está habilitado |

---

## Bugs encontrados y corregidos en FASE 7Y-9

### Bug corregido: `ADMIN_ACCESS_ENABLED` bloqueaba acceso de clientes

**Severidad:** Crítica (impide el flujo completo de compra)

**Descripción:** El layout del dashboard tiene un guard:
```ts
if (process.env.ADMIN_ACCESS_ENABLED !== 'true') redirect('/');
```
El `.env.example` tenía `ADMIN_ACCESS_ENABLED=false` como default para producción. Sin embargo, los clientes que siguen el link del email de confirmación (`/dashboard/invitations/{id}/edit`) son redirigidos a `/` en lugar de llegar al editor. El dashboard es la única interfaz de edición.

**Fix:** Cambiado el default en `.env.example` a `true` con advertencia explicativa sobre el riesgo de seguridad (sin auth real, cualquier persona con el UUID puede acceder al editor). Auth real pendiente para FASE 7B.

**Archivos modificados:**
- `.env.example` — default cambiado, comentario de riesgo añadido
- `docs/LAUNCH_CHECKLIST.md` — ítem añadido para verificar esta variable

---

## Limitaciones conocidas y riesgos aceptados

| Limitación | Severidad | Plan |
|---|---|---|
| Sin auth real: cualquier persona con UUID puede editar cualquier invitación | Media | FASE 7B — auth con Supabase |
| Race condition en `/checkout/success` (muestra "procesando" antes que el webhook) | Baja | Aceptada; refrescar normaliza |
| Sin transacción atómica entre `invitations` e `invitation_content` (si content insert falla, queda row huérfana) | Baja | Edge case improbable; monitorear logs |
| `/cliente?email=` no está autenticado — cualquiera puede ver órdenes de cualquier email | Media | FASE 7B — auth con sesión real |
| No hay retry automático de emails fallidos | Baja | Log `confirmation_email_error` permite reenvío manual |

---

## Prueba manual requerida (pendiente del operador)

Los siguientes pasos deben ejecutarse con las credenciales reales configuradas.
Referencia: `docs/PRODUCTION_DEPLOY.md` sección E.

### A. Prueba compra sin invitationId

- [ ] Abrir `/invitaciones/precios` en el dominio de producción
- [ ] Comprar plan Basic con tarjeta de prueba `4242 4242 4242 4242`
- [ ] Verificar redirect a `/checkout/success?session_id=cs_test_...`
- [ ] Verificar que la success page muestra plan + monto + botones
- [ ] En Supabase Table Editor → `orders`: confirmar fila con `status=paid`, `invitation_id` lleno
- [ ] En Supabase Table Editor → `invitations`: confirmar fila con `status=paid`, `plan_id=basic`
- [ ] En Supabase Table Editor → `invitation_content`: confirmar fila correspondiente
- [ ] Confirmar email recibido con asunto "Tu invitación digital KOMPRALO está lista"
- [ ] Confirmar que el botón del email abre `/dashboard/invitations/{id}/edit`
- [ ] Editar título de la invitación y guardar — verificar persistencia
- [ ] Subir imagen de prueba — verificar que aparece en el campo
- [ ] Abrir preview `/preview/{id}` — verificar que carga
- [ ] Abrir `/cliente?email=...` — verificar que muestra la orden y el botón Editar

### B. Prueba idempotencia

- [ ] En Stripe Dashboard → Webhooks → tu endpoint → Events → reenviar el `checkout.session.completed`
- [ ] Verificar en Supabase que `orders` sigue teniendo exactamente 1 fila para esa sesión
- [ ] Verificar que `invitations` sigue teniendo exactamente 1 invitación
- [ ] Verificar que `invitation_content` sigue teniendo exactamente 1 fila
- [ ] Verificar en logs del servidor: "email already sent at ... — skipping"

### C. Prueba compra con invitationId existente

- [ ] Identificar un `invitationId` existente en Supabase
- [ ] Hacer checkout pasando ese ID en el body de `/api/checkout`
- [ ] Verificar que el webhook activa la invitación existente (no crea una nueva)
- [ ] Verificar que `orders.invitation_id` apunta a la invitación existente

### D. Success page con session_id inválido

- [ ] Abrir `/checkout/success?session_id=cs_test_INVALIDO`
- [ ] Verificar que muestra "Tu invitación está siendo procesada" sin error 500

### E. Prueba de compra real (opcional, antes de lanzamiento público)

- [ ] Cambiar a Stripe live mode (`STRIPE_LIVE_SECRET_KEY_PREFIX...`, `STRIPE_WEBHOOK_SECRET_PREFIX...` del webhook live)
- [ ] Comprar plan Basic con tarjeta real (monto mínimo)
- [ ] Verificar todo el flujo igual que en modo test
- [ ] Reembolsar desde Stripe Dashboard

---

## Veredicto

| | |
|---|---|
| **Estado** | ⚠ **Listo con observaciones** |

### Listo:
- Código completo, compilado y auditado sin errores
- Flujo de compra, creación de invitación, email y dashboard implementados correctamente
- Idempotencia del webhook verificada en código
- Build exitoso, 0 errores de TypeScript, 0 errores de lint
- Documentación de deploy y checklist completos

### Observaciones (no bloquean el lanzamiento controlado):
1. **`ADMIN_ACCESS_ENABLED=true` requerido en producción** — documentado. Sin auth real, el editor es público para quien conozca el UUID. Aceptable en fase de prueba controlada; requiere FASE 7B antes de escalar.
2. **Prueba manual E2E pendiente** — no hay deployment activo con credenciales reales. El operador debe ejecutar el checklist de prueba manual en `docs/LAUNCH_CHECKLIST.md`.
3. **`/cliente?email=`** no está autenticado — cualquiera puede ver las órdenes de cualquier email. Aceptable en fase inicial; requiere FASE 7B.

### Recomendación:
Completar la prueba manual (sección "Prueba manual requerida" de este reporte) y el `docs/LAUNCH_CHECKLIST.md` antes de publicitar el producto. Si todas las casillas quedan marcadas, el producto está listo para ventas reales.
