-- SERI HER CALISMA KAYDINDAN GUNCELLENIR
-- Seri yalniz iki ekranin (calisma ekle, zamanlayici) cagirdigi touch_streak
-- ile artiyordu. Durak tiki ve prova kayitlari seriye hic yazilmiyordu:
-- canlida bugun kaydi olan kullanicinin serisi 3 gun onceki tarihte duruyordu.
-- Artik bugune ait her yeni study_logs satiri seriyi sunucuda gunceller.
-- Geriye donuk kayit seriyi oynatmaz (yalniz bugunun TR tarihi).

create or replace function private.apply_streak(p_uid uuid, p_study_date date)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
declare
  today_tr date := (now() at time zone 'Europe/Istanbul')::date;
  d date;
  s record;
  has_log boolean;
  new_streak int;
  v_freeze_count int;
  v_freeze_reset timestamptz;
  v_last_freeze timestamptz;
  used_freeze boolean := false;
  transition text;
begin
  if p_uid is null then
    return jsonb_build_object('ok', false, 'reason', 'unauthenticated');
  end if;
  d := coalesce(p_study_date, today_tr);
  if d > today_tr then
    return jsonb_build_object('ok', false, 'reason', 'future_date');
  end if;
  select exists (select 1 from public.study_logs where user_id = p_uid and study_date = d) into has_log;
  if not has_log then
    return jsonb_build_object('ok', false, 'reason', 'no_study_log');
  end if;

  select * into s from public.streaks where user_id = p_uid for update;
  if not found then
    insert into public.streaks (user_id, current_streak, longest_streak)
    values (p_uid, 0, 0) on conflict (user_id) do nothing;
    select * into s from public.streaks where user_id = p_uid for update;
  end if;

  v_freeze_count := coalesce(s.freeze_count, 0);
  v_freeze_reset := s.freeze_reset_at;
  v_last_freeze := s.last_freeze_at;
  if v_freeze_reset is null or v_freeze_reset <= now() then
    v_freeze_count := 1;
    v_freeze_reset := date_trunc('week', now() at time zone 'Europe/Istanbul') + interval '7 days';
  end if;

  if s.last_study_date = d then
    new_streak := greatest(coalesce(s.current_streak, 0), 1);
    transition := 'same_day';
  elsif s.last_study_date = d - 1 then
    new_streak := coalesce(s.current_streak, 0) + 1;
    transition := 'continued';
  elsif s.last_study_date = d - 2 and v_freeze_count > 0 then
    new_streak := coalesce(s.current_streak, 0) + 1;
    v_freeze_count := v_freeze_count - 1;
    used_freeze := true;
    v_last_freeze := now();
    transition := 'freeze_used';
  else
    new_streak := 1;
    transition := case when coalesce(s.current_streak, 0) > 1 then 'broken' else 'started' end;
  end if;

  if s.last_study_date is not null and d < s.last_study_date then
    return jsonb_build_object('ok', true, 'transition', 'stale',
      'current_streak', s.current_streak, 'longest_streak', s.longest_streak,
      'last_study_date', s.last_study_date, 'freeze_count', s.freeze_count,
      'freeze_reset_at', s.freeze_reset_at);
  end if;

  update public.streaks as st
     set current_streak = new_streak,
         longest_streak = greatest(new_streak, coalesce(st.longest_streak, 0)),
         last_study_date = d,
         freeze_count = v_freeze_count,
         freeze_reset_at = v_freeze_reset,
         last_freeze_at = v_last_freeze
   where st.user_id = p_uid
   returning * into s;

  return jsonb_build_object(
    'ok', true, 'transition', transition, 'used_freeze', used_freeze,
    'current_streak', s.current_streak, 'longest_streak', s.longest_streak,
    'last_study_date', s.last_study_date, 'freeze_count', s.freeze_count,
    'freeze_reset_at', s.freeze_reset_at);
end;
$function$;

revoke all on function private.apply_streak(uuid, date) from public, anon, authenticated;

-- Istemci yolu ayni hesaba gider (kimlik oturumdan).
create or replace function private.touch_streak(p_study_date date)
returns jsonb
language sql
security definer
set search_path to 'public', 'pg_temp'
as $function$
  select private.apply_streak(auth.uid(), p_study_date);
$function$;

create or replace function private.study_log_touch_streak()
returns trigger
language plpgsql
security definer
set search_path to 'public', 'pg_temp'
as $function$
begin
  if new.study_date = (now() at time zone 'Europe/Istanbul')::date then
    begin
      perform private.apply_streak(new.user_id, new.study_date);
    exception when others then
      -- Seri hesabi kaydi asla dusurmez.
      null;
    end;
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_study_log_touch_streak on public.study_logs;
create trigger trg_study_log_touch_streak
  after insert on public.study_logs
  for each row execute function private.study_log_touch_streak();

-- Bir kerelik onarim: kayitlardan art arda gun adalari; son ada guncel seri,
-- en uzun ada en uzun seri. Yalniz kayitlarin soyledigi daha yeni/uzun ise yazilir.
with days as (
  select distinct user_id, study_date from public.study_logs
),
islands as (
  select user_id, study_date,
         study_date - (row_number() over (partition by user_id order by study_date))::int as grp
  from days
),
runs as (
  select user_id, grp, count(*)::int as len, max(study_date) as end_day
  from islands group by user_id, grp
),
agg as (
  select user_id,
         max(len) as longest,
         (array_agg(len order by end_day desc))[1] as last_len,
         max(end_day) as last_day
  from runs group by user_id
)
insert into public.streaks (user_id, current_streak, longest_streak, last_study_date)
select user_id, last_len, longest, last_day from agg
on conflict (user_id) do update
  set current_streak = excluded.current_streak,
      longest_streak = greatest(public.streaks.longest_streak, excluded.longest_streak),
      last_study_date = excluded.last_study_date
  where public.streaks.last_study_date is null
     or public.streaks.last_study_date < excluded.last_study_date;
