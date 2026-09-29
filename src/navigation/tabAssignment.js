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
  PROGRAM: SCREENS.CURRICULUM_MAP,
  ANALIZ: SCREENS.ANALYSIS,
  PROFIL: SCREENS.PROFILE,
});

// Sekme etiketleri tasarimdan: ROTA · PROGRAM · [+] · ANALIZ · PROFIL
// ROTA sekmesinin KOKU Ana Sayfa'dir (tasarimcinin kendi ifadesi).

export const ROTA_STACK = [
  SCREENS.ROADMAP,          // Rota: net rotasi, tahmin, siradaki duraklar
  SCREENS.ROUTE_FULL,       // Rotanin tamami
  SCREENS.ROUTE_STOP_DETAIL, // Durak detayi: bu durak neden verildi
  // Ana sayfanin grup dugmesi Lig/Gruplar'i bu sekmede acar; geri tusu
  // Ana sayfaya doner (eskiden Profil'e atiyordu). Alt ekranlari da burada.
  SCREENS.LEAGUE,
  SCREENS.FRIENDS,
  SCREENS.REFERRAL,
  SCREENS.ROUTE_COMPANION,
  SCREENS.CHALLENGE,
  SCREENS.EXAM_DATE,        // Hedefler -> Sinav tarihi (sekme degismez)
  SCREENS.DATA_EXPORT,      // Nasil calisir -> Verilerimi indir
  SCREENS.PLAN_DETAIL,      // Gunluk Plan (PROGRAM'da da var)
  SCREENS.CLASS_SCHEDULE,   // Haftalik ders programi (paylasimli)
  SCREENS.TOPIC_DEBT,       // Konu Borcu (Rotanin tamami satiri; PROGRAM'da da var)
  SCREENS.NET_FORECAST,     // Senaryolar
  SCREENS.RANK_SIMULATOR,   // Bolum Esigi
  SCREENS.EXAM_SIMULATOR,   // Deneme Provasi
  SCREENS.EXAM_DAY_PLAN,    // Sinav Gunu Plani (PROFIL'de de var)
  SCREENS.EXAM_RESULT,      // Sinav Sonucu (PROFIL'de de var)
  SCREENS.FORECAST_ACCURACY, // Tahmin Dogrulugu / Tahmin Sasti (PROFIL'de de var)
  SCREENS.STUDY_HISTORY,    // Calisma Gecmisi (PROFIL'de de var; haftalik grafik dokununca)
  SCREENS.STUDY_LOG,        // (ayni birlesik Calisma Gecmisi ekrani)
  SCREENS.SUMMARY,          // Gunun/Haftalik/Ayin Ozeti (period parametresi)
  SCREENS.WEEKLY_REVIEW,    // eski rota: SummaryScreen week (bildirim/derin baglanti)
  SCREENS.WEEKLY_TRIAL_REVIEW,
  SCREENS.HOW_IT_WORKS,     // (paylasimli)
  SCREENS.WRONG_NOTEBOOK,   // Defter (Home Defter karti)
  SCREENS.WRONG_DETAIL,     // Soru detayi
  SCREENS.QUICK_PRACTICE,
  SCREENS.REVIEW_SESSION,   // Tekrar baslat
  SCREENS.REVIEW_DONE,      // Tekrar bitti
  SCREENS.SWIPE_REVIEW,     // Hizli tekrar
  SCREENS.SHARE_CARD,       // Ozet -> Paylasim Karti
  SCREENS.WIDGET_GUIDE,     // Ana sayfa kesif ipucu -> Widget rehberi
  SCREENS.GOALS,            // Bolum Esigi -> Hedef Duzenle
  SCREENS.TOPIC_STUDY,      // Konu Detayi
  SCREENS.SUBJECT_DETAIL,   // Ders Konulari
];

export const PROGRAM_STACK = [
  SCREENS.EXAM_DATE,        // Hedefler -> Sinav tarihi (sekme degismez)
  SCREENS.DATA_EXPORT,      // Nasil calisir -> Verilerimi indir
  SCREENS.TRIAL_DETAIL,     // Ay gorunumunde denemeye basinca (sekme degismez)
  SCREENS.SUMMARY,          // Ay ozeti karti -> Ayin ozeti (ROTA'da da var)
  SCREENS.CLASS_SCHEDULE,   // Haftalik ders programi (PROFIL'de de var)
  SCREENS.PLAN_DETAIL,      // (paylasimli)
  SCREENS.TOPIC_STUDY,      // Konu Detayi
  SCREENS.SUBJECT_DETAIL,   // Ders Konulari (ANALIZ'de de var)
  SCREENS.TOPIC_DEBT,       // Konu Borcu
  SCREENS.SEARCH,           // Arama (konu + yanlis defteri)
  SCREENS.COMPARATIVE,      // Plan vs Gercek
  SCREENS.WRONG_NOTEBOOK,   // Defter
  SCREENS.WRONG_DETAIL,     // Arama -> Soru detayi
  SCREENS.REVIEW_SESSION,   // Defter -> Tekrar (eskiden NAVIGATE hatasi)
  SCREENS.REVIEW_DONE,
  SCREENS.SWIPE_REVIEW,
  SCREENS.QUICK_PRACTICE,
  SCREENS.TRIAL_COMPARE,    // Ay -> Deneme detayi -> Karsilastir
  SCREENS.SHARE_CARD,       // Paylasim Karti
  SCREENS.HOW_IT_WORKS,     // Nasil Calisir
  SCREENS.RANK_SIMULATOR,   // Bolum Esigi (paylasimli)
  SCREENS.NET_FORECAST,     // Senaryolar (paylasimli)
  SCREENS.GOALS,            // Hedef Duzenle (paylasimli)
];

