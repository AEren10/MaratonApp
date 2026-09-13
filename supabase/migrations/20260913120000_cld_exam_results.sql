-- AKIS 14 · "Sınav Sonucu" / "Tahmin Doğruluğu".
-- Kullanicinin girdigi GERCEK sinav sonucu ve sonuc kaydedilirken dondurulan
-- tahmin anlik goruntusu. Sinav (tur + tarih) basina tek satir.
-- UYGULANMADI: canli DB'ye karsi dogrulanip elle uygulanacak.

CREATE TABLE IF NOT EXISTS public.exam_results (
  user_id           UUID        NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  exam_type         TEXT        NOT NULL CHECK (exam_type IN ('tyt', 'tyt_ayt', 'ayt', 'dil', 'lgs')),
  exam_date         DATE        NOT NULL,
  primary_net       NUMERIC(6,2) NOT NULL CHECK (primary_net >= 0 AND primary_net <= 120),
  secondary_net     NUMERIC(6,2) CHECK (secondary_net IS NULL OR (secondary_net >= 0 AND secondary_net <= 80)),
  placement_score   NUMERIC(6,2) CHECK (placement_score IS NULL OR (placement_score >= 0 AND placement_score <= 560)),
  forecast_snapshot JSONB       CHECK (forecast_snapshot IS NULL OR jsonb_typeof(forecast_snapshot) = 'object'),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, exam_type, exam_date)
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "exam_results select own" ON public.exam_results;
CREATE POLICY "exam_results select own"
  ON public.exam_results FOR SELECT TO authenticated
  USING ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "exam_results insert own" ON public.exam_results;
CREATE POLICY "exam_results insert own"
  ON public.exam_results FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "exam_results update own" ON public.exam_results;
CREATE POLICY "exam_results update own"
  ON public.exam_results FOR UPDATE TO authenticated
  USING ((select auth.uid()) = user_id)
  WITH CHECK ((select auth.uid()) = user_id);

DROP POLICY IF EXISTS "exam_results delete own" ON public.exam_results;
CREATE POLICY "exam_results delete own"
  ON public.exam_results FOR DELETE TO authenticated
  USING ((select auth.uid()) = user_id);

REVOKE ALL ON public.exam_results FROM PUBLIC, anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.exam_results TO authenticated;

DROP TRIGGER IF EXISTS exam_results_updated_at ON public.exam_results;
CREATE TRIGGER exam_results_updated_at
  BEFORE UPDATE ON public.exam_results
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
