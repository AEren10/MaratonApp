-- Arkadaslik: riza ve engelleme (docs/reports/05 P1-1, P1-2).
--
-- 1) Herhangi bir kullanici istemciden status='accepted' ile satir ekleyip
--    kendini baskasinin arkadasi yapabiliyordu (riza yok; meydan okuma da
--    acilir). Ekleme artik yalniz 'pending'.
-- 2) Engelleme calismiyordu: istegi GONDEREN taraf engellediginde guncelleme
--    politikasi yalniz alici icin oldugundan 0 satir degisiyordu; ustelik
--    engellenen kisi satiri silip engeli kaldirabiliyordu. Engel artik
--    block_user() RPC'si ile kurulur (engelleyen = requester) ve engellenen
--    taraf satiri silemez/guncelleyemez.

-- Ekleme: yalniz kendi adina, yalniz bekleyen istek.
alter policy "Users create requests" on public.friendships
  with check ((select auth.uid()) = requester_id and status = 'pending');

-- Alici yalniz BEKLEYEN istegi kabul/ret edebilir.
alter policy "Addressee can accept/decline" on public.friendships
  using ((select auth.uid()) = addressee_id and status = 'pending')
  with check ((select auth.uid()) = addressee_id and status in ('accepted', 'declined'));

-- Silme: taraflar silebilir; ama engel satirini yalniz engelleyen (requester).
alter policy "Users delete own" on public.friendships
  using (
    (select auth.uid()) = requester_id
    or ((select auth.uid()) = addressee_id and status <> 'blocked')
  );

create or replace function public.block_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then raise exception 'not authenticated'; end if;
  if p_target is null or p_target = v_uid then raise exception 'invalid target'; end if;
  -- Aradaki her iliski (istek, arkadaslik, karsi tarafin engeli dahil) silinir,
  -- engel engelleyenin adina yeniden kurulur.
  delete from public.friendships
   where (requester_id = v_uid and addressee_id = p_target)
      or (requester_id = p_target and addressee_id = v_uid);
  insert into public.friendships (requester_id, addressee_id, status)
  values (v_uid, p_target, 'blocked');
end;
$$;

create or replace function public.unblock_user(p_target uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null then raise exception 'not authenticated'; end if;
  delete from public.friendships
   where requester_id = auth.uid() and addressee_id = p_target and status = 'blocked';
end;
$$;

revoke all on function public.block_user(uuid) from public, anon;
revoke all on function public.unblock_user(uuid) from public, anon;
grant execute on function public.block_user(uuid) to authenticated;
grant execute on function public.unblock_user(uuid) to authenticated;
