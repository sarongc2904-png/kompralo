# KOMPRALO - Production Config Setup Report

Fecha: 2026-06-18

## Veredicto

**Configuracion incompleta**

La fase queda detenida porque no existe una URL publica HTTPS real disponible en el repo ni en variables de entorno.

Sin `NEXT_PUBLIC_APP_URL=https://URL-REAL`, no se debe configurar Stripe webhook, Supabase Auth Redirect URLs ni ejecutar redeploy final para E2E.

## URL usada

No disponible.

Busquedas realizadas:

- `kompralo.com.mx`: no encontrado como URL configurada
- `www.kompralo.com.mx`: no encontrado como URL configurada
- `hostingersite.com`: no encontrado
- `vercel.app`: no encontrado
- `NEXT_PUBLIC_APP_URL`: presente solo como placeholder/documentacion, sin valor real

## Hosting usado

No verificable.

No se encontro archivo/configuracion local de Vercel, Hostinger, Netlify ni variables de entorno reales.

## Variables para hosting

### Publicas

Configurar en hosting:

```env
NEXT_PUBLIC_APP_URL=https://URL-REAL
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_VIRTUAL_ASSISTANT_ENABLED=true
NEXT_PUBLIC_DASHBOARD_ASSISTANT_ENABLED=true
```

### Privadas

Configurar en hosting:

```env
SUPABASE_SERVICE_ROLE_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
RESEND_API_KEY=
RESEND_FROM_EMAIL=
OPENAI_API_KEY=
ASSISTANT_AI_ENABLED=false
DASHBOARD_ASSISTANT_ALLOWED_PLANS=premium,deluxe
ADMIN_ACCESS_ENABLED=false
```

Reglas:

- `SUPABASE_SERVICE_ROLE_KEY` nunca debe ser `NEXT_PUBLIC`.
- `STRIPE_SECRET_KEY` nunca debe ser `NEXT_PUBLIC`.
- `OPENAI_API_KEY` nunca debe ser `NEXT_PUBLIC`.
- Primera prueba: `ASSISTANT_AI_ENABLED=false`.
- Produccion/test real: `ADMIN_ACCESS_ENABLED=false`.
- No mezclar Stripe test con live.

## Supabase

Estado: **No verificable desde este entorno**.

Donde obtener variables:

- Supabase -> Project Settings -> API
- `NEXT_PUBLIC_SUPABASE_URL`: Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon public
- `SUPABASE_SERVICE_ROLE_KEY`: service_role

SQL a verificar/aplicar en orden:

1. `supabase/orders.sql`
2. `supabase/orders_7y4_email_patch.sql`
3. `supabase/invitations_7y6_auto_create_patch.sql`
4. `supabase/qa_7y7_missing_columns_patch.sql`
5. `supabase/auth_7b_customer_access_patch.sql`

Tablas a verificar:

- `orders`
- `invitations`
- `invitation_content`
- `rsvp_responses`

Storage:

- Bucket requerido: `invitations`
- Folders esperados:
  - `hero`
  - `gallery`
  - `storybook`
  - `protagonists`
  - `hotels`
  - `final-message`

## Supabase Auth

Estado: **Pendiente**.

Configurar:

- Authentication -> Providers -> Email -> Enabled
- Authentication -> URL Configuration

Valores:

```txt
Site URL:
https://URL-REAL

Redirect URLs:
https://URL-REAL/auth/callback
http://localhost:3000/auth/callback
http://127.0.0.1:3000/auth/callback
```

Si se usa dominio temporal, agregar tambien:

```txt
https://URL-TEMPORAL/auth/callback
```

## Stripe

Estado: **Pendiente**.

Usar primero Test mode.

Obtener keys:

- Stripe -> Developers -> API keys
- `STRIPE_SECRET_KEY=STRIPE_TEST_SECRET_KEY_PREFIX...`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=STRIPE_TEST_PUBLISHABLE_KEY_PREFIX...`

Configurar webhook:

- Stripe -> Developers -> Webhooks -> Add endpoint
- Endpoint:

```txt
https://URL-REAL/api/webhook/stripe
```

Evento minimo:

```txt
checkout.session.completed
```

Guardar:

```env
STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET_PREFIX...
```

No usar `STRIPE_WEBHOOK_SECRET_PREFIX` de localhost en produccion/test hosting.

## Resend

Estado: **Pendiente**.

Obtener:

- Resend -> API Keys -> `RESEND_API_KEY`
- Resend -> Domains -> dominio/remitente verificado

Formato recomendado:

```env
RESEND_FROM_EMAIL=KOMPRALO <hola@tudominio.com>
```

El dominio o remitente debe estar verificado antes de la prueba real.

## Hosting

Estado: **Pendiente**.

Vercel:

- Project -> Settings -> Environment Variables
- Pegar variables
- Guardar
- Redeploy

Hostinger:

- Website -> Manage -> Environment Variables
- Pegar variables
- Guardar
- Redeploy

## Precheck despues de redeploy

Probar:

- `/`
- `/invitaciones`
- `/invitaciones/precios`
- `/login`
- `/cliente`
- `/api/assistant`

Esperado:

- Paginas publicas cargan.
- `/cliente` sin sesion redirige a `/login?redirect=/cliente`.
- `/api/assistant` responde sin exponer secretos.
- No hay error 500 por variables faltantes.

## Checkout test

Despues de configurar variables y redeploy:

1. Abrir `/invitaciones/precios`.
2. Click en plan.
3. Debe abrir Stripe Checkout test.

Si falla, revisar:

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_APP_URL`
- `/api/checkout`
- logs del hosting

## Errores detectados

- No hay URL publica HTTPS real configurada.
- No hay variables reales disponibles en este entorno.
- No se puede configurar webhook Stripe sin dominio HTTPS real.
- No se puede configurar Supabase Auth redirects sin dominio HTTPS real.
- No se puede hacer redeploy desde este entorno sin acceso al hosting.

## Pendientes

1. Definir URL publica HTTPS real.
2. Configurar variables en hosting.
3. Aplicar/verificar SQL en Supabase.
4. Crear bucket `invitations`.
5. Configurar Supabase Auth Email + Redirect URLs.
6. Configurar Stripe test keys.
7. Crear webhook Stripe del dominio real.
8. Configurar Resend API key y remitente verificado.
9. Redeploy.
10. Probar rutas.
11. Probar apertura de Stripe Checkout.

## Estado final

**Configuracion incompleta**

La fase no queda aprobada hasta que exista URL publica HTTPS, variables criticas configuradas, Supabase/Stripe/Resend/Auth listos, redeploy ejecutado y Stripe Checkout abra en test mode.
