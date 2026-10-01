-- GRUP SERISI: bir gun, o gun grupta olan HERKES calistiysa sayilir.
-- Sonradan katilan uye gecmis gunleri bozmaz. Bugun henuz herkes
-- calismadiysa seri dunden geriye sayilir (seri hala yasiyor) ve bugunun
-- durumu ayrica doner. Yalniz uye cagirabilir; yalniz sayi doner.
create or replace function public.get_group_streak(p_group_id uuid)
returns jsonb
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  today_tr date := (now() at time zone 'Europe/Istanbul')::date;
  v_total int;
  v_today int;
  d date;
  need int;
  have int;
  streak int := 0;
begin
  if auth.uid() is null or not private.is_group_member(p_group_id) then
    raise exception 'not_member';
  end if;

  select count(*) into v_total from public.group_members where group_id = p_group_id;
  select count(distinct gm.user_id) into v_today
    from public.group_members gm
    join public.study_logs l on l.user_id = gm.user_id and l.study_date = today_tr
   where gm.group_id = p_group_id;

  d := case when v_today >= v_total and v_total > 0 then today_tr else today_tr - 1 end;
  for i in 1..400 loop
    select count(*) into need from public.group_members
     where group_id = p_group_id and (joined_at at time zone 'Europe/Istanbul')::date <= d;
    exit when need = 0;
    select count(distinct gm.user_id) into have
      from public.group_members gm
      join public.study_logs l on l.user_id = gm.user_id and l.study_date = d
     where gm.group_id = p_group_id and (gm.joined_at at time zone 'Europe/Istanbul')::date <= d;
    exit when have < need;
    streak := streak + 1;
    d := d - 1;
  end loop;

  return jsonb_build_object('streak', streak, 'today_done', v_today, 'members', v_total);
end;
$$;

revoke all on function public.get_group_streak(uuid) from public, anon;
grant execute on function public.get_group_streak(uuid) to authenticated;
