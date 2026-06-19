# Supabase Schema Draft — Kompralo

> Documento de referencia para la migración a Supabase.
> Estado: BORRADOR — no implementado todavía.
> Todas las tablas están en el esquema `public` salvo indicación contraria.

---

## Principios generales

- Toda tabla tiene `id uuid primary key default gen_random_uuid()`.
- Toda tabla tiene `created_at timestamptz default now()` y `updated_at timestamptz default now()`.
- RLS habilitado en todas las tablas. Acceso público solo donde se indique explícitamente.
- Las invitaciones activas que sean `published` son visibles sin auth.
- Todo lo demás requiere sesión autenticada o service role.

---

## Tabla: `users`

**Propósito:** Clientes que crean y gestionan invitaciones. Supabase Auth gestiona autenticación; esta tabla extiende el perfil.

```sql
create table users (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text not null,
  full_name    text,
  phone        text,
  plan_id      text not null default 'basic',  -- sincronizado con payments
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);
```

**Relaciones:**
- `auth.users(id)` → 1:1 (extensión de perfil)
- `invitations.user_id` → 1:N (un usuario tiene muchas invitaciones)

**RLS:**
- `select`: solo el propio usuario (`auth.uid() = id`)
- `update`: solo el propio usuario
- `insert` / `delete`: service role únicamente

---

## Tabla: `invitations`

**Propósito:** Registro principal de cada invitación. Contiene metadatos y estado; el contenido vive en `invitation_content`.

```sql
create table invitations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  slug         text not null unique,
  category     text not null check (category in ('wedding','baptism','baby-shower','birthday')),
  variant      text not null default 'neutral',
  template_id  text not null,
  plan_id      text not null check (plan_id in ('basic','gold','platinum')),
  status       text not null default 'draft'
               check (status in ('draft','preview','pending_payment','paid','published','archived','deleted')),
  theme_id     text not null default 'champagne',
  title        text not null,
  subtitle     text not null,
  event_date   timestamptz,
  published_at timestamptz,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

create unique index invitations_slug_idx on invitations(slug);
```

**Relaciones:**
- `users(id)` → N:1
- `invitation_content(invitation_id)` → 1:1
- `invitation_feature_overrides(invitation_id)` → 1:N (por feature key)
- `rsvp_responses(invitation_id)` → 1:N

**RLS:**
- `select`: público si `status in ('published', 'paid')`; propietario ve todas las suyas
- `insert` / `update` / `delete`: solo el propietario (`user_id = auth.uid()`)

---

## Tabla: `invitation_versions`

**Propósito:** Snapshots inmutables del contenido publicado. Permite auditoría y rollback sin afectar la versión en vivo.

```sql
create table invitation_versions (
  id              uuid primary key default gen_random_uuid(),
  invitation_id   uuid not null references invitations(id) on delete cascade,
  version_number  int not null,
  snapshot        jsonb not null,   -- copia completa de invitation_content en ese momento
  published_by    uuid references users(id),
  created_at      timestamptz default now(),
  unique (invitation_id, version_number)
);
```

**Relaciones:**
- `invitations(id)` → N:1
- `users(id)` → N:1 (quién publicó)

**RLS:**
- `select`: solo el propietario de la invitación
- `insert`: service role únicamente (se crea al publicar)
- `update` / `delete`: prohibido (snapshots son inmutables)

---

## Tabla: `invitation_content`

**Propósito:** Contenido editable de la invitación. Separado de `invitations` para facilitar el editor del dashboard sin tocar metadatos.

```sql
create table invitation_content (
  id               uuid primary key default gen_random_uuid(),
  invitation_id    uuid not null unique references invitations(id) on delete cascade,
  protagonists     jsonb not null default '[]',
  event_time       text,
  location         jsonb,            -- { venueName, address, googleMapsLink, wazeLink }
  hero             jsonb,            -- { emotionalPhrase, imageUrl, videoUrl, eventLabel }
  story            jsonb,            -- { slides: [...] }
  gallery          jsonb,            -- { images: [...] }
  timeline         jsonb default '[]',
  itinerary        jsonb default '[]',
  dress_code       jsonb,
  gift_registry    jsonb,            -- { items: [...] }
  music            jsonb,            -- { audioUrl }
  final_message    jsonb,
  parents          jsonb default '[]',
  padrinos         jsonb default '[]',
  hotels           jsonb default '[]',
  social           jsonb,            -- { hashtag, instagramHandle, note }
  rsvp_whatsapp_number text,
  updated_at       timestamptz default now()
);
```

**Relaciones:**
- `invitations(id)` → 1:1

**RLS:**
- `select`: público si la invitación asociada es pública; propietario siempre
- `update`: solo el propietario de la invitación referenciada

**Nota:** El adapter TypeScript (`normalizeInvitation`) ya produce `InvitationContent` — Supabase debe mapear `snake_case` → `camelCase` en la capa de repositorio.

---

## Tabla: `invitation_theme_overrides`

**Propósito:** Overrides por invitación sobre el tema base. Permite personalización sin duplicar el tema completo.

