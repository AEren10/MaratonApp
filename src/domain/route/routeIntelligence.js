export const ROUTE_INTELLIGENCE_VERSION = "route-intelligence-v1";
export const ROUTE_STRATEGY_VERSION = "route-strategy-v1";

const CONFIDENCE_WEIGHT = { high: 1, medium: 0.7, low: 0.35 };

const REASON_TEXT = {
  REVIEW_DUE: "Unutma eğrisi yükseldi; kısa tekrar neti korur.",
  LOW_ACCURACY: "Son denemelerde zayıf kalan alana denk geliyor.",
  NEGLECTED: "Uzun süredir temas edilmediği için öne alındı.",
  HIGH_EXAM_WEIGHT: "Sınavda soru payı yüksek olduğu için getirisi iyi.",
  PREREQUISITE: "Sonraki konuların temelini güçlendiren durak.",
  ROUTE_COMMITMENT: "Haftalık rota dengesini tamamlayan sıradaki iş.",
};

const RISK_TRACE_TEXT = {
  route_overflow: "süre baskısı var, rota tempo veya revizyon isteyebilir",
  capacity_low_confidence: "tempo verisi az, motor güvenli yedek kapasiteye yaslanıyor",
  topic_signal_sparse: "konu verisi seyrek, yeni kayıtlarla karar keskinleşecek",
  prerequisite_debt: "temel sıra hassas, ön koşullar korunmalı",
  study_log_unavailable: "çalışma kayıtları okunamadı, kapasite tahmini sınırlı",
};

const RISK_LEVEL_WEIGHT = { high: 3, medium: 2, low: 1 };

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function round(value, digits = 2) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function confidenceLabel(score) {
  if (score >= 75) return "high";
  if (score >= 50) return "medium";
  return "low";
}

function capacityScore(capacity = {}) {
  if (capacity.confidence === "high") return 35;
  if (capacity.confidence === "medium") return 26;
  if (capacity.source === "history") return 20;
  return 14;
}

function itemSignalScore(items = []) {
  if (!items.length) return 8;
  const total = items.reduce(
    (sum, item) => sum + (CONFIDENCE_WEIGHT[item.dataConfidence] || 0.35),
    0,
  );
  return round((total / items.length) * 25, 1);
}

function feasibilityScore({ overflow = [], shortfall = {}, capacity = {} }) {
  if (!overflow.length) return 20;
  const weekly = Math.max(1, Number(capacity.questionsPerWeek) || 1);
  const pressure = Number(shortfall.extraQuestionsPerWeek || 0) / weekly;
  return clamp(Math.round(20 - pressure * 40), 0, 12);
}

function forecastSignalScore({ weakSubjectKeys = [], daysLeft = null }) {
  let score = 0;
  score += weakSubjectKeys.length ? 10 : 4;
  score += daysLeft != null ? 10 : 4;
  return score;
}

function dominantReason(stop = {}) {
  const codes = stop.reasonCodes || [];
  return codes.find((code) => REASON_TEXT[code]) || codes[0] || "ROUTE_COMMITMENT";
}

function sumStopCost(stops = [], field) {
  return stops.reduce((sum, stop) => sum + (Number(stop.cost?.[field]) || 0), 0);
}

function firstWeekStats(weeks = []) {
  const stops = weeks[0]?.stops || [];
  return {
    stopCount: stops.length,
    questions: Math.round(sumStopCost(stops, "questions")),
    minutes: Math.round(sumStopCost(stops, "minutes")),
    reviewStops: stops.filter((stop) => stop.isReview).length,
    weakStops: stops.filter((stop) => dominantReason(stop) === "LOW_ACCURACY").length,
  };
}

function pressureLabel({ overflow = [], shortfall = {}, capacity = {} }) {
  if (!overflow.length) return "dengeli";
  const weekly = Math.max(1, Number(capacity.questionsPerWeek) || 1);
  const pressure = Number(shortfall.extraQuestionsPerWeek || 0) / weekly;
  if (pressure >= 0.35) return "çok sıkışık";
  if (pressure >= 0.15) return "sıkışık";
  return "hafif sıkışık";
}

function focusAreas(items = []) {
  return [...items]
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => ({
      subject: item.subject,
      subjectLabel: item.subjectLabel || item.subject,
      topic: item.topic,
      reasonCode: dominantReason(item),
      reasonText: REASON_TEXT[dominantReason(item)] || REASON_TEXT.ROUTE_COMMITMENT,
      confidence: item.dataConfidence || "low",
      expectedNetGain: round(Number(item.scoreComponents?.expectedNetGain) || 0),
    }));
}

function strategyHeadline({ overflow = [], reviewItems = 0, weakSubjectKeys = [] }) {
  if (overflow.length) return "Hedefe yetişmek için tempo kararı gerekiyor";
  if (reviewItems > 0) return "İlk hafta neti koruyan tekrarlarla açılıyor";
  if (weakSubjectKeys.length) return "Zayıf sinyaller ilk haftaya çekildi";
  return "Müfredat sürdürülebilir haftalara bölündü";
}

