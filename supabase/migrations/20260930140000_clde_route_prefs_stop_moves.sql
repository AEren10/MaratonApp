-- Ogrencinin rota duragini tasidigi/erteledigi gun: { "<logical_key>": "YYYY-MM-DD" }.
-- Algoritma dagitirken bunlara uyar; son soz ogrencinin.
alter table public.route_prefs
  add column if not exists stop_moves jsonb not null default '{}'::jsonb
  check (jsonb_typeof(stop_moves) = 'object');
