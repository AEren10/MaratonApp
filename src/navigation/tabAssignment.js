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
  SCREENS.ROADMAP,          // Rota Detay (PROGRAM'da da var; "Yol Haritası" DEGIL, o CURRICULUM_MAP)
  SCREENS.ROUTE_FULL,       // Rotanin tamami
  SCREENS.ROUTE_STOP_DETAIL, // Durak Detayi (tek durak)
  SCREENS.PLAN_DETAIL,      // Gunluk Plan (PROGRAM'da da var)
  SCREENS.TOPIC_DEBT,       // Konu Borcu (Rotanin tamami satiri; PROGRAM'da da var)
  SCREENS.PLAN_VS_ACTUAL,   // Soz ve gercek (Rota Detay satiri; PROGRAM'da da var)
  SCREENS.GAP_CLOSURE,      // Boslugu Kapatma Plani (Soz ve gercek butonu; PROGRAM'da da var)
  SCREENS.NET_FORECAST,     // Senaryolar
  SCREENS.RANK_SIMULATOR,   // Bolum Esigi
  SCREENS.EXAM_SIMULATOR,   // Deneme Provasi
  SCREENS.EXAM_DAY_PLAN,    // Sinav Gunu Plani (PROFIL'de de var)
  SCREENS.EXAM_RESULT,      // Sinav Sonucu (PROFIL'de de var)
  SCREENS.FORECAST_ACCURACY, // Tahmin Dogrulugu / Tahmin Sasti (PROFIL'de de var)
  SCREENS.SUMMARY,          // Gunun/Haftalik/Ayin Ozeti (period parametresi)
  SCREENS.WEEKLY_REVIEW,    // eski rota: SummaryScreen week (bildirim/derin baglanti)
  SCREENS.WEEKLY_TRIAL_REVIEW,
  SCREENS.HOW_IT_WORKS,     // (paylasimli)
];

export const PROGRAM_STACK = [
  SCREENS.ROADMAP,          // Rota Detay (paylasimli)
  // Tasarimda PROGRAM sekmesi secili: Rotanin tamami / Ayin Ozeti / Oncelikli
  // Konular bunlari openInTab ile PROGRAM sekmesinde acar (navigation/tabJump.js).
  SCREENS.CURRICULUM_MAP,   // Yol Haritasi: mufredat ilerlemesi (Rota Detay DEGIL)
  SCREENS.WEEK_PROGRAM,     // Program: gunun duraklari
  SCREENS.MONTH_PLAN,       // Aylik Plan
  SCREENS.CLASS_SCHEDULE,   // Haftalik ders programi (PROFIL'de de var)
  SCREENS.GAP_CLOSURE,      // (paylasimli)
  SCREENS.PLAN_DETAIL,      // (paylasimli)
  SCREENS.CALENDAR,         // Takvim ve Seri · Takvim
  SCREENS.TOPIC_STUDY,      // Konu Detayi
  SCREENS.SUBJECT_DETAIL,   // Ders Konulari (ANALIZ'de de var)
  SCREENS.TOPIC_DEBT,       // Konu Borcu
  SCREENS.PLAN_VS_ACTUAL,   // Plan vs Gercek
  SCREENS.SEARCH,           // Arama (konu + yanlis defteri)
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
  SCREENS.TERMS,
  SCREENS.DOCUMENT,         // Belge (gizlilik / kullanim sartlari metni)
  SCREENS.HOW_IT_WORKS,     // Neye Gore Oneriyoruz (ROTA'da da var)
  SCREENS.EXAM_DATE,        // Tarih Secici
  SCREENS.SUBSCRIPTION,     // Abonelik ve Hesap
  SCREENS.SUBSCRIPTION_CANCEL, // Abonelik Iptali (onay)
  SCREENS.ABOUT,
  SCREENS.DATA_EXPORT,      // Veri Indir
  SCREENS.ACCOUNT_DELETE,   // Hesap Silme (tam onay ekrani)
  SCREENS.GOALS,            // Hedef Duzenle
  SCREENS.CLASS_SCHEDULE,   // Ayarlar · Haftalik ders programi (paylasimli)
  SCREENS.SHARE_CARD,       // Paylasim Karti
  SCREENS.MILESTONE,        // Kilometre Tasi
  SCREENS.LEVEL,            // Seviye
  SCREENS.EXAM_DAY_PLAN,    // (paylasimli) Profil satiri
  SCREENS.EXAM_RESULT,      // (paylasimli)
  SCREENS.FORECAST_ACCURACY, // (paylasimli)
  SCREENS.PREMIUM,          // Maraton Pro (tam sunum)
  SCREENS.STUDY_HISTORY,    // Calisma Gecmisi
  SCREENS.STUDY_LOG,        // (ayni birlesik Calisma Gecmisi ekrani)
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
  SCREENS.EDIT_STUDY_LOG,   // Kaydi Duzenle (tam ekran form)
  SCREENS.ADD_TASK,
  SCREENS.ROUTE_PAUSE,      // Ara Verme (tam ekran onay)
  SCREENS.ROUTE_REDRAW,     // Rotayi Yeniden Ciz (tam ekran onay)
  SCREENS.PAYWALL,
  // Pro Onizleme her sekmedeki kilitli ozellikten aciliyor; tek bir
  // sekme stack'ine koymak sekme atlatirdi.
  SCREENS.PRO_PREVIEW,
  SCREENS.ACCESS_ENDED,     // Deneme Bitti (bir kez, erisim bitince)
  // Cevrimdisi Kuyruk global seritten (her sekmeden) aciliyor.
  SCREENS.OFFLINE_QUEUE,
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