function qualityItem(key, status, label, detail) {
  return { key, status, label, detail };
}

function buildRouteQualityChecks({
  capacity = {},
  weeks = [],
  overflow = [],
  weakSubjectKeys = [],
  lowSignalItems = 0,
  neglectedItems = 0,
  reviewItems = 0,
} = {}) {
  const firstWeek = firstWeekStats(weeks);
  const firstWeekReasons = new Set((weeks[0]?.stops || []).map(dominantReason));
  const checks = [
    firstWeek.stopCount > 0
      ? qualityItem(
        "first_week_action",
        "ok",
        "İlk hafta aksiyonu",
        `${firstWeek.stopCount} durak bugünden çalışılabilir sıraya girdi.`,
      )
      : qualityItem(
        "first_week_action",
        "block",
        "İlk hafta aksiyonu",
        "İlk hafta boş; hedef, tarih veya müfredat sinyali tamamlanmalı.",
      ),
    capacity.confidence === "low"
      ? qualityItem(
        "capacity_fit",
        "warn",
        "Tempo uyumu",
        "Kişisel tempo verisi az; motor hedef tempoya güvenli yedekle yaslanıyor.",
      )
      : qualityItem(
        "capacity_fit",
        "ok",
        "Tempo uyumu",
        `${Math.round(Number(capacity.questionsPerWeek) || 0)} soru/hafta bütçesi kullanıldı.`,
      ),
    overflow.length
      ? qualityItem(
        "deadline_fit",
        "warn",
        "Sınava sığma",
        `${overflow.length} durak revizyon veya tempo artışı isteyebilir.`,
      )
      : qualityItem("deadline_fit", "ok", "Sınava sığma", "Plan mevcut süreye sığıyor."),
    weakSubjectKeys.length && firstWeekReasons.has("LOW_ACCURACY")
      ? qualityItem("weak_signal", "ok", "Zayıf alan", "Zayıf sinyal ilk haftaya çekildi.")
      : weakSubjectKeys.length
        ? qualityItem("weak_signal", "warn", "Zayıf alan", "Zayıf alan var; bütçe veya sıra nedeniyle ilk hafta dışına kayabilir.")
        : qualityItem("weak_signal", "ok", "Zayıf alan", "Belirgin zayıf alan sinyali yok."),
    neglectedItems > 0
      ? qualityItem(
        "recency_balance",
        "ok",
        "Veri tazeliği",
        `${neglectedItems} uzun ara verilen konu rotada görünür sebep olarak işlendi.`,
      )
      : qualityItem("recency_balance", "ok", "Veri tazeliği", "Uzun ara verilen konu sinyali görünmüyor."),
    reviewItems > 0
      ? qualityItem("review_balance", "ok", "Tekrar dengesi", `${reviewItems} tekrar durağı unutma riskini düşürmek için rotaya eklendi.`)
      : qualityItem("review_balance", "ok", "Tekrar dengesi", "Tekrar borcu görünmüyor."),
  ];

  if (lowSignalItems > Math.max(3, (weeks.length || 1))) {
    checks.push(qualityItem(
      "data_depth",
      "warn",
      "Veri derinliği",
      "Bazı duraklar az veriyle seçildi; deneme ve çalışma kaydı geldikçe karar keskinleşir.",
    ));
  }

  return checks;
}

function buildDecisionTrace({ topFocus = [], pressure, score, risks = [] }) {
  const focus = topFocus[0];
  const risk = risks[0];
  const riskText = RISK_TRACE_TEXT[risk?.code] || "ek kontrol isteyen sinyal var";

  return [
    focus
      ? `${focus.subjectLabel} / ${focus.topic} ilk odak çünkü ${focus.reasonText}`
      : "İlk odak için yeterli konu sinyali yok.",
    `Haftalık yük ${pressure}; kalite güveni ${confidenceLabel(score)}.`,
    risk
      ? `Ana dikkat noktası: ${riskText}.`
      : "Kritik rota riski görünmüyor.",
  ];
}

function rankRisks(risks = []) {
  return [...risks].sort((a, b) => (
    (RISK_LEVEL_WEIGHT[b.level] || 0) - (RISK_LEVEL_WEIGHT[a.level] || 0)
  ));
}