```sql
create table invitation_theme_overrides (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null unique references invitations(id) on delete cascade,
  overrides      jsonb not null default '{}',  -- Partial<InvitationTheme>
  updated_at     timestamptz default now()
);
```

**Relaciones:**
- `invitations(id)` → 1:1

**RLS:**
- `select`: igual que `invitations`
- `update`: solo propietario

---

## Tabla: `invitation_feature_overrides`

**Propósito:** Feature flags por invitación que se aplican sobre la matriz del plan.

```sql
create table invitation_feature_overrides (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references invitations(id) on delete cascade,
  feature_key    text not null,   -- p.ej. 'showGallery', 'showMusic'
  enabled        boolean not null,
  updated_at     timestamptz default now(),
  unique (invitation_id, feature_key)
);
```

**Relaciones:**
- `invitations(id)` → N:1

**RLS:**
- `select`: solo propietario
- `insert` / `update` / `delete`: solo propietario

**Nota:** Al leer, se reconstruye `FeatureOverrides` como `Record<feature_key, enabled>` y se pasa a `getFeaturesForPlan(planId, overrides)`.

---

## Tabla: `rsvp_responses`

**Propósito:** Confirmaciones de asistencia. Cada fila es una respuesta de un invitado.

```sql
create table rsvp_responses (
  id              uuid primary key default gen_random_uuid(),
  invitation_id   uuid not null references invitations(id) on delete cascade,
  name            text not null,
  phone           text,
  attendance      text not null check (attendance in ('yes','no','maybe')),
  guest_count     int not null default 1 check (guest_count >= 0 and guest_count <= 20),
  message         text,
  status          text not null default 'pending'
                  check (status in ('pending','confirmed','cancelled')),
  ip_address      text,             -- para rate limiting básico
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);

create index rsvp_by_invitation_idx on rsvp_responses(invitation_id);
```

**Relaciones:**
- `invitations(id)` → N:1

**RLS:**
- `insert`: público (cualquiera puede confirmar asistencia)
- `select`: solo el propietario de la invitación asociada
- `update` / `delete`: solo propietario o service role

---

## Tabla: `payments`

**Propósito:** Registro de pagos vinculados a Stripe. Un pago activa o actualiza el plan de una invitación.

```sql
create table payments (
  id                  uuid primary key default gen_random_uuid(),
  invitation_id       uuid not null references invitations(id) on delete cascade,
  user_id             uuid not null references users(id),
  stripe_session_id   text unique,
  stripe_payment_intent_id text unique,
  amount_cents        int not null,
  currency            text not null default 'mxn',
  plan_id             text not null,
  status              text not null default 'pending'
                      check (status in ('pending','completed','failed','refunded')),
  paid_at             timestamptz,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
```

**Relaciones:**
- `invitations(id)` → N:1
- `users(id)` → N:1

**RLS:**
- `select`: solo el propietario (`user_id = auth.uid()`)
- `insert` / `update`: service role únicamente (manejado por webhook de Stripe)
- `delete`: prohibido

---

## Tabla: `events_analytics`

**Propósito:** Registro de eventos de actividad para el dashboard. No reemplaza un sistema de analytics completo, pero da visibilidad básica.

```sql
create table events_analytics (
  id              uuid primary key default gen_random_uuid(),
  invitation_id   uuid references invitations(id) on delete set null,
  event_type      text not null,
  -- valores: 'view', 'rsvp_start', 'rsvp_submit', 'music_play',
  --          'location_click', 'gallery_view', 'hotel_click'
  session_id      text,             -- UUID generado en cliente, sin PII
  metadata        jsonb default '{}',
  created_at      timestamptz default now()
);

create index analytics_by_invitation_idx on events_analytics(invitation_id);
create index analytics_by_type_idx on events_analytics(event_type);
```

**Relaciones:**
- `invitations(id)` → N:1 (nullable: evento puede llegar sin invitación válida)

**RLS:**
- `insert`: público con rate limiting via Edge Function
- `select`: solo propietario de la invitación referenciada
- `update` / `delete`: service role únicamente

---

## Flujo de estados de invitación

```
draft
  └─ preview          (se puede compartir link, no indexado)
       └─ pending_payment  (checkout Stripe iniciado)
            └─ paid        (pago confirmado por webhook)
                 └─ published   (propietario activa publicación)
                      └─ archived  (evento pasó)

Desde cualquier estado → deleted  (soft delete lógico)
```

---

## Notas de migración

- El adapter `normalizeInvitation` en `src/domain/invitations/adapters.ts` ya produce `InvitationContent`.
- `SupabaseInvitationRepository` deberá implementar `IInvitationRepository` (ya definida en `repository.types.ts`) y mapear `snake_case` de Supabase a `camelCase` de TypeScript.
- `getFeaturesForPlan(planId, overrides)` no cambia — solo cambia la fuente de `overrides`.
- `resolveInvitationContext` no cambia.
- Las rutas (`/i/[slug]`, `/preview/[id]`) no cambian.
