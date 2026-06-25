create table if not exists public.email_leads (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  name text,
  plan_interest text check (plan_interest in ('basic', 'premium', 'deluxe')),
  source text check (source in ('save_for_later', 'exit_intent', 'plans_section', 'post_payment', 'wizard_incomplete')),
  status text default 'lead' check (status in ('lead', 'customer', 'unsubscribed')),
  metadata jsonb default '{}',
  created_at timestamptz default now(),
  last_emailed_at timestamptz,
  unsubscribed_at timestamptz,
  constraint email_leads_email_unique unique (email)
);

alter table public.email_leads enable row level security;

create policy "Service role only" on public.email_leads
  using (auth.role() = 'service_role');

create index if not exists email_leads_status_idx on public.email_leads(status);
create index if not exists email_leads_source_idx on public.email_leads(source);

-- Columns for email sequences on orders
alter table public.orders add column if not exists email_sequence_step int default 0;
alter table public.orders add column if not exists last_sequence_email_at timestamptz;
