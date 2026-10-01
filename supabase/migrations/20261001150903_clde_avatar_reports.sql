-- Profil fotografi bildirimi: iki farkli kullanici ayni fotografi bildirince
-- fotograf otomatik kalkar; ucuncu kaldirmadan sonra yeni fotograf yuklenemez.
alter table public.profiles add column if not exists avatar_strikes integer not null default 0;

create table if not exists public.avatar_reports (
  reporter_id uuid not null references auth.users(id) on delete cascade,
  target_id uuid not null references auth.users(id) on delete cascade,
  avatar_url text,
  created_at timestamptz not null default now(),
  primary key (reporter_id, target_id)
);
create index if not exists avatar_reports_target_idx on public.avatar_reports (target_id);
alter table public.avatar_reports enable row level security;
-- Politika yok: tablo yalniz report_avatar uzerinden yazilir.

create or replace function public.report_avatar(p_target uuid)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_me uuid := auth.uid();
  v_url text;
  v_count integer;
begin
  if v_me is null then raise exception 'not_authenticated'; end if;
  if p_target is null or p_target = v_me then raise exception 'invalid_target'; end if;
  select avatar_url into v_url from public.profiles where id = p_target;
  if v_url is null then return 'no_avatar'; end if;

  insert into public.avatar_reports (reporter_id, target_id, avatar_url)
  values (v_me, p_target, v_url)
  on conflict (reporter_id, target_id)
  do update set avatar_url = excluded.avatar_url, created_at = now();

  select count(*) into v_count
  from public.avatar_reports
  where target_id = p_target and avatar_url = v_url;

  if v_count >= 2 then
    update public.profiles
      set avatar_url = null, avatar_strikes = avatar_strikes + 1
      where id = p_target;
    delete from public.avatar_reports where target_id = p_target;
    return 'removed';
  end if;
  return 'reported';
end;
$$;

revoke all on function public.report_avatar(uuid) from public, anon;
grant execute on function public.report_avatar(uuid) to authenticated;

create or replace function public.guard_avatar_strikes()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if current_user = 'authenticated'
     and new.avatar_url is not null
     and new.avatar_url is distinct from old.avatar_url
     and old.avatar_strikes >= 3 then
    raise exception 'avatar_locked';
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_avatar_strikes on public.profiles;
create trigger profiles_guard_avatar_strikes
  before update of avatar_url on public.profiles
  for each row execute function public.guard_avatar_strikes();