function buildRouteStrategy({
  capacity = {},
  items = [],
  weeks = [],
  overflow = [],
  shortfall = {},
  weakSubjectKeys = [],
  reviewItems = 0,
} = {}) {
  const firstWeek = firstWeekStats(weeks);
  const pressure = pressureLabel({ overflow, shortfall, capacity });
  const topFocus = focusAreas(items);

  return {
    version: ROUTE_STRATEGY_VERSION,
    headline: strategyHeadline({ overflow, reviewItems, weakSubjectKeys }),
    firstWeek,
    pacing: {
      pressure,
      weeklyQuestions: Math.round(Number(capacity.questionsPerWeek) || 0),
      weeklyMinutes: Math.round(Number(capacity.minutesPerWeek) || 0),
      extraQuestionsPerWeek: Math.round(Number(shortfall.extraQuestionsPerWeek) || 0),
    },
    focusAreas: topFocus,
    narrative: firstWeek.stopCount > 0
      ? `İlk hafta ${firstWeek.stopCount} durak, ${firstWeek.questions} soru ve yaklaşık ${firstWeek.minutes} dakika ile başlıyor.`
      : "İlk hafta için durak çıkmadı; hedef, tarih veya müfredat verisi tamamlanmalı.",
    qualityHeadline: `${pressure} tempo · ${topFocus.length} odak alan`,
  };
}

export function explainRouteStop(stop = {}) {
  const reasonCode = dominantReason(stop);
  const components = stop.scoreComponents || {};
  const confidence = stop.dataConfidence || "low";
  return {
    reasonCode,
    reasonText: REASON_TEXT[reasonCode] || REASON_TEXT.ROUTE_COMMITMENT,
    confidence,
    expectedNetGain: round(Number(components.expectedNetGain) || 0),
    effortQuestions: Number(components.effortQuestions) || Number(stop.cost?.questions) || 0,
    sequenceReadiness: components.sequenceReadiness ?? null,
  };
}

export function attachStopInsights(weeks = []) {
  return weeks.map((week) => ({
    ...week,
    stops: (week.stops || []).map((stop) => ({
      ...stop,
      insight: explainRouteStop(stop),
    })),
  }));
}

export function buildRouteIntelligence({
  capacity = {},
  items = [],
  weeks = [],
  overflow = [],
  shortfall = {},
  weakSubjectKeys = [],
  daysLeft = null,
  studyLogDataState = "ready",
} = {}) {
  const lowSignalItems = items.filter((item) => item.dataConfidence === "low").length;
  const prerequisiteItems = items.filter((item) => item.unpreparedBefore > 0).length;
  const reviewItems = items.filter((item) => item.isReview).length;
  const neglectedItems = items.filter((item) => Number(item.neglectedDays) >= 14).length;

  const score = clamp(Math.round(
    capacityScore(capacity)
    + itemSignalScore(items)
    + feasibilityScore({ overflow, shortfall, capacity })
    + forecastSignalScore({ weakSubjectKeys, daysLeft }),
  ), 0, 100);

  const risks = [];
  if (studyLogDataState === "error" || capacity.missingData) {
    risks.push({ code: "study_log_unavailable", level: "high" });
  }
  if (capacity.confidence === "low") {
    risks.push({ code: "capacity_low_confidence", level: "medium" });
  }
  if (overflow.length) {
    risks.push({
      code: "route_overflow",
      level: shortfall.extraQuestionsPerWeek > capacity.questionsPerWeek * 0.25
        ? "high" : "medium",
      extraQuestionsPerWeek: shortfall.extraQuestionsPerWeek || 0,
    });
  }
  if (lowSignalItems > Math.max(3, items.length * 0.35)) {
    risks.push({ code: "topic_signal_sparse", level: "medium" });
  }
  if (prerequisiteItems > 0) {
    risks.push({ code: "prerequisite_debt", level: "low", count: prerequisiteItems });
  }
  const rankedRisks = rankRisks(risks);

  const nextBestAction = overflow.length
    ? "Haftalık hedefi artır veya düşük getirili durakları sonraki revizyona bırak."
    : reviewItems > 0
      ? "İlk hafta tekrar duraklarını bitir; net kaybını hızlıca kilitler."
      : "Bu haftanın aktif durağını tamamla ve rotayı yeni veriye göre güncelle.";

  const qualityChecks = buildRouteQualityChecks({
    capacity,
    weeks,
    overflow,
    weakSubjectKeys,
    lowSignalItems,
    neglectedItems,
    reviewItems,
  });
  const strategy = buildRouteStrategy({
    capacity,
    items,
    weeks,
    overflow,
    shortfall,
    weakSubjectKeys,
    reviewItems,
  });

  return {
    version: ROUTE_INTELLIGENCE_VERSION,
    confidence: confidenceLabel(score),
    confidenceScore: score,
    nextBestAction,
    strategy,
    qualityChecks,
    decisionTrace: buildDecisionTrace({
      topFocus: strategy.focusAreas,
      pressure: strategy.pacing.pressure,
      score,
      risks: rankedRisks,
    }),
    signals: {
      capacitySource: capacity.source || "unknown",
      capacityConfidence: capacity.confidence || "low",
      plannedWeeks: weeks.length,
      pendingStops: items.length,
      reviewStops: reviewItems,
      lowSignalStops: lowSignalItems,
      neglectedStops: neglectedItems,
      prerequisiteStops: prerequisiteItems,
    },
    risks: rankedRisks,
  };
}
