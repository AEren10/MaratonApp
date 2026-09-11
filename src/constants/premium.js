// Premium feature keys — used by PremiumContext.checkFeature()
export const PREMIUM_FEATURES = {
  unlimited_trials: {
    key: "unlimited_trials",
    title: "Sınırsız Deneme Girişi",
    desc: "Ayda sınırsız deneme sonucu gir ve detaylı analiz al",
  },
  unlimited_wrongs: {
    key: "unlimited_wrongs",
    title: "Sınırsız Yanlış Defteri",
    desc: "Tüm yanlış sorularını kaydet, sınır olmadan",
  },
  ai_suggestions: {
    key: "ai_suggestions",
    title: "AI Çalışma Önerileri",
    desc: "Yapay zeka destekli kişisel çalışma planı",
  },
  advanced_reports: {
    key: "advanced_reports",
    title: "Gelişmiş Haftalık Raporlar",
    desc: "Trend analizi ve detaylı ilerleme raporları",
  },
  exam_simulator: {
    key: "exam_simulator",
    title: "Sınav Simülatörü",
    desc: "Gerçekçi sınav ortamı ve sıralama tahmini",
  },
  rank_simulator: {
    key: "rank_simulator",
    title: "Sıralama Simülatörü",
    desc: "Net-sıralama hesaplama ve hedef analizi",
  },
  unlimited_challenges: {
    key: "unlimited_challenges",
    title: "Sınırsız Meydan Okuma",
    desc: "Arkadaşlarınla sınırsız yarışmaya katıl",
  },
  detailed_roadmap: {
    key: "detailed_roadmap",
    title: "Kişisel Rota",
    desc: "Bugünün durakları, tahmin bandı ve tempo senaryoları",
  },
  league_priority: {
    key: "league_priority",
    title: "Lig Önceliği",
    desc: "Lig sıralamasında premium rozet ve öncelik",
  },
  deep_analytics: {
    key: "deep_analytics",
    title: "Derinlemesine Analiz",
    desc: "Ders bazlı detaylı istatistik ve zayıf alan analizi",
  },
  ad_free: {
    key: "ad_free",
    title: "Reklamsız Deneyim",
    desc: "Hiçbir reklam görmeden çalış",
  },
  custom_reminders: {
    key: "custom_reminders",
    title: "Özel Hatırlatmalar",
    desc: "Kişisel çalışma hatırlatıcı zamanlayıcı",
  },
};

export const FREE_LIMITS = {
  trials_per_month: 4,
  // Yanlış defteri yeni ürün sınırında ücretsiz ve sınırsızdır.
  wrong_entries: Number.POSITIVE_INFINITY,
  active_challenges: 1,
};

// İstemci bu kataloğu yalnızca görünüm ve fail-closed kararları için kullanır.
// Asıl erişim kararı get_product_access_snapshot/create_trial RPC'lerindedir.
export const PRODUCT_FEATURES = {
  route: "route",
  route_forecast: "routeForecast",
  route_scenarios: "routeScenarios",
  route_priorities: "routePriorities",
  trial_compare: "trialCompare",
  ocr: "ocr",
  monthly_report: "monthlyReport",
  topic_progress: "topicProgress",
  department_threshold: "departmentThreshold",
};

// Tasarimin 8 paywall tetik noktasinin hepsinin artik sunucuda AYRI
// anahtari var: "konu ilerlemesi" (topicProgress) ve "hedef bolum
// karsilastirmasi" (departmentThreshold) 2026-09-11'de eklendi.
//
// CANLI DOGRULAMA (2026-09-11, SQL editoru, proje zrycqfehhyjrsujmajpf):
// private.get_product_access_snapshot ve private.has_feature_access
// ikisi de yeni anahtarlari iceriyor; 'first_week OR pro' sayisi 9'dan
// 11'e cikti (eklenen tam iki ozellik).
// Migration: supabase/migrations/20260911130000_product_features_extend.sql
//
// Onceden bu ikisi routePriorities'e eslenmisti: canAccessProductFeature
// fail-closed calisiyor, sunucu anahtari dondurmezse ozellik premium
// kullanici icin de kapali kalirdi. Artik gercek anahtarlar kullaniliyor,
// yani sunucu bu ikisini ayri bir kurala baglamak isterse istemci
// tarafinda degisiklik gerekmiyor.


export const PREMIUM_TO_PRODUCT_FEATURE = {
  detailed_roadmap: PRODUCT_FEATURES.route,
  ai_suggestions: PRODUCT_FEATURES.route_priorities,
  advanced_reports: PRODUCT_FEATURES.monthly_report,
  rank_simulator: PRODUCT_FEATURES.route_forecast,
  deep_analytics: PRODUCT_FEATURES.route_priorities,
};

// Fiyatlar tasarimdan (Premium + Abonelik artboardlari): aylik ₺149,
// yillik ₺1.068 (= ₺89/ay, %40 avantaj), 7 gun ucretsiz deneme.
// Bunlar YEDEK gosterim degerleri — PaywallScreen magaza paketleri
// geldiginde uzerine yazar. Nihai kaynak App Store / Play Store urunleri.
export const FREE_TRIAL_DAYS = 7;

export const PLANS = [
  { id: "monthly", price: "₺149", period: "ay", popular: false },
  {
    id: "yearly",
    price: "₺1.068",
    period: "yıl",
    popular: true,
    savings: "%40",
    monthlyEquiv: "₺89",
  },
];

// Ordered list for paywall display
export const PREMIUM_FEATURE_LIST = [
  PREMIUM_FEATURES.unlimited_trials,
  PREMIUM_FEATURES.unlimited_wrongs,
  PREMIUM_FEATURES.deep_analytics,
  PREMIUM_FEATURES.exam_simulator,
  PREMIUM_FEATURES.rank_simulator,
  PREMIUM_FEATURES.advanced_reports,
  PREMIUM_FEATURES.detailed_roadmap,
  PREMIUM_FEATURES.ai_suggestions,
  PREMIUM_FEATURES.unlimited_challenges,
  PREMIUM_FEATURES.ad_free,
  PREMIUM_FEATURES.custom_reminders,
];
