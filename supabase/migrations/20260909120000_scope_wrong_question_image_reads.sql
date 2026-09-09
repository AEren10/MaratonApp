-- wrong-questions bucket'inda iki PERMISSIVE SELECT policy'si vardi ve
-- permissive policy'ler OR'landigi icin genis olan kazaniyordu:
--
--   "Users can view own images"                    -> kendi klasoru
--   "Authenticated users can view wrong question   -> auth.role()='authenticated'
--    images"                                          (klasor kontrolu YOK)
--
-- Sonuc: giris yapmis herhangi bir kullanici tum kullanicilarin yanlis soru
-- fotograflarini listeleyip indirebiliyordu. Bu fotograflar kisisel defter
-- goruntuleri.
--
-- Genis policy toplulukta paylasilan sorularin gorunmesi icin konmustu.
-- Dogrusu erisimi gercekten paylasilmis olanlarla sinirlamak.

DROP POLICY IF EXISTS "Authenticated users can view wrong question images" ON storage.objects;

CREATE POLICY "Shared wrong question images are viewable"
  ON storage.objects FOR SELECT TO authenticated
  USING (
    bucket_id = 'wrong-questions'
    AND EXISTS (
      SELECT 1 FROM public.shared_questions sq
       WHERE sq.image_path = storage.objects.name
    )
  );

-- Sahibin kendi goruntulerine erisimi "Users can view own images" policy'si
-- ile zaten karsilaniyor, dokunulmadi.
