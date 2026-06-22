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
    title: "Detaylı Yol Haritası",
    desc: "Konu bazlı ilerleme ve öneri sistemi",
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
  trials_per_month: 3,
  wrong_entries: 30,
  active_challenges: 1,
};

export const PLANS = [
  { id: "monthly", price: "₺79.99", period: "ay", popular: false },
  {
    id: "yearly",
    price: "₺549.99",
    period: "yıl",
    popular: true,
    savings: "42%",
    monthlyEquiv: "₺45.83",
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
