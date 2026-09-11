import { SCREENS } from "../constants/screens.js";

// SEKME ATAMASI — tasarimin "Tabbar bozulmaz" kurali.
//
// Tasarim (design/akis-denetimi.md 0.2) her ic ekranda tabbar'i cizik
// gosteriyor: Durak Detayi, Gun Detayi, Takvim, Seviye. Onceki yapida
// MAIN_TABS ile diger ekranlar kok stack'te KARDESTI, yani her push
// tabbar'i komple kapatiyordu.
//
// Cozum: her sekme kendi stack'i. Bir ekran birden fazla sekmeden
// aciliyorsa HER IKI stack'e de kaydedilir — boylece `navigate(name)`
// cagri yerini degistirmeden calisir ve kullanici sekmesinden cikmaz.
// (React Navigation ayni ekran adini farkli navigator'larda kabul eder.)
//
// ROOT = tabbar'in BILEREK gizlendigi tam ekran ortuler.

export const TAB_KEYS = Object.freeze({
  ROTA: SCREENS.HOME,
  PROGRAM: SCREENS.DAILY_PLAN,
  ANALIZ: SCREENS.ANALYSIS,
  PROFIL: SCREENS.PROFILE,
});

// Sekme etiketleri tasarimdan: ROTA · PROGRAM · [+] · ANALIZ · PROFIL
// ROTA sekmesinin KOKU Ana Sayfa'dir (tasarimcinin kendi ifadesi).

export const ROTA_STACK = [
  SCREENS.ROADMAP,          // Rota Detay  (PROGRAM'da da var: Yol Haritasi)
  SCREENS.PLAN_DETAIL,      // Durak Detayi (PROGRAM'da da var)
  SCREENS.NET_FORECAST,     // Senaryolar
  SCREENS.RANK_SIMULATOR,   // Bolum Esigi
  SCREENS.EXAM_SIMULATOR,   // Deneme Provasi
  SCREENS.SUMMARY,          // Gunun/Haftalik/Ayin Ozeti (period parametresi)
  SCREENS.WEEKLY_REVIEW,    // Haftalik Ozet (eski, SUMMARY week moduna gocecek)
  SCREENS.WEEKLY_TRIAL_REVIEW,
];

export const PROGRAM_STACK = [
  SCREENS.ROADMAP,          // Yol Haritasi (paylasimli)
  SCREENS.PLAN_DETAIL,      // (paylasimli)
  SCREENS.CALENDAR,         // Takvim ve Seri · Takvim
  SCREENS.TOPIC_STUDY,      // Konu Detayi
  SCREENS.SUBJECT_DETAIL,   // Ders Konulari (ANALIZ'de de var)
  SCREENS.TOPIC_DEBT,       // Konu Borcu
  SCREENS.PLAN_VS_ACTUAL,   // Plan vs Gercek
  SCREENS.COMPARATIVE,      // Plan vs Gercek
];

export const ANALIZ_STACK = [
  SCREENS.TRIAL_RECORDS,    // Deneme Kayitlari (tasarim: filtreli, aya gruplu liste)
  SCREENS.TRIAL_INSIGHTS,   // Deneme Icgorusu (ayri ekran, tasarim karsiligi yok)
  SCREENS.SUBJECT_LIST,     // Konu Ilerlemesi
  SCREENS.TRIAL_COMPARE,    // Deneme Karsilastirma
  SCREENS.TRIAL_DETAIL,     // Deneme Detayi
  SCREENS.WEAK_AREAS,       // Oncelikli Konular
  SCREENS.SUBJECT_DETAIL,   // (paylasimli)
  SCREENS.TOPIC_STUDY,      // (paylasimli)
  SCREENS.WRONG_NOTEBOOK,   // Yanlis Defteri
  SCREENS.ADD_WRONG,
  SCREENS.WRONG_DETAIL,
  SCREENS.REVIEW_SESSION,   // Tekrar
  SCREENS.REVIEW_DONE,      // Tekrar Bitti
  SCREENS.SWIPE_REVIEW,
  SCREENS.QUICK_PRACTICE,
  SCREENS.TOPIC_CARDS,
  SCREENS.CARD_DETAIL,
];

export const PROFIL_STACK = [
  SCREENS.SETTINGS,
  SCREENS.APPEARANCE,       // Gorunum
  SCREENS.NOTIFICATIONS_SETTINGS,
  SCREENS.PRIVACY,
  SCREENS.TERMS,            // Belge
  SCREENS.ABOUT,
  SCREENS.GOALS,            // Hedef Duzenle
  SCREENS.SHARE_CARD,       // Paylasim Karti
  SCREENS.STUDY_HISTORY,    // Calisma Gecmisi
  SCREENS.STUDY_LOG,
  // Sosyal — v1'de yeni is yapilmiyor, mevcut ekranlar erisilebilir kaliyor.
  SCREENS.LEAGUE,
  SCREENS.FRIENDS,
  SCREENS.REFERRAL,
  SCREENS.ROUTE_COMPANION,
  SCREENS.CHALLENGE,
];

// Tabbar'in BILEREK gizlendigi ekranlar (tasarimda tam ekran ortu):
// Calisma Oturumu, Oturum Bitti, Durak Ekle, Paywall, kurulum tekrar girisi.
export const ROOT_ONLY = [
  SCREENS.STUDY_TIMER,
  SCREENS.STUDY_SAVE,
  SCREENS.STUDY_SUMMARY,
  SCREENS.TRIAL_ENTRY,
  SCREENS.TRIAL_SUMMARY,
  SCREENS.ADD_STUDY,
  SCREENS.ADD_TASK,
  SCREENS.PAYWALL,
  SCREENS.EDIT_PROFILE,
  SCREENS.CHANGE_PASSWORD,
  SCREENS.EDIT_EMAIL,
  SCREENS.ONBOARDING,
  SCREENS.EXAM_SETUP,
  SCREENS.GOAL_SETUP,
];

export const TAB_STACKS = Object.freeze({
  [TAB_KEYS.ROTA]: ROTA_STACK,
  [TAB_KEYS.PROGRAM]: PROGRAM_STACK,
  [TAB_KEYS.ANALIZ]: ANALIZ_STACK,
  [TAB_KEYS.PROFIL]: PROFIL_STACK,
});
