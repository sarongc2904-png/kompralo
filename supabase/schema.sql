-- =============================================================================
-- Kompralo — Supabase Schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query).
-- All tables are in the `public` schema unless noted.
-- RLS is enabled on every table; policies are defined below each table.
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------------
create extension if not exists "pgcrypto";   -- gen_random_uuid() on older PG
create extension if not exists "uuid-ossp";  -- backup uuid generator

-- ---------------------------------------------------------------------------
-- Helper: auto-update updated_at on any table that has the column
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- =============================================================================
-- TABLE: users
-- Extends auth.users with profile data. 1:1 with Supabase Auth.
-- =============================================================================
create table if not exists public.users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text not null,
  full_name   text,
  phone       text,
  plan_id     text not null default 'basic'
              check (plan_id in ('basic', 'premium', 'deluxe')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger users_updated_at
  before update on public.users
  for each row execute function public.set_updated_at();

alter table public.users enable row level security;

create policy "users_select_own"   on public.users for select using (auth.uid() = id);
create policy "users_update_own"   on public.users for update using (auth.uid() = id);
-- insert / delete: service role only (no permissive policy = denied by default)

-- =============================================================================
-- TABLE: invitations
-- Master record per invitation. Content lives in invitation_content (1:1).
-- TODO: add full_text_search index once the editor is live.
-- =============================================================================
create table if not exists public.invitations (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  slug         text not null,
  category     text not null
               check (category in ('wedding', 'baptism', 'baby-shower', 'birthday')),
  variant      text not null default 'neutral'
               check (variant in ('couple', 'girl', 'boy', 'woman', 'man', 'neutral')),
  template_id  text not null,
  plan_id      text not null
               check (plan_id in ('basic', 'premium', 'deluxe')),
  status       text not null default 'draft'
               check (status in ('draft', 'preview', 'pending_payment', 'paid', 'published', 'archived', 'deleted')),
  theme_id     text not null default 'champagne',
  title        text not null,
  subtitle     text not null,
  event_date   timestamptz,
  published_at timestamptz,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint invitations_slug_unique unique (slug)
);

create index if not exists invitations_user_id_idx on public.invitations(user_id);
create index if not exists invitations_status_idx  on public.invitations(status);
create index if not exists invitations_category_idx on public.invitations(category);

create trigger invitations_updated_at
  before update on public.invitations
  for each row execute function public.set_updated_at();

alter table public.invitations enable row level security;

-- Public can read published invitations; owners read all their own.
create policy "invitations_select_public" on public.invitations
  for select using (
    status in ('published', 'paid')
    or user_id = auth.uid()
  );
create policy "invitations_insert_own" on public.invitations
  for insert with check (user_id = auth.uid());
create policy "invitations_update_own" on public.invitations
  for update using (user_id = auth.uid());
create policy "invitations_delete_own" on public.invitations
  for delete using (user_id = auth.uid());

-- =============================================================================
-- TABLE: invitation_content
-- Editable content for an invitation. 1:1 with invitations.
-- All section data is stored as JSONB matching the TypeScript shape exactly.
-- TODO: Consider splitting large JSONB columns (story, gallery) into separate
--       tables once the editor supports per-section editing.
-- =============================================================================
create table if not exists public.invitation_content (
  id                    uuid primary key default gen_random_uuid(),
  invitation_id         uuid not null unique references public.invitations(id) on delete cascade,
  protagonists          jsonb not null default '[]',   -- InvitationProtagonist[]
  event_time            text,
  location              jsonb,     -- { venueName, address, googleMapsLink, wazeLink }
  hero                  jsonb,     -- { emotionalPhrase, imageUrl, videoUrl?, eventLabel }
  story                 jsonb,     -- { slides: StorySlide[] }
  gallery               jsonb,     -- { images: string[] }
  timeline              jsonb not null default '[]',   -- TimelineEvent[]
  itinerary             jsonb not null default '[]',   -- ItineraryItem[]
  dress_code            jsonb,     -- { type, description, suggestions }
  gift_registry         jsonb,     -- { items: GiftRegistryItem[] }
  music                 jsonb,     -- { audioUrl }
  final_message         jsonb,     -- { quote, imageUrl? }
  parents               jsonb not null default '[]',   -- ParentCouple[]
  padrinos              jsonb not null default '[]',   -- Padrino[]
  hotels                jsonb not null default '[]',   -- Hotel[]
  social                jsonb,     -- { hashtag, instagramHandle?, note? }
  rsvp_whatsapp_number  text,
  feature_overrides     jsonb,     -- FeatureOverrides (Partial<Record<InvitationFeatureKey, boolean>>)
  updated_at            timestamptz not null default now()
);

create trigger invitation_content_updated_at
  before update on public.invitation_content
  for each row execute function public.set_updated_at();

alter table public.invitation_content enable row level security;

create policy "invitation_content_select_public" on public.invitation_content
  for select using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and (i.status in ('published', 'paid') or i.user_id = auth.uid())
    )
  );
create policy "invitation_content_update_own" on public.invitation_content
  for update using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.user_id = auth.uid()
    )
  );

-- =============================================================================
-- TABLE: invitation_versions
-- Immutable snapshots of invitation_content at each publish event.
-- Enables rollback and audit history.
-- TODO: Create a Postgres function / Edge Function to auto-snapshot on publish.
-- =============================================================================
create table if not exists public.invitation_versions (
  id              uuid primary key default gen_random_uuid(),
  invitation_id   uuid not null references public.invitations(id) on delete cascade,
  version_number  int not null,
  snapshot        jsonb not null,   -- full InvitationContent shape at publish time
  published_by    uuid references public.users(id),
  created_at      timestamptz not null default now(),
  constraint invitation_versions_unique unique (invitation_id, version_number)
);

