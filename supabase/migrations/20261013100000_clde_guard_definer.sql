-- 13 Ekim 2026: "permission denied for function is_clean_text".
-- 20261005100000 private.is_clean_text'in EXECUTE yetkisini istemcilerden aldi
-- (yasakli kelime listesi yoklanmasin), ama onu cagiran tetikleyiciler
-- cagiranin yetkisiyle calisiyordu: profil adi degistirme ve grup adi/aciklama
-- yazma HER kullanicida patliyordu. Tetikleyiciler tanimlayici yetkisiyle
-- calisir; is_clean_text istemciye kapali kalir.
ALTER FUNCTION private.guard_profile_name() SECURITY DEFINER;
ALTER FUNCTION private.guard_group_text() SECURITY DEFINER;

-- Ayni kalip: public sarmalayici cagiranin yetkisiyle private fonksiyonu
-- cagiriyordu, "Verilerimi indir" patliyordu. Icerideki fonksiyon auth.uid()
-- ile yalniz cagiranin verisini dondurur.
ALTER FUNCTION public.get_private_export_data() SECURITY DEFINER;
