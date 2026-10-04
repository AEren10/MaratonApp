-- Avatar bucket'i public: fotograflar public URL ile gorunur (SELECT politikasi
-- gerekmez). "Anyone can view avatars" herkesin (anon dahil) butun dosyalari
-- LISTELEMESINE izin veriyordu. Artik yalniz kendi klasoru (upsert ve eski
-- dosya silme bunu ister).
drop policy if exists "Anyone can view avatars" on storage.objects;
create policy "Users can view own avatars" on storage.objects
  for select to authenticated
  using (bucket_id = 'avatars' and (select auth.uid())::text = (storage.foldername(name))[1]);
