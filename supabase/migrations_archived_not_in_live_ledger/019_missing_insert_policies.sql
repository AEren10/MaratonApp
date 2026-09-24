-- Denetimde bulunan eksik INSERT politikaları.
-- streaks: getStreak fallback'i satır yoksa insert ediyor ama INSERT policy yoktu
--          → trigger çalışmamış kullanıcılarda RLS hatası. Ekleniyor.
-- profiles: yalnızca trigger (SECURITY DEFINER) insert ediyor; client upsert'e karşı savunma.

CREATE POLICY "streaks insert own"
  ON public.streaks FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "profiles insert own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
