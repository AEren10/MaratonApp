-- Fix: CHECK constraints across multiple tables reject valid subject/exam_type keys.
-- Drop and recreate with all valid keys from curriculum.js and trialTypes.js.

-- =====================
-- WRONG QUESTIONS (curriculum keys from src/data/curriculum.js)
-- =====================
ALTER TABLE public.wrong_questions DROP CONSTRAINT IF EXISTS wrong_questions_subject_check;

ALTER TABLE public.wrong_questions ADD CONSTRAINT wrong_questions_subject_check CHECK (
  subject IN (
    'turkce', 'matematik', 'fizik', 'kimya', 'biyoloji',
    'tarih', 'cografya', 'felsefe', 'din',
    'ayt_matematik', 'ayt_fizik', 'ayt_kimya', 'ayt_biyoloji',
    'ayt_ea_matematik', 'ayt_tarih_ea', 'ayt_cografya_ea',
    'ayt_edebiyat', 'ayt_edebiyat_soz',
    'ayt_tarih_soz', 'ayt_cografya_soz', 'ayt_felsefe_soz',
    'ydt_ingilizce',
    'lgs_turkce', 'lgs_matematik', 'lgs_fen',
    'lgs_inkilap', 'lgs_din', 'lgs_ingilizce'
  )
);

-- =====================
-- STUDY LOGS (curriculum keys)
-- =====================
ALTER TABLE public.study_logs DROP CONSTRAINT IF EXISTS study_logs_subject_check;

ALTER TABLE public.study_logs ADD CONSTRAINT study_logs_subject_check CHECK (
  subject IN (
    'turkce', 'matematik', 'fizik', 'kimya', 'biyoloji',
    'tarih', 'cografya', 'felsefe', 'din',
    'ayt_matematik', 'ayt_fizik', 'ayt_kimya', 'ayt_biyoloji',
    'ayt_ea_matematik', 'ayt_tarih_ea', 'ayt_cografya_ea',
    'ayt_edebiyat', 'ayt_edebiyat_soz',
    'ayt_tarih_soz', 'ayt_cografya_soz', 'ayt_felsefe_soz',
    'ydt_ingilizce',
    'lgs_turkce', 'lgs_matematik', 'lgs_fen',
    'lgs_inkilap', 'lgs_din', 'lgs_ingilizce'
  )
);

-- =====================
-- PLAN TASKS (curriculum keys)
-- =====================
ALTER TABLE public.plan_tasks DROP CONSTRAINT IF EXISTS plan_tasks_subject_check;

ALTER TABLE public.plan_tasks ADD CONSTRAINT plan_tasks_subject_check CHECK (
  subject IN (
    'turkce', 'matematik', 'fizik', 'kimya', 'biyoloji',
    'tarih', 'cografya', 'felsefe', 'din',
    'ayt_matematik', 'ayt_fizik', 'ayt_kimya', 'ayt_biyoloji',
    'ayt_ea_matematik', 'ayt_tarih_ea', 'ayt_cografya_ea',
    'ayt_edebiyat', 'ayt_edebiyat_soz',
    'ayt_tarih_soz', 'ayt_cografya_soz', 'ayt_felsefe_soz',
    'ydt_ingilizce',
    'lgs_turkce', 'lgs_matematik', 'lgs_fen',
    'lgs_inkilap', 'lgs_din', 'lgs_ingilizce'
  )
);

-- =====================
-- TRIAL SUBJECTS (trial-specific keys from src/screens/trial/trialTypes.js)
-- Note: trial system uses DIFFERENT keys than curriculum (tyt_turkce vs turkce)
-- =====================
ALTER TABLE public.trial_subjects DROP CONSTRAINT IF EXISTS trial_subjects_subject_check;

ALTER TABLE public.trial_subjects ADD CONSTRAINT trial_subjects_subject_check CHECK (
  subject IN (
    'tyt_turkce', 'tyt_matematik', 'tyt_fen', 'tyt_sosyal',
    'ayt_matematik', 'ayt_fizik', 'ayt_kimya', 'ayt_biyoloji',
    'ayt_edebiyat', 'ayt_tarih1', 'ayt_cografya1',
    'ayt_tarih2', 'ayt_cografya2', 'ayt_felsefe', 'ayt_din'
  )
);

-- =====================
-- PROFILES EXAM TYPE (expanded to include all app-sent values)
-- =====================
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_exam_type_check;

ALTER TABLE public.profiles ADD CONSTRAINT profiles_exam_type_check CHECK (
  exam_type IN ('tyt', 'tyt_ayt', 'ayt_say', 'ayt_ea', 'ayt_soz', 'dil', 'lgs')
);
