-- increment_study_session: "permission denied for table profiles".
-- SECURITY INVOKER + RETURNING study_session_count, ama authenticated'in bu
-- sutunda SELECT yetkisi yok (sutun bazli yetki). Fonksiyon yalniz cagiranin
-- kendi satirini 1 artirir; DEFINER guvenli, auth.uid() zorunlu.
create or replace function public.increment_study_session()
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  n integer;
begin
  if uid is null then
    raise exception 'unauthenticated' using errcode = '28000';
  end if;
  update public.profiles
     set study_session_count = coalesce(study_session_count, 0) + 1
   where id = uid
   returning study_session_count into n;
  return n;
end;
$$;

revoke all on function public.increment_study_session() from public, anon;
grant execute on function public.increment_study_session() to authenticated;
