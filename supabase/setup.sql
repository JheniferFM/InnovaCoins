create table if not exists public.innova_state (
  id text primary key check (id = 'main'),
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.innova_state enable row level security;
revoke all on table public.innova_state from anon, authenticated;
grant select on table public.innova_state to anon;

drop policy if exists "Usuários autenticados podem ler os dados" on public.innova_state;
drop policy if exists "Usuários autenticados podem criar os dados" on public.innova_state;
drop policy if exists "Usuários autenticados podem atualizar os dados" on public.innova_state;
drop policy if exists "Leitura pública do estado Innova Coins" on public.innova_state;

create policy "Leitura pública do estado Innova Coins"
on public.innova_state
for select
to anon
using (id = 'main');

insert into public.innova_state (id, payload)
values (
  'main',
  '{
    "database": null,
    "profiles": [
      { "id": "admin", "name": "Administrador", "pin": "804272" },
      { "id": "matheus", "name": "Matheus", "pin": "391658" },
      { "id": "jheni", "name": "Jheni", "pin": "726904" },
      { "id": "lucas", "name": "Lucas", "pin": "158437" },
      { "id": "direcao", "name": "Direção/Secretaria", "pin": "943812" }
    ]
  }'::jsonb
)
on conflict (id) do nothing;

create or replace function public.save_innova_state(
  p_payload jsonb,
  p_expected_updated_at timestamptz,
  p_profile_id text,
  p_pin text
)
returns timestamptz
language plpgsql
security definer
set search_path = ''
as $$
declare
  current_payload jsonb;
  current_revision timestamptz;
  expected_pin text;
  next_revision timestamptz;
begin
  if p_payload is null
    or pg_catalog.jsonb_typeof(p_payload -> 'profiles') <> 'array'
    or (
      p_payload -> 'database' <> 'null'::jsonb
      and (
        pg_catalog.jsonb_typeof(p_payload -> 'database') <> 'object'
        or pg_catalog.jsonb_typeof(p_payload -> 'database' -> 'classes') <> 'array'
      )
    )
    or pg_catalog.octet_length(p_payload::text) > 900000 then
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

  select profile ->> 'pin'
  into expected_pin
  from pg_catalog.jsonb_array_elements(current_payload -> 'profiles') as item(profile)
  where profile ->> 'id' = p_profile_id;

  if expected_pin is null or expected_pin is distinct from p_pin then
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

revoke all on function public.save_innova_state(jsonb, timestamptz, text, text) from public, anon, authenticated;
grant execute on function public.save_innova_state(jsonb, timestamptz, text, text) to anon;

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
