create table if not exists public.innova_state (
  id text primary key check (id = 'main'),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

create table if not exists public.innova_staff_profiles (
  user_id uuid not null references auth.users(id) on delete cascade,
  profile_id text not null unique check (profile_id in ('admin', 'matheus', 'jheni', 'lucas', 'direcao')),
  primary key (user_id, profile_id)
);

do $$
declare
  primary_key_name text;
  primary_key_definition text;
begin
  select constraint_row.conname, pg_catalog.pg_get_constraintdef(constraint_row.oid)
  into primary_key_name, primary_key_definition
  from pg_catalog.pg_constraint as constraint_row
  where constraint_row.conrelid = 'public.innova_staff_profiles'::regclass
    and constraint_row.contype = 'p';

  if primary_key_definition is distinct from 'PRIMARY KEY (user_id, profile_id)' then
    if primary_key_name is not null then
      execute pg_catalog.format('alter table public.innova_staff_profiles drop constraint %I', primary_key_name);
    end if;
    alter table public.innova_staff_profiles
      add constraint innova_staff_profiles_pkey primary key (user_id, profile_id);
  end if;
end;
$$;

alter table public.innova_state enable row level security;
alter table public.innova_staff_profiles enable row level security;

revoke all on table public.innova_state from public, anon, authenticated;
grant select on table public.innova_state to authenticated;

revoke all on table public.innova_staff_profiles from public, anon, authenticated;
grant select on table public.innova_staff_profiles to authenticated;

drop policy if exists "Usuários autenticados podem ler os dados" on public.innova_state;
drop policy if exists "Usuários autenticados podem criar os dados" on public.innova_state;
drop policy if exists "Usuários autenticados podem atualizar os dados" on public.innova_state;
drop policy if exists "Leitura pública do estado Innova Coins" on public.innova_state;
drop policy if exists "Funcionários autenticados podem ler o estado Innova Coins" on public.innova_state;
create policy "Funcionários autenticados podem ler o estado Innova Coins"
on public.innova_state
for select
to authenticated
using (
  exists (
    select 1
    from public.innova_staff_profiles staff
    where staff.user_id = (select auth.uid())
  )
);

drop policy if exists "Funcionários podem consultar seu próprio perfil" on public.innova_staff_profiles;
create policy "Funcionários podem consultar seu próprio perfil"
on public.innova_staff_profiles
for select
to authenticated
using (user_id = (select auth.uid()));

insert into public.innova_state (id, payload)
values (
  'main',
  '{
    "database": null,
    "profiles": [
      { "id": "admin", "name": "Administrador" },
      { "id": "matheus", "name": "Matheus" },
      { "id": "jheni", "name": "Jheni" },
      { "id": "lucas", "name": "Lucas" },
      { "id": "direcao", "name": "Direção/Secretaria" }
    ]
  }'::jsonb
)
on conflict (id) do nothing;

update public.innova_state
set payload = jsonb_set(
      payload,
      '{profiles}',
      coalesce(
        (
          select jsonb_agg(profile - 'pin' order by ordinal)
          from jsonb_array_elements(payload -> 'profiles') with ordinality as entries(profile, ordinal)
        ),
        '[]'::jsonb
      ),
      true
    ),
    updated_at = clock_timestamp()
where id = 'main'
  and jsonb_typeof(payload -> 'profiles') = 'array'
  and exists (
    select 1
    from jsonb_array_elements(payload -> 'profiles') as entries(profile)
    where profile ? 'pin'
  );

drop function if exists public.save_innova_state(jsonb, timestamptz, text, text);

create or replace function public.save_innova_state(
  p_payload jsonb,
  p_expected_updated_at timestamptz
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_payload jsonb;
  current_revision timestamptz;
  next_revision timestamptz;
begin
  if auth.uid() is null or not exists (
    select 1
    from public.innova_staff_profiles staff
    where staff.user_id = auth.uid()
  ) then
    return null;
  end if;

  if p_payload is null
    or pg_catalog.jsonb_typeof(p_payload -> 'profiles') is distinct from 'array'
    or p_payload -> 'database' is null
    or pg_catalog.octet_length(p_payload::text) > 900000 then
    return null;
  end if;

  if exists (
    select 1
    from pg_catalog.jsonb_array_elements(p_payload -> 'profiles') as entries(profile)
    where profile ? 'pin'
  ) then
    return null;
  end if;

  if p_payload -> 'database' is distinct from 'null'::jsonb
    and (
      pg_catalog.jsonb_typeof(p_payload -> 'database') is distinct from 'object'
      or pg_catalog.jsonb_typeof(p_payload -> 'database' -> 'classes') is distinct from 'array'
    ) then
    return null;
  end if;

  select payload, updated_at
  into current_payload, current_revision
  from public.innova_state
  where id = 'main'
  for update;

  if not found or current_revision is distinct from p_expected_updated_at then
    return null;
  end if;

  if p_payload -> 'profiles' is distinct from current_payload -> 'profiles' then
    return null;
  end if;

  update public.innova_state
  set payload = p_payload,
      updated_at = pg_catalog.clock_timestamp()
  where id = 'main'
    and updated_at = current_revision
  returning updated_at into next_revision;

  return next_revision;
end;
$$;

revoke all on function public.save_innova_state(jsonb, timestamptz) from public, anon, authenticated;
grant execute on function public.save_innova_state(jsonb, timestamptz) to authenticated;

do $$
begin
  if not exists (
    select 1
    from pg_catalog.pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'innova_state'
  ) then
    alter publication supabase_realtime add table public.innova_state;
  end if;
end;
$$;
