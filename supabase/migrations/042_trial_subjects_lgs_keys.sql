-- 042: LGS deneme girisi tamamen kirikti (2026-08-18 audit)
--
-- Canli DB'de gercek bir oturumla test edildi: trial_subjects tablosuna
-- 6 LGS ders anahtarinin HICBIRI yazilamiyor (23514 check constraint ihlali).
--
-- Akis soyle patliyordu:
--   1) trials satiri basariyla olusuyor
--   2) trial_subjects insert'i CHECK'e takiliyor
--   3) addTrial rollback yapip trials satirini siliyor ve hata firlatiyor
--   -> LGS ogrencisi tek bir deneme bile kaydedemiyor.
--
-- Kok sebep: migration 022 ayni duzeltmeyi wrong_questions ve study_logs
-- tablolarina yapmis ama trial_subjects listesinde LGS anahtarlarini atlamis.
-- Anahtarlar src/screens/trial/trialTypes.js -> getLGSSubjects ile birebir.

ALTER TABLE public.trial_subjects DROP CONSTRAINT IF EXISTS trial_subjects_subject_check;

ALTER TABLE public.trial_subjects ADD CONSTRAINT trial_subjects_subject_check CHECK (
  subject IN (
    -- TYT
    'tyt_turkce', 'tyt_matematik', 'tyt_fen', 'tyt_sosyal',
    -- AYT Sayisal
    'ayt_matematik', 'ayt_fizik', 'ayt_kimya', 'ayt_biyoloji',
    -- AYT Esit Agirlik / Sozel
    'ayt_edebiyat', 'ayt_tarih1', 'ayt_cografya1',
    'ayt_tarih2', 'ayt_cografya2', 'ayt_felsefe', 'ayt_din',
    -- LGS (022'de atlanmisti)
    'lgs_turkce', 'lgs_matematik', 'lgs_fen',
    'lgs_inkilap', 'lgs_din', 'lgs_ingilizce'
  )
);
