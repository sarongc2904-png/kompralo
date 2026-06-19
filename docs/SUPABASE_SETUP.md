# Supabase Setup — Kompralo

Guía paso a paso para conectar el proyecto a Supabase por primera vez.

---

## 1. Crear el proyecto Supabase

1. Ve a [supabase.com](https://supabase.com) → **New project**.
2. Nombre: `kompralo` (o el que prefieras).
3. Región: `South America (São Paulo)` — más cercana a México.
4. Contraseña de base de datos: guárdala en un gestor de contraseñas.
5. Espera ~2 minutos a que el proyecto inicie.

---

## 2. Obtener las credenciales

En el panel de tu proyecto:

**Settings → API**

| Variable | Dónde encontrarla |
|----------|------------------|
| `NEXT_PUBLIC_SUPABASE_URL` | "Project URL" |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | "anon public" (bajo "Project API keys") |
| `SUPABASE_SERVICE_ROLE_KEY` | "service_role" (bajo "Project API keys") |

> **Importante:** `SUPABASE_SERVICE_ROLE_KEY` bypassea RLS. Nunca la expongas al cliente ni la incluyas en variables `NEXT_PUBLIC_*`.

Crea el archivo `.env.local` en la raíz del proyecto:

```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 3. Aplicar el schema

En el panel de Supabase: **SQL Editor → New query**

1. Abre `supabase/schema.sql`.
2. Copia todo el contenido.
3. Pégalo en el editor y haz clic en **Run**.

Verifica que no haya errores. Las tablas que deben aparecer en **Table Editor**:

- `users`
- `invitations`
- `invitation_content`
- `invitation_versions`
- `invitation_theme_overrides`
- `invitation_feature_overrides`
- `rsvp_responses`
- `payments`

---

## 4. Cargar el seed (desarrollo / staging)

> **Solo para entornos de desarrollo y staging. No ejecutar en producción.**

1. **SQL Editor → New query**
2. Abre `supabase/seed.sql`.
3. Copia y pega → **Run**.

Esto inserta:

| Slug | Categoría | Tema | Plan |
|------|-----------|------|------|
| `sofia-y-alejandro` | wedding | champagne | platinum |
| `baby-shower-demo` | baby-shower | floral | platinum |
| `birthday-demo` | birthday | azure | gold |
| `baptism-demo` | baptism | azure | gold |

El seed es idempotente: si se corre más de una vez, `ON CONFLICT DO NOTHING` lo hace seguro.

---

## 5. Generar tipos TypeScript

Una vez que el schema esté aplicado, genera los tipos:

```bash
# Instala la CLI de Supabase si no la tienes
npm install -g supabase

# Autentícate
supabase login

# Genera los tipos (reemplaza PROJECT_ID con el id de tu proyecto)
# El PROJECT_ID está en Settings → General → Reference ID
npx supabase gen types typescript \
  --project-id TU_PROJECT_ID \
  > src/lib/supabase/types.ts
```

Esto reemplaza el placeholder `Database = any` en `src/lib/supabase/types.ts` con los tipos reales generados del schema.

Después de regenerar, verifica que el proyecto compila:

```bash
npx tsc --noEmit --incremental false
```

---

## 6. Activar los Supabase repositories (FASE 6D)

Una vez que las variables de entorno y el schema estén listos:

### 6a. Invitations

Edita `src/domain/invitations/repository.ts`:

```ts
// Antes:
import { LocalInvitationRepository } from './local.repository';
export const invitationRepository: IInvitationRepository =
  new LocalInvitationRepository();

// Después:
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseInvitationRepository } from './supabase.repository';

const supabase = await createServerSupabaseClient();
export const invitationRepository: IInvitationRepository =
  new SupabaseInvitationRepository(supabase);
```

> **Nota:** El repositorio se instancia en un contexto de servidor (Route Handler o Server Component). Si se necesita en múltiples lugares, usar `React.cache()` para deduplicar la instancia por request.

### 6b. RSVP

Edita `src/domain/rsvp/repository.ts`:

```ts
// Antes:
export const rsvpRepository: IRSVPRepository = new LocalRSVPRepository();

// Después:
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { SupabaseRSVPRepository } from './supabase.repository';

const supabase = await createServerSupabaseClient();
export const rsvpRepository: IRSVPRepository =
  new SupabaseRSVPRepository(supabase);
