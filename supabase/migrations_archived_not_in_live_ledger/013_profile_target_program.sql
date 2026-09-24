-- D) Net simülatörü: kullanıcının hedef bölümü.
-- programs.js'deki id (örn. 'bilg_odtu'). Referans tablosu yok, string id tutulur.

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS target_program_id TEXT;
