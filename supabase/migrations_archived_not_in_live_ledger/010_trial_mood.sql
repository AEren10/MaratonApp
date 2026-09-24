-- Katman 1 / Madde 4: Deneme sonrası mood (3 sn emoji)
-- Deneme kaydederken net dışında tek tıkla "nasıl hissettin" etiketi.
-- good / okay / bad — opsiyonel (NULL olabilir).

ALTER TABLE public.trials
  ADD COLUMN IF NOT EXISTS mood TEXT CHECK (mood IN ('good', 'okay', 'bad'));
