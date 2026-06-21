-- Canonicalize every persisted plan ID before enforcing the current catalog.
-- Safe to run more than once. Legacy aliases remain readable in application
-- code, but may never be stored after this migration.

begin;

do $$
declare
  table_name text;
  constraint_name text;
  unknown_count bigint;
begin
  foreach table_name in array array['orders', 'invitations', 'users', 'payments']
  loop
    if to_regclass(format('public.%I', table_name)) is null then
      continue;
    end if;

    execute format(
      'select count(*) from public.%I where plan_id not in (''basic'', ''premium'', ''deluxe'', ''gold'', ''platinum'')',
      table_name
    ) into unknown_count;

    if unknown_count > 0 then
      raise warning 'KOMPRALO plan migration: % rows in public.% have unknown plan IDs; preserving rows with safe Basic permissions.', unknown_count, table_name;
    end if;

    if table_name = 'orders' then
      execute $sql$
        update public.orders
        set metadata = coalesce(metadata, '{}'::jsonb) || jsonb_build_object(
              'plan_migration_original_id', plan_id,
              'plan_migration_requires_review', true
            )
        where plan_id not in ('basic', 'premium', 'deluxe', 'gold', 'platinum')
      $sql$;

      execute $sql$
        update public.orders
        set plan_id = case
          when plan_id = 'gold' then 'premium'
          when plan_id = 'platinum' then 'deluxe'
          when plan_id in ('basic', 'premium', 'deluxe') then plan_id
          when amount_total = 49900 then 'basic'
          when amount_total = 89900 then 'premium'
          when amount_total = 149900 then 'deluxe'
          else 'basic'
        end
      $sql$;
    else
      execute format(
        'update public.%I set plan_id = case when plan_id = ''gold'' then ''premium'' when plan_id = ''platinum'' then ''deluxe'' when plan_id in (''basic'', ''premium'', ''deluxe'') then plan_id else ''basic'' end',
        table_name
      );
    end if;

    for constraint_name in
      select con.conname
      from pg_constraint con
      where con.conrelid = format('public.%I', table_name)::regclass
        and con.contype = 'c'
        and pg_get_constraintdef(con.oid) ilike '%plan_id%'
    loop
      execute format('alter table public.%I drop constraint %I', table_name, constraint_name);
    end loop;

    execute format(
      'alter table public.%I add constraint %I check (plan_id in (''basic'', ''premium'', ''deluxe''))',
      table_name,
      table_name || '_plan_id_check'
    );
  end loop;

  if to_regclass('public.orders') is not null then
    update public.orders
    set product_id = plan_id
    where product_id not in ('basic', 'premium', 'deluxe');

    for constraint_name in
      select con.conname
      from pg_constraint con
      where con.conrelid = 'public.orders'::regclass
        and con.contype = 'c'
        and pg_get_constraintdef(con.oid) ilike '%product_id%'
    loop
      execute format('alter table public.orders drop constraint %I', constraint_name);
    end loop;

    alter table public.orders
      add constraint orders_product_id_check
      check (product_id in ('basic', 'premium', 'deluxe'));
  end if;
end $$;

comment on column public.orders.plan_id is
  'Canonical invitation plan: basic | premium | deluxe.';
comment on column public.orders.product_id is
  'Canonical purchased product: basic | premium | deluxe.';
comment on column public.invitations.plan_id is
  'Canonical invitation plan: basic | premium | deluxe.';

commit;
