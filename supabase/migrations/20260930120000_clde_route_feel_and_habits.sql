-- Durak sonrasi tek dokunusluk geri bildirim: rota konunun zorlugunu kisiye gore ayarlar.
alter table public.study_logs
  add column if not exists perceived text
  check (perceived is null or perceived in ('easy','ok','hard'));

-- Rota tercihleri: gunluk rutinler (her gun paragraf, problem...).
create table if not exists public.route_prefs (
  user_id uuid primary key references auth.users(id) on delete cascade,
  habits jsonb not null default '[]'::jsonb
    check (jsonb_typeof(habits) = 'array' and jsonb_array_length(habits) <= 6),
  updated_at timestamptz not null default now()
);

alter table public.route_prefs enable row level security;

create policy route_prefs_select_own on public.route_prefs
  for select to authenticated using ((select auth.uid()) = user_id);
create policy route_prefs_insert_own on public.route_prefs
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy route_prefs_update_own on public.route_prefs
  for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

revoke all on public.route_prefs from anon;
grant select, insert, update on public.route_prefs to authenticated;