create index if not exists invitation_versions_invitation_id_idx
  on public.invitation_versions(invitation_id);

alter table public.invitation_versions enable row level security;

create policy "invitation_versions_select_own" on public.invitation_versions
  for select using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.user_id = auth.uid()
    )
  );
-- insert: service role only (triggered on publish); update/delete: prohibited

-- =============================================================================
-- TABLE: invitation_theme_overrides
-- Per-invitation overrides on top of the base theme. 1:1 with invitations.
-- TODO: Expose in the dashboard theme editor.
-- =============================================================================
create table if not exists public.invitation_theme_overrides (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null unique references public.invitations(id) on delete cascade,
  overrides      jsonb not null default '{}',   -- Partial<InvitationTheme>
  updated_at     timestamptz not null default now()
);

create trigger invitation_theme_overrides_updated_at
  before update on public.invitation_theme_overrides
  for each row execute function public.set_updated_at();

alter table public.invitation_theme_overrides enable row level security;

create policy "theme_overrides_select" on public.invitation_theme_overrides
  for select using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id
        and (i.status in ('published', 'paid') or i.user_id = auth.uid())
    )
  );
create policy "theme_overrides_update_own" on public.invitation_theme_overrides
  for update using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.user_id = auth.uid()
    )
  );

-- =============================================================================
-- TABLE: invitation_feature_overrides
-- Per-feature flags per invitation, applied on top of the plan feature matrix.
-- Row per feature key (normalized). N:1 with invitations.
-- TODO: Migrate to invitation_content.feature_overrides (JSONB) if the row-
--       per-flag pattern proves too verbose for the editor.
-- =============================================================================
create table if not exists public.invitation_feature_overrides (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations(id) on delete cascade,
  feature_key    text not null,   -- e.g. 'showGallery', 'showMusic'
  enabled        boolean not null,
  updated_at     timestamptz not null default now(),
  constraint invitation_feature_overrides_unique unique (invitation_id, feature_key)
);

create index if not exists feature_overrides_invitation_id_idx
  on public.invitation_feature_overrides(invitation_id);

create trigger invitation_feature_overrides_updated_at
  before update on public.invitation_feature_overrides
  for each row execute function public.set_updated_at();

alter table public.invitation_feature_overrides enable row level security;

create policy "feature_overrides_select_own" on public.invitation_feature_overrides
  for select using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.user_id = auth.uid()
    )
  );
create policy "feature_overrides_write_own" on public.invitation_feature_overrides
  for all using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.user_id = auth.uid()
    )
  );

-- =============================================================================
-- TABLE: rsvp_responses
-- One row per guest RSVP. Public insert; owner-only read.
-- =============================================================================
create table if not exists public.rsvp_responses (
  id             uuid primary key default gen_random_uuid(),
  invitation_id  uuid not null references public.invitations(id) on delete cascade,
  name           text not null,
  phone          text,
  attendance     text not null check (attendance in ('yes', 'no', 'maybe')),
  guest_count    int not null default 1
                 check (guest_count >= 0 and guest_count <= 20),
  message        text,
  status         text not null default 'pending'
                 check (status in ('pending', 'confirmed', 'cancelled')),
  ip_address     text,   -- stored for basic abuse detection; not exposed to clients
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists rsvp_responses_invitation_id_idx
  on public.rsvp_responses(invitation_id);
create index if not exists rsvp_responses_attendance_idx
  on public.rsvp_responses(invitation_id, attendance);

create trigger rsvp_responses_updated_at
  before update on public.rsvp_responses
  for each row execute function public.set_updated_at();

alter table public.rsvp_responses enable row level security;

-- Anyone can submit an RSVP (enforced by the API route, not bypassed here).
create policy "rsvp_insert_public" on public.rsvp_responses
  for insert with check (true);
-- Only the invitation owner can read RSVPs for their invitation.
create policy "rsvp_select_owner" on public.rsvp_responses
  for select using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.user_id = auth.uid()
    )
  );
create policy "rsvp_update_owner" on public.rsvp_responses
  for update using (
    exists (
      select 1 from public.invitations i
      where i.id = invitation_id and i.user_id = auth.uid()
    )
  );

-- =============================================================================
-- TABLE: payments
-- Stripe payment records. Managed exclusively by the Stripe webhook handler.
-- TODO: Wire up when Stripe integration is activated (FASE 7).
-- =============================================================================
create table if not exists public.payments (
  id                        uuid primary key default gen_random_uuid(),
  invitation_id             uuid not null references public.invitations(id) on delete cascade,
  user_id                   uuid not null references public.users(id),
  stripe_session_id         text unique,
  stripe_payment_intent_id  text unique,
  amount_cents              int not null check (amount_cents > 0),
  currency                  text not null default 'mxn',
  plan_id                   text not null check (plan_id in ('basic', 'premium', 'deluxe')),
  status                    text not null default 'pending'
                            check (status in ('pending', 'completed', 'failed', 'refunded')),
  paid_at                   timestamptz,
  created_at                timestamptz not null default now(),
  updated_at                timestamptz not null default now()
);

create index if not exists payments_invitation_id_idx on public.payments(invitation_id);
create index if not exists payments_user_id_idx       on public.payments(user_id);
create index if not exists payments_status_idx        on public.payments(status);

create trigger payments_updated_at
  before update on public.payments
  for each row execute function public.set_updated_at();

alter table public.payments enable row level security;

create policy "payments_select_own" on public.payments
  for select using (user_id = auth.uid());
-- insert / update: service role only (Stripe webhook); delete: prohibited
