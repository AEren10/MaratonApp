-- 11 Eylul'deki cdx_data_integrity_fixes migration'i canliya HIC uygulanmamisti.
-- Dosyayi oldugu gibi uygulamak olmazdi: icindeki persist_route_revision
-- surumu eskidir ve canlidaki has_feature_access kontrolu ile 22 Eylul'de
-- eklenen "bos slot yoksa terfi etme" mantigini geri alirdi. plan_tasks
-- bolumu de zaten canlida (kolon var, NOT NULL, indeksli).
--
-- Geriye gercekten eksik olan iki sey kaliyor; yalnizca onlar uygulaniyor.

-- 1) VERI DISA AKTARMA
-- dataExport.js get_private_export_data RPC'sini cagiriyor ama fonksiyon
-- canlida yoktu: cagri hata veriyor, dongudeki catch yutuyor ve "verilerimi
-- indir" dosyasi uc bolumu null olarak veriyordu (uyelik haklari, ozellik
-- kullanim kayitlari, rota yoldasligi). Kullanici bunu fark etmiyordu.
--
-- Tablolar RLS'li ve politikasiz KALSIN: istemci onlari dogrudan
-- sorgulamamali, yalnizca bu dar RPC uzerinden kendi satirlarini gormeli.
CREATE OR REPLACE FUNCTION private.get_private_export_data()
RETURNS JSONB
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_user_id UUID := (select auth.uid());
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000';
  END IF;

  RETURN jsonb_build_object(
    'user_entitlements',
      COALESCE((SELECT jsonb_agg(to_jsonb(e) ORDER BY e.updated_at DESC)
        FROM public.user_entitlements e
       WHERE e.user_id = v_user_id), '[]'::jsonb),
    'feature_usage_events',
      COALESCE((SELECT jsonb_agg(to_jsonb(f) ORDER BY f.created_at DESC)
        FROM public.feature_usage_events f
       WHERE f.user_id = v_user_id), '[]'::jsonb),
    'route_companionships',
      COALESCE((SELECT jsonb_agg(to_jsonb(c) ORDER BY c.created_at DESC)
        FROM public.route_companionships c
       WHERE v_user_id IN (c.user_low_id, c.user_high_id)), '[]'::jsonb)
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.get_private_export_data()
RETURNS JSONB
LANGUAGE sql
STABLE
SET search_path TO 'public', 'pg_temp'
AS $$ SELECT private.get_private_export_data(); $$;

REVOKE ALL ON FUNCTION private.get_private_export_data() FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.get_private_export_data() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.get_private_export_data() TO authenticated;

-- 2) INDEKSSIZ YABANCI ANAHTARLAR
-- Supabase performans denetcisinin bildirdigi yedi anahtar. Alti 11 Eylul
-- dosyasinda vardi ve uygulanmadigi icin duruyordu; groups_created_by daha
-- sonra grup sistemiyle geldi.
CREATE INDEX IF NOT EXISTS idx_groups_created_by
  ON public.groups (created_by);
CREATE INDEX IF NOT EXISTS idx_route_companionships_requested_by
  ON public.route_companionships (requested_by);
CREATE INDEX IF NOT EXISTS idx_route_companionships_user_high_id
  ON public.route_companionships (user_high_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_revision_id
  ON public.route_stops (revision_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_predecessor_stop_id
  ON public.route_stops (predecessor_stop_id);
CREATE INDEX IF NOT EXISTS idx_route_stops_replacement_stop_id
  ON public.route_stops (replacement_stop_id);
CREATE INDEX IF NOT EXISTS idx_trials_publisher_id
  ON public.trials (publisher_id);
