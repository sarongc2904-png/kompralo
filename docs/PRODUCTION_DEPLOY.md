# KOMPRALO — Guía de Deploy a Producción

Esta guía cubre el setup completo desde cero: Supabase, Stripe, Resend y hosting.
Sigue los pasos en orden.

---

## Prerequisitos

- Cuenta en [Supabase](https://supabase.com) (gratuita para empezar)
- Cuenta en [Stripe](https://stripe.com) con modo live habilitado
- Cuenta en [Resend](https://resend.com) con dominio verificado
- Hosting con soporte Node.js (Vercel, Railway, Hostinger VPS, etc.)
- Dominio configurado y apuntando al hosting

---

## A. Supabase

### A1. Crear el proyecto

1. Ve a [supabase.com](https://supabase.com) → **New project**.
2. Nombre sugerido: `kompralo`.
3. Región: `South America (São Paulo)` — más cercana a México.
4. Guarda la contraseña de base de datos en un gestor de contraseñas.
5. Espera ~2 minutos a que el proyecto inicie.

### A2. Obtener credenciales

**Settings → API**

| Variable | Dónde |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon public" |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" ⚠ solo servidor |

### A3. Aplicar el schema SQL

En **SQL Editor → New query**, ejecuta los archivos en este orden exacto.
Espera que cada uno termine sin errores antes de ejecutar el siguiente.

**Paso 1 — Schema base**
```
supabase/schema.sql
```
Crea las tablas: `users`, `invitations`, `invitation_content`, `invitation_versions`, `rsvp_responses`, etc.

**Paso 2 — Tabla orders**
```
supabase/orders.sql
```
Crea la tabla `orders` con RLS, índices y trigger `updated_at`.

**Paso 3 — Columnas de tracking de email**
```
supabase/orders_7y4_email_patch.sql
```
Añade `confirmation_email_sent_at` y `confirmation_email_error` a `orders`.

**Paso 4 — Soporte de invitaciones auto-creadas**
```
supabase/invitations_7y6_auto_create_patch.sql
```
Hace `user_id` nullable en `invitations` y añade `customer_email`.

**Paso 5 — Verificación de columnas (QA)**
```
supabase/qa_7y7_missing_columns_patch.sql
```
Patch idempotente que confirma o añade cualquier columna faltante.
Puedes ejecutarlo varias veces sin riesgo.

**Paso 6 — Verificación de columna customer_email (auth)**
```
supabase/auth_7b_customer_access_patch.sql
```
Confirma que `invitations.customer_email` existe (necesario para ownership check).
Idempotente — puedes ejecutarlo aunque ya hayas aplicado el paso 4.

### A4. Verificar tablas

En **Table Editor** deben aparecer:

- `users`
- `invitations`
- `invitation_content`
- `invitation_versions`
- `rsvp_responses`
- `orders`

### A5. Crear el Storage bucket

1. Ve a **Storage → New bucket**.
2. Nombre: `invitations`.
3. **Public**: desactivado (el acceso se controla via políticas).

Verifica que el bucket exista. Las sub-carpetas se crean automáticamente al subir la primera imagen:

- `hero/`
- `gallery/`
- `storybook/`
- `protagonists/`
- `hotels/`
- `final-message/`

### A6. Configurar Storage RLS

En **Storage → Policies**, añade las siguientes políticas para el bucket `invitations`:

**SELECT (lectura pública de imágenes publicadas):**
```sql
-- Permite leer cualquier objeto del bucket (las URLs son "secretas" por diseño)
true
```

**INSERT (subida desde cliente autenticado o service role):**
```sql
-- Solo service role (webhook) y usuarios autenticados
auth.role() = 'service_role' OR auth.role() = 'authenticated'
```

> Si en desarrollo usas el cliente del navegador con `createBrowserSupabaseClient()`, ajusta la política según tu flujo de auth actual.

---

## A7. Configurar Supabase Auth (magic link)

Necesario para que los clientes accedan al editor de forma segura (FASE 7B).

### A7.1 Habilitar Email Provider

1. Ve a **Authentication → Providers → Email**.
2. Activa **Enable Email Provider**.
3. Desactiva "Confirm email" (no necesario para magic link).

### A7.2 Configurar URLs

1. Ve a **Authentication → URL Configuration**.
2. **Site URL:** `https://tudominio.com`
3. **Redirect URLs:** añade `https://tudominio.com/auth/callback`

### A7.3 (Recomendado) SMTP personalizado

El free tier de Supabase tiene límite de 3 emails/hora. Para producción:
1. Ve a **Authentication → SMTP Settings**.
2. Configura tu proveedor SMTP (Resend, SendGrid, Postmark, etc.).
3. Usa el mismo dominio verificado en Resend si es posible.

> Ver `docs/AUTH_CLIENT_ACCESS.md` para instrucciones completas y troubleshooting.

---

## B. Stripe

### B1. Activar cuenta live

1. Completa el onboarding de Stripe (datos fiscales, cuenta bancaria).
2. Activa **Live mode** (no Test mode) para cobros reales.

### B2. Obtener Secret Key

1. **Developers → API keys**.
2. Copia la `STRIPE_LIVE_SECRET_KEY_PREFIX...` → guárdala como `STRIPE_SECRET_KEY`.

> En desarrollo usa `STRIPE_TEST_SECRET_KEY_PREFIX...`. Los productos y webhooks son independientes por modo.

### B3. Configurar el Webhook

1. Ve a **Developers → Webhooks → Add endpoint**.
2. URL del endpoint:
   ```
   https://tudominio.com/api/webhook/stripe
   ```
3. Eventos a escuchar (selecciona exactamente estos):
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
4. Haz clic en **Add endpoint**.
5. En la página del endpoint, copia el **Signing secret** (`STRIPE_WEBHOOK_SECRET_PREFIX...`) → guárdalo como `STRIPE_WEBHOOK_SECRET`.

### B4. Probar con Stripe CLI (desarrollo local)

```bash
# Instalar Stripe CLI
# https://stripe.com/docs/stripe-cli

stripe login
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

El CLI imprime un `STRIPE_WEBHOOK_SECRET_PREFIX...` local — úsalo como `STRIPE_WEBHOOK_SECRET` en `.env.local`.

---

## C. Resend

### C1. Crear API Key

1. Ve a [resend.com](https://resend.com) → **API Keys → Create API Key**.
2. Nombre sugerido: `kompralo-production`.
3. Permiso: **Full access** (necesita poder enviar emails).
4. Copia el valor → guárdalo como `RESEND_API_KEY`.

### C2. Verificar dominio

1. **Domains → Add Domain** → ingresa tu dominio (ej: `kompralo.mx`).
2. Añade los registros DNS indicados (TXT, DKIM, MX) en tu proveedor de dominio.
3. Espera la verificación (puede tardar hasta 48h, generalmente menos de 1h).
4. Una vez verificado, configura el remitente:
   ```
   RESEND_FROM_EMAIL=KOMPRALO <hola@kompralo.mx>
   ```

> Si no tienes dominio propio verificado aún, en desarrollo puedes usar `onboarding@resend.dev` — solo funciona para envíos a tu propio email registrado en Resend.

---

## D. Hosting (Vercel / Railway / Hostinger VPS)

### D1. Variables de entorno

Configura todas las variables de `.env.example` en el panel de tu hosting.
**Nunca subas `.env.local` al repositorio.**

Variables requeridas en producción:

| Variable | Visibilidad | Dónde obtenerla |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | Pública | Tu dominio (`https://tudominio.com`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Pública | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Pública | Supabase → Settings → API |
| `SUPABASE_SERVICE_ROLE_KEY` | **Privada** | Supabase → Settings → API |
| `STRIPE_SECRET_KEY` | **Privada** | Stripe → Developers → API keys |
| `STRIPE_WEBHOOK_SECRET` | **Privada** | Stripe → Webhooks → endpoint |
| `RESEND_API_KEY` | **Privada** | Resend → API Keys |
| `RESEND_FROM_EMAIL` | Privada | Tú defines el valor |

### D2. Deploy en Vercel

```bash
# Instalar Vercel CLI (opcional)
npm i -g vercel

# Deploy
vercel --prod
```

O conecta el repositorio en [vercel.com](https://vercel.com) → **New Project** → importa el repo → configura variables → **Deploy**.

### D3. Deploy en Railway

1. Conecta el repositorio en [railway.app](https://railway.app).
2. Agrega las variables de entorno en **Variables**.
3. Railway detecta Next.js automáticamente y ejecuta `npm run build && npm start`.

### D4. Hostinger VPS

```bash
# Clonar repo
git clone <tu-repo> /var/www/kompralo
cd /var/www/kompralo

# Instalar dependencias
npm ci

# Configurar variables (crea .env.local con los valores reales)
# NO uses .env.example — ese archivo no tiene valores reales

# Build
npm run build

# Iniciar con PM2
npm install -g pm2
pm2 start npm --name "kompralo" -- start
pm2 save
pm2 startup
```

Configura Nginx como reverse proxy hacia el puerto 3000.

### D5. Verificar dominio

Asegúrate de que `NEXT_PUBLIC_APP_URL` coincide exactamente con el dominio en producción (con `https://`).
Este valor se usa para construir:
- URLs de success/cancel en Stripe checkout
- Links en emails de Resend

---

## E. Prueba final post-deploy

Ejecuta este flujo completo antes de anunciar el lanzamiento:

### E1. Prueba de compra en modo test (Stripe test mode)

> Usa las keys `STRIPE_TEST_SECRET_KEY_PREFIX...` y `STRIPE_TEST_PUBLISHABLE_KEY_PREFIX...` y una tarjeta de prueba.

1. Ve a `https://tudominio.com/invitaciones/precios`.
2. Haz clic en **Comprar** en el plan Basic.
3. En el formulario de Stripe:
   - Tarjeta: `4242 4242 4242 4242`
   - Fecha: cualquier fecha futura
   - CVC: cualquier 3 dígitos
   - Email: tu email real (para recibir el correo de confirmación)
4. Completa el pago.

### E2. Verificar en Supabase

En **Table Editor → orders**:
- Debe aparecer una fila con `status = 'paid'`
- `customer_email` debe tener tu email
- `invitation_id` debe estar lleno (auto-creada)

En **Table Editor → invitations**:
- Debe aparecer una fila con `status = 'paid'`
- `plan_id = 'basic'`
- `customer_email` debe tener tu email

En **Table Editor → invitation_content**:
- Debe aparecer una fila con el `invitation_id` correspondiente

### E3. Verificar email

- Debes recibir un email de confirmación en la dirección que usaste en el checkout.
- El email debe incluir un botón **Editar mi invitación** que apunte a `/dashboard/invitations/{id}/edit`.

### E4. Verificar dashboard

1. Ve a la URL del botón en el email.
2. El dashboard debe cargar con la invitación creada automáticamente.
3. Edita el título → guarda → verifica que los cambios persisten.
4. Sube una imagen → verifica que aparece en el campo correspondiente.

### E5. Verificar /checkout/success

1. Ve a `/checkout/success?session_id=cs_test_...` (la URL a la que redirigió Stripe).
2. Debe mostrar: plan, monto, botón **Editar invitación**, botón **Ver mis invitaciones**.

### E6. Verificar /cliente

1. Ve a `/cliente?email=tu@email.com`.
2. Debe mostrar la orden con estado **Pagado** y botón **Editar invitación**.

### E7. Prueba de compra real (pequeña)

Antes del lanzamiento público, haz una compra real de `$1` o el precio más bajo con tarjeta real para confirmar que el flujo de producción de Stripe funciona. Puedes reembolsarla desde el dashboard de Stripe.

---

## Seguridad — checklist rápido

- [ ] `SUPABASE_SERVICE_ROLE_KEY` no está en ninguna variable `NEXT_PUBLIC_*`
- [ ] `STRIPE_SECRET_KEY` no está en ninguna variable `NEXT_PUBLIC_*`
- [ ] `.env.local` no está en el repositorio (`git status` no lo muestra)
- [ ] `.gitignore` incluye `.env.local` y `.env*.local`
- [ ] El webhook de Stripe verifica la firma (`STRIPE_WEBHOOK_SECRET`)
- [ ] Los logs del servidor no imprimen API keys ni payloads completos de Stripe
- [ ] RLS está habilitado en todas las tablas de Supabase

---

## Solución de problemas comunes

| Síntoma | Causa probable | Solución |
|---|---|---|
| Webhook no dispara | URL incorrecta en Stripe | Verifica la URL del endpoint y que el dominio responda |
| `Missing env var: STRIPE_SECRET_KEY` | Variable no configurada en hosting | Agrega la variable en el panel de Vercel/Railway |
| Email no llega | Dominio no verificado en Resend | Completa la verificación DNS en Resend |
| Invitación no se crea | `invitations_7y6_auto_create_patch.sql` no aplicado | Ejecuta el patch en Supabase SQL Editor |
| Dashboard muestra 404 | `invitation_id` no llenado en la orden | Revisa logs del webhook — puede ser error de RLS |
| Build falla en CI | Env vars faltantes en CI | Agrega las variables secretas al entorno de CI/CD |
