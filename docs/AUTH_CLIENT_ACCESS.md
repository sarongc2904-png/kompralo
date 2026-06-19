# KOMPRALO - Auth Cliente / Magic Link

## Como funciona

El acceso al editor de invitaciones usa Supabase Auth con magic link (OTP). No hay contrasenas.

### Flujo completo

```txt
1. Cliente compra en /invitaciones/precios
2. Stripe procesa el pago
3. Webhook crea la invitacion y envia email de confirmacion
4. Email incluye boton -> /login?email=...&redirect=/dashboard/invitations/{id}/edit
5. Cliente abre /login con su email pre-llenado
6. Hace clic en "Enviar enlace de acceso"
7. Supabase envia un segundo email con magic link
8. Cliente hace clic -> /auth/callback?code=...&redirect=...
9. Sesion creada, redirect al editor
10. Editor verifica ownership: invitation.customer_email === session.user.email
```

## Rutas protegidas

| Ruta | Proteccion |
|---|---|
| `/dashboard` y subrutas | Sesion activa o `ADMIN_ACCESS_ENABLED=true` |
| `/dashboard/invitations/[id]/edit` | Sesion activa + ownership por email o admin mode |
| `/cliente` | Requiere sesion cuando `ADMIN_ACCESS_ENABLED=false`; usa solo `session.user.email` |

## `/cliente` en produccion

Con `ADMIN_ACCESS_ENABLED=false`:

- `/cliente` requiere sesion.
- Si no hay sesion, redirige a `/login?redirect=/cliente`.
- Si hay sesion, consulta ordenes usando solo `session.user.email`.
- Cualquier `?email=` en la URL se ignora.
- No se permite consultar ordenes de otro email mediante query param.

## Bypass de desarrollo

Con `ADMIN_ACCESS_ENABLED=true` en `.env.local`, el dashboard no requiere sesion.
Este modo es solo para desarrollo o pruebas controladas.

En ese modo, `/cliente?email=...` puede usarse como fallback temporal para inspeccionar ordenes por email.
La UI muestra el aviso:

```txt
Modo admin/dev: vista por email habilitada.
```

Si existe sesion autenticada, `/cliente` siempre usa `session.user.email` y nunca el email recibido por query param, incluso en admin mode.

## Setup requerido en Supabase

### 1. Habilitar Email Provider

En Supabase Dashboard -> Authentication -> Providers -> Email:

- Enable Email Provider: activado
- Confirm email: desactivado si se usara magic link sin confirmacion separada
- Secure email change: segun preferencia

### 2. Configurar URLs

En Supabase Dashboard -> Authentication -> URL Configuration:

| Campo | Valor |
|---|---|
| Site URL | `https://tudominio.com` |
| Redirect URLs | `https://tudominio.com/auth/callback` |

En desarrollo agrega tambien:

```txt
http://localhost:3000/auth/callback
```

Si usas otro puerto local, agregalo tambien.

### 3. Personalizar template de email

En Supabase Dashboard -> Authentication -> Email Templates -> Magic Link:

- Puedes personalizar asunto y cuerpo.
- La variable `{{ .ConfirmationURL }}` es el enlace que redirige a `/auth/callback`.

## Variables de entorno

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_APP_URL=https://tudominio.com
ADMIN_ACCESS_ENABLED=false
```

`NEXT_PUBLIC_APP_URL` se usa para construir `emailRedirectTo` del magic link.
Debe coincidir con el dominio configurado en Supabase Redirect URLs.

## Como probar

### Produccion o modo seguro

1. Configura `ADMIN_ACCESS_ENABLED=false`.
2. Abre `/cliente` sin sesion.
3. Debe redirigir a `/login?redirect=/cliente`.
4. Abre `/cliente?email=test@test.com` sin sesion.
5. Debe ignorar el query param y redirigir igual.
6. Inicia sesion con Magic Link.
7. Abre `/cliente?email=otro@email.com`.
8. Debe mostrar solo ordenes del email autenticado.

### Admin/dev

1. Configura `ADMIN_ACCESS_ENABLED=true`.
2. Abre `/cliente?email=test@test.com` sin sesion.
3. Debe permitir la vista temporal y mostrar el aviso admin/dev.
4. Abre `/cliente` sin email.
5. Debe mostrar un mensaje controlado, sin romper.

### Verificar ownership del editor

1. Crea una invitacion en Supabase con `customer_email = 'test@example.com'`.
2. Inicia sesion con `test@example.com`.
3. El editor debe abrir.
4. Inicia sesion con `otro@example.com`.
5. Debe mostrar "Acceso no autorizado".

## Email no llega

| Causa | Solucion |
|---|---|
| Supabase Auth Email Provider no habilitado | Habilitar en Auth -> Providers -> Email |
| Site URL incorrecta | Corregir en Auth -> URL Configuration |
| `/auth/callback` no esta en Redirect URLs | Agregar la URL exacta |
| Email en spam | Revisar spam o junk |
| Supabase free tier limita emails | Usar SMTP personalizado en produccion |

## Arquitectura de sesion

- La sesion se almacena en cookies HTTP-only via `@supabase/ssr`.
- `src/middleware.ts` refresca el token en cada request.
- `createServerSupabaseClient()` lee/escribe cookies en Server Components y Server Actions.
- `createServiceRoleSupabaseClient()` no tiene sesion de usuario; solo debe usarse server-side para operaciones como webhook y lecturas controladas.

## Checklist de lanzamiento con auth

- [ ] `supabase/auth_7b_customer_access_patch.sql` aplicado
- [ ] Email Provider habilitado en Supabase Dashboard
- [ ] Site URL configurada con dominio de produccion
- [ ] `/auth/callback` en Redirect URLs allowlist
- [ ] `ADMIN_ACCESS_ENABLED=false` en produccion
- [ ] `NEXT_PUBLIC_APP_URL` apunta al dominio de produccion
- [ ] `/cliente` sin sesion redirige a `/login?redirect=/cliente`
- [ ] `/cliente?email=test@test.com` sin sesion ignora query param y redirige
- [ ] `/cliente?email=otro@email.com` con sesion ignora query param
- [ ] Prueba de flujo completo: compra -> email -> login -> editor
- [ ] Prueba de ownership: email incorrecto -> "Acceso no autorizado"
