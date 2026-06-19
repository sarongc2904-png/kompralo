# KOMPRALO — Launch Checklist

Verifica cada punto antes de anunciar el lanzamiento.
Sigue `docs/PRODUCTION_DEPLOY.md` para instrucciones detalladas.

---

## Supabase

- [ ] Schema `supabase/schema.sql` aplicado sin errores
- [ ] `supabase/orders.sql` aplicado
- [ ] `supabase/orders_7y4_email_patch.sql` aplicado
- [ ] `supabase/invitations_7y6_auto_create_patch.sql` aplicado
- [ ] `supabase/qa_7y7_missing_columns_patch.sql` aplicado (verificación final)
- [ ] `supabase/auth_7b_customer_access_patch.sql` aplicado (verifica `customer_email`)
- [ ] Tabla `orders` visible en Table Editor
- [ ] Tabla `invitations` tiene columna `customer_email` y `user_id` nullable
- [ ] Bucket `invitations` creado en Storage
- [ ] Políticas de Storage configuradas
- [ ] Auth: Email Provider habilitado en Authentication → Providers → Email
- [ ] Auth: Site URL configurada en Authentication → URL Configuration
- [ ] Auth: `/auth/callback` en Redirect URLs allowlist

---

## Variables de entorno

- [ ] `NEXT_PUBLIC_APP_URL` apunta al dominio de producción (`https://`)
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configurada
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configurada (solo servidor)
- [ ] `STRIPE_SECRET_KEY` configurada con key `STRIPE_LIVE_SECRET_KEY_PREFIX...`
- [ ] `STRIPE_WEBHOOK_SECRET` configurada con `STRIPE_WEBHOOK_SECRET_PREFIX...`
- [ ] `RESEND_API_KEY` configurada
- [ ] `ADMIN_ACCESS_ENABLED=false` — con auth magic link activo (FASE 7B), debe ser `false` en producción
- [ ] `RESEND_FROM_EMAIL` configurada con dominio verificado
- [ ] `.env.local` NO está en el repositorio

---

## Stripe

- [ ] Cuenta Stripe en modo live
- [ ] Webhook endpoint creado: `https://tudominio.com/api/webhook/stripe`
- [ ] Eventos configurados: `checkout.session.completed`, `checkout.session.expired`, `payment_intent.payment_failed`
- [ ] Signing secret copiado como `STRIPE_WEBHOOK_SECRET`

---

## Resend

- [ ] Dominio verificado en Resend
- [ ] Registros DNS (TXT, DKIM) propagados
- [ ] Email de prueba enviado y recibido desde el dominio verificado

---

## Build y deploy

- [ ] `npm run build` pasa sin errores
- [ ] `npx tsc --noEmit` pasa sin errores
- [ ] `npm run lint` — 0 errores (warnings de baseline aceptados)
- [ ] Deploy completado en hosting
- [ ] Dominio apunta correctamente al hosting

---

## Flujo de compra — prueba funcional

Ejecuta este flujo completo con tarjeta de prueba Stripe (`4242 4242 4242 4242`):

- [ ] `/invitaciones/precios` carga correctamente
- [ ] Botón **Comprar** lanza checkout de Stripe
- [ ] Pago de prueba completa sin errores
- [ ] Stripe redirige a `/checkout/success?session_id=...`
- [ ] Success page muestra: plan, monto, botón Editar invitación
- [ ] En Supabase: orden existe con `status = 'paid'`
- [ ] En Supabase: invitación existe con `status = 'paid'`
- [ ] En Supabase: `orders.invitation_id` está lleno
- [ ] Email de confirmación recibido con link a dashboard

---

## Dashboard y edición

- [ ] Link del email abre `/dashboard/invitations/{id}/edit`
- [ ] Dashboard carga la invitación sin errores
- [ ] Se puede editar el título y guardar
- [ ] Se puede subir una imagen (hero, gallery, protagonistas)
- [ ] Preview live (`/preview/{id}`) carga la invitación

---

## Flujo cliente

- [ ] `/cliente?email=...` muestra órdenes por email
- [ ] Cada orden muestra plan, estado, precio, fecha
- [ ] Botón **Editar invitación** activo cuando existe `invitationId`
- [ ] Email de confirmación estado correcto (enviado / pendiente)

---

## Idempotencia y seguridad

- [ ] Reenviar el mismo evento desde Stripe Dashboard no duplica la orden
- [ ] Reenviar el mismo evento no crea una segunda invitación
- [ ] Reenviar el mismo evento no envía un segundo email
- [ ] Los logs del servidor no contienen API keys

---

## Prueba de compra real

- [ ] Compra real completada con tarjeta física (monto mínimo)
- [ ] Orden aparece en Stripe Dashboard en modo live
- [ ] Email recibido en cuenta real
- [ ] Reembolso procesado desde Stripe Dashboard (opcional, post-verificación)

---

## Lanzamiento

- [ ] Todas las casillas anteriores marcadas
- [ ] Dominio público accesible
- [ ] `/invitaciones/precios` publicado

**Fecha de lanzamiento:** _______________

**Responsable:** _______________