```

---

## 7. Verificar que todo funciona

```bash
npm run dev
```

Rutas a probar:

| URL | Resultado esperado |
|-----|--------------------|
| `/i/sofia-y-alejandro` | Boda Sofía & Alejandro |
| `/i/baby-shower-demo` | Baby Shower Valentina |
| `/i/birthday-demo` | Cumpleaños Isabella |
| `/i/baptism-demo` | Bautizo Emilia |
| `POST /api/rsvp` con `invitationId` válido | 201 |
| `POST /api/rsvp` con `invitationId` inválido | 404 |

---

## 8. RLS — Verificar políticas

En **Table Editor → rsvp_responses → Policies**, confirma que:

- `rsvp_insert_public` existe y aplica `WITH CHECK (true)`.
- `rsvp_select_owner` existe y filtra por `user_id`.

Para probar que las invitaciones públicas son visibles sin auth:

```sql
-- En SQL Editor, como rol anon:
set role anon;
select id, slug, status from invitations where status = 'published';
-- Debe devolver las 4 filas del seed.
```

---

---

## 9. Stripe — Setup y configuración

### 9a. Variables de entorno

Agrega las siguientes variables a `.env.local`:

```env
# Stripe
STRIPE_SECRET_KEY=STRIPE_TEST_SECRET_KEY_PREFIX...        # Dashboard → Developers → API keys → Secret key
STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET_PREFIX...      # Ver sección 9c
NEXT_PUBLIC_APP_URL=http://localhost:3000   # URL pública de la app (cambia en producción)
```

> **Importante:** `STRIPE_SECRET_KEY` nunca debe estar en variables `NEXT_PUBLIC_*`. Solo el servidor la lee.

---

### 9b. Aplicar el schema de órdenes

Una vez aplicado `schema.sql`, ejecuta también `orders.sql` en el SQL Editor:

1. **SQL Editor → New query**
2. Abre `supabase/orders.sql`.
3. Copia el contenido y haz clic en **Run**.

La tabla `orders` debe aparecer en **Table Editor**.

---

### 9c. Configurar el webhook en Stripe

#### Entorno local (desarrollo)

Usa el Stripe CLI para recibir webhooks en tu máquina:

```bash
# Instalar Stripe CLI (si no está instalado)
# https://docs.stripe.com/stripe-cli#install

# Autenticarse
stripe login

# Hacer forward de webhooks al servidor local
stripe listen --forward-to http://localhost:3000/api/webhook/stripe
```

El comando `stripe listen` imprime el `STRIPE_WEBHOOK_SECRET` (empieza con `STRIPE_WEBHOOK_SECRET_PREFIX`).  
Cópialo en `.env.local` como `STRIPE_WEBHOOK_SECRET=STRIPE_WEBHOOK_SECRET_PREFIX...`.

Reinicia el servidor después de cambiar `.env.local`.

#### Producción

1. Ve a **Stripe Dashboard → Developers → Webhooks → Add endpoint**.
2. URL del endpoint: `https://tu-dominio.com/api/webhook/stripe`
3. Selecciona los eventos:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.payment_failed`
4. Copia el **Signing secret** (`STRIPE_WEBHOOK_SECRET_PREFIX...`) → `STRIPE_WEBHOOK_SECRET` en tus variables de entorno de producción.

---

### 9d. Probar en modo test

1. Asegúrate de usar la clave `STRIPE_TEST_SECRET_KEY_PREFIX...` (no `STRIPE_LIVE_SECRET_KEY_PREFIX...`).
2. Inicia el servidor: `npm run dev`.
3. En otra terminal: `stripe listen --forward-to http://localhost:3000/api/webhook/stripe`.
4. Navega a `/invitaciones/precios`.
5. Haz clic en **Comprar** en cualquier plan.
6. En la página de Stripe Checkout, usa la tarjeta de prueba: `4242 4242 4242 4242` con cualquier fecha futura y cualquier CVC.
7. Verifica en la tabla `orders` de Supabase que el registro pasó a `status = 'paid'`.

---

### 9e. Flujo completo de checkout

```
Cliente → POST /api/checkout { productId }
       ← { sessionId, url }
       → window.location.href = url  (Stripe Checkout)
       → [paga con tarjeta de prueba]
       → Stripe redirige a /checkout/success?session_id=cs_...
       ← Stripe envía POST /api/webhook/stripe (checkout.session.completed)
       → Webhook crea registro en orders con status = 'paid'
```

---

## Notas de arquitectura

- **`SupabaseInvitationRepository`** espera que los datos de contenido estén en la tabla `invitation_content` (JOIN o query separada). El adapter `mapSupabaseInvitationToInvitationContent` mapea `snake_case` → `camelCase`.
- **`feature_overrides`** se almacena como JSONB en `invitation_content.feature_overrides`. El campo `invitation_feature_overrides` (tabla separada, por fila) está disponible para el dashboard si se necesita granularidad por feature.
- El campo **`ip_address`** en `rsvp_responses` está reservado para rate limiting a nivel DB. El rate limiting actual vive en `src/lib/rate-limit/in-memory.ts` y debe migrar a Upstash Redis antes de producción.
- **`payments`** no tiene políticas de insert públicas — todo va por service role via el webhook de Stripe (FASE 7).
