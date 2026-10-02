-- KULLANICI ICERIGI BILDIRIMI (Apple 1.2)
-- Avatar disinda bildirilemeyen iki icerik vardi: kullanici adi ve grup adi.
-- Tek tablo, tek fonksiyon: kim neyi neden bildirdi. Okuma yalniz servis
-- (moderasyon panelden yapilir); istemci yalniz yazar, o da fonksiyonla.
CREATE TABLE IF NOT EXISTS public.content_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  target_type text NOT NULL CHECK (target_type IN ('user', 'group')),
  target_id uuid NOT NULL,
  reason text NOT NULL CHECK (reason IN ('name', 'photo', 'harassment', 'spam', 'other')),
  snapshot text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (reporter_id, target_type, target_id, reason)
);
ALTER TABLE public.content_reports ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.content_reports FROM anon, authenticated;

CREATE OR REPLACE FUNCTION public.report_content(p_target_type text, p_target_id uuid, p_reason text)
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  v_user uuid := (select auth.uid());
  v_snapshot text;
BEGIN
  IF v_user IS NULL THEN RAISE EXCEPTION 'authentication required' USING ERRCODE = '28000'; END IF;
  IF p_target_type NOT IN ('user', 'group') OR p_target_id IS NULL THEN
    RAISE EXCEPTION 'invalid report' USING ERRCODE = '22023';
  END IF;
  IF p_target_type = 'user' AND p_target_id = v_user THEN
    RAISE EXCEPTION 'cannot report yourself' USING ERRCODE = '22023';
  END IF;

  -- Bildirilen anin icerigi saklanir: sonradan degistirilse de moderasyon
  -- neyin bildirildigini gorur.
  IF p_target_type = 'user' THEN
    SELECT coalesce(p.name, '') || ' | ' || coalesce(p.bio, '') || ' | ' || coalesce(p.avatar_url, '')
      INTO v_snapshot FROM public.profiles p WHERE p.id = p_target_id;
  ELSE
    SELECT coalesce(g.name, '') || ' | ' || coalesce(g.description, '')
      INTO v_snapshot FROM public.groups g WHERE g.id = p_target_id;
  END IF;
  IF v_snapshot IS NULL THEN RAISE EXCEPTION 'target not found' USING ERRCODE = 'P0002'; END IF;

  INSERT INTO public.content_reports (reporter_id, target_type, target_id, reason, snapshot)
  VALUES (v_user, p_target_type, p_target_id, coalesce(p_reason, 'other'), v_snapshot)
  ON CONFLICT (reporter_id, target_type, target_id, reason) DO NOTHING;
  RETURN 'received';
END;
$function$;

REVOKE ALL ON FUNCTION public.report_content(text, uuid, text) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.report_content(text, uuid, text) TO authenticated;