export const ANALIZ_STACK = [
  SCREENS.TRIAL_RECORDS,    // Deneme Kayitlari (tasarim: filtreli, aya gruplu liste)
  SCREENS.SUBJECT_LIST,     // Konu Ilerlemesi
  SCREENS.TRIAL_COMPARE,    // Deneme Karsilastirma
  SCREENS.COMPARATIVE,      // Yayin / donem karsilastirmasi
  SCREENS.TRIAL_DETAIL,     // Deneme Detayi
  SCREENS.WEAK_AREAS,       // Oncelikli Konular
  SCREENS.NET_FORECAST,     // Net Tahmini
  SCREENS.EXAM_SIMULATOR,   // Simulasyon
  SCREENS.SUBJECT_DETAIL,   // (paylasimli)
  SCREENS.SUBJECT_ANALYSIS, // Analiz > ders karti -> Ders analizi
  SCREENS.TOPIC_STUDY,      // (paylasimli)
  SCREENS.WRONG_NOTEBOOK,   // Yanlis Defteri
  SCREENS.WRONG_DETAIL,
  SCREENS.REVIEW_SESSION,   // Tekrar
  SCREENS.REVIEW_DONE,      // Tekrar Bitti
  SCREENS.SWIPE_REVIEW,
  SCREENS.QUICK_PRACTICE,
  SCREENS.TOPIC_CARDS,
  SCREENS.CARD_DETAIL,
  SCREENS.SHARE_CARD,
  SCREENS.SEARCH,
];

export const PROFIL_STACK = [
  SCREENS.RANK_SIMULATOR,   // Ayarlar > Net esigi (eskiden NAVIGATE hatasi veriyordu)
  SCREENS.WRONG_NOTEBOOK,   // Profil > Yanlis defteri (sekme degismez)
  SCREENS.WRONG_DETAIL,
  SCREENS.REVIEW_SESSION,   // Defter -> Tekrar (eskiden NAVIGATE hatasi)
  SCREENS.REVIEW_DONE,
  SCREENS.SWIPE_REVIEW,
  SCREENS.QUICK_PRACTICE,
  SCREENS.SETTINGS,
  SCREENS.APPEARANCE,       // Gorunum
  SCREENS.NOTIFICATIONS,    // Rota haberleri
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
  SCREENS.WIDGET_GUIDE,     // Profil > Ana ekrana widget ekle
  SCREENS.STATS,            // Profil > Istatistiklerim
  SCREENS.MILESTONE,        // Kilometre Tasi
  SCREENS.LEVEL,            // Seviye
  SCREENS.EXAM_DAY_PLAN,    // (paylasimli) Profil satiri
  SCREENS.EXAM_RESULT,      // (paylasimli)
  SCREENS.FORECAST_ACCURACY, // (paylasimli)
  SCREENS.PREMIUM,          // Maraton Pro (tam sunum)
  SCREENS.STUDY_HISTORY,    // Calisma Gecmisi
  SCREENS.STUDY_LOG,        // (ayni birlesik Calisma Gecmisi ekrani)
  // Sosyal/Lig — Defter topluluk soru-cevap v1 disi; Lig ve arkadas
  // akislari canli urun alani olarak PROFIL stack'inde kalir.
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
  SCREENS.ADD_WRONG,        // '+' sayfasinin dort hedefi de tam ekran form
  SCREENS.EDIT_STUDY_LOG,   // Kaydi Duzenle (tam ekran form)
  SCREENS.ADD_TASK,
  SCREENS.ROUTE_PAUSE,      // Ara Verme (tam ekran onay)
  SCREENS.ROUTE_REDRAW,     // Rotayi Yeniden Ciz (tam ekran onay)
  SCREENS.PAYWALL,
  SCREENS.PAYMENT_CARD,
  SCREENS.PAYMENT_PROCESSING,
  SCREENS.PAYMENT_SUCCESS,
  SCREENS.PAYMENT_FAILED,
  // Pro Onizleme her sekmedeki kilitli ozellikten aciliyor; tek bir
  // sekme stack'ine koymak sekme atlatirdi.
  SCREENS.PRO_PREVIEW,
  SCREENS.LEGAL_DOC,        // Paywall -> Gizlilik / Kullanim kosullari
  SCREENS.ACCESS_ENDED,     // Deneme Bitti (bir kez, erisim bitince)
  SCREENS.FIRST_WEEK,
  SCREENS.FIRST_ROUTE_READY,
  SCREENS.STUDY_PROCESSED,
  SCREENS.ONE_WEEK_COMPLETED,
  SCREENS.EIGHTH_DAY_LOCK,
  // Cevrimdisi Kuyruk global seritten (her sekmeden) aciliyor.
  SCREENS.OFFLINE_QUEUE,
  SCREENS.EDIT_PROFILE,
  SCREENS.CHANGE_PASSWORD,
  SCREENS.EDIT_EMAIL,
  SCREENS.ONBOARDING,
  SCREENS.SETUP_INCOMPLETE,
  SCREENS.EXAM_SETUP,
  SCREENS.GOAL_SETUP,
  SCREENS.LEVEL_TEST,
  SCREENS.ROUTE_READY,
  SCREENS.NOTIFICATION_PERMISSION,
];

export const TAB_STACKS = Object.freeze({
  [TAB_KEYS.ROTA]: ROTA_STACK,
  [TAB_KEYS.PROGRAM]: PROGRAM_STACK,
  [TAB_KEYS.ANALIZ]: ANALIZ_STACK,
  [TAB_KEYS.PROFIL]: PROFIL_STACK,
});
