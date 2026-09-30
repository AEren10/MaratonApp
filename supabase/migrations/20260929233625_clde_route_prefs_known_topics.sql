-- Ogrencinin "hallettim" diye isaretledigi konular: { "<ders>:<konu>": "YYYY-MM-DD" | false }.
-- Eskiden yalniz cihazda tutuluyordu ve rota hic okumuyordu.
alter table public.route_prefs
  add column if not exists known_topics jsonb not null default '{}'::jsonb
  check (jsonb_typeof(known_topics) = 'object');
