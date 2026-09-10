const CONFIDENCE_LABELS = Object.freeze({
  high: "yüksek",
  medium: "orta",
  low: "başlangıç",
});

const IMPACT_BY_REASON = Object.freeze({
  REVIEW_DUE: "Net kaybını koruma",
  LOW_ACCURACY: "Zayıf alanda hızlı kazanım",
  NEGLECTED: "Unutma riskini düşürme",
  HIGH_EXAM_WEIGHT: "Sınav getirisi yüksek",
  PREREQUISITE: "Temeli güçlendirme",
  ROUTE_COMMITMENT: "Rota ritmini koruma",
});

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function effortLabel(questionCount) {
  const questions = Math.max(0, Math.round(Number(questionCount) || 0));
  const minutes = Math.max(5, Math.round(questions * 1.2));
  return `${questions} soru · ~${minutes} dk`;
}

function fallbackTitle(tier) {
  if (tier === "critical") return "Bugünün kritik hamlesi";
  if (tier === "high") return "Öncelikli çalışma";
  if (tier === "medium") return "Dengeli pekiştirme";
  return "Ritmi koruyan görev";
}

function fallbackImpact({ accuracy, daysSince }) {
  if (Number.isFinite(daysSince) && daysSince > 14) return "Uzun ara riskini azaltma";
  if (Number.isFinite(accuracy) && accuracy < 50) return "Doğruluk açığını kapatma";
  return "Çalışma ritmini sürdürme";
}

export function buildDailyAssignmentNarrative({
  reason,
  routeInsight = null,
  routeReasonCode = null,
  routeStop = null,
  questionCount = 0,
  tier = "low",
  accuracy = null,
  daysSince = null,
} = {}) {
  const confidence = routeInsight?.confidence || routeStop?.dataConfidence || null;
  const expectedNetGain = Number(routeInsight?.expectedNetGain) || 0;
  const source = routeStop ? "route" : "adaptive";
  const primaryReason = reason || "Bugünkü programa dengeli dağıtım için eklendi.";
  const impact = expectedNetGain > 0
    ? `~+${round(expectedNetGain)} net potansiyeli`
    : IMPACT_BY_REASON[routeReasonCode] || fallbackImpact({ accuracy, daysSince });

  return {
    source,
    title: routeStop ? "Rota motoru seçti" : fallbackTitle(tier),
    confidenceLabel: confidence ? CONFIDENCE_LABELS[confidence] || CONFIDENCE_LABELS.low : "veri topluyor",
    impact,
    effort: effortLabel(questionCount),
    bullets: [
      primaryReason,
      routeStop
        ? "Bu görev haftalık rotadaki sırayı bozmaz; tamamlanınca durak geçmişine işlenir."
        : "Rota durağı yoksa zayıflık, ihmal ve sınava kalan süre sinyalleriyle seçilir.",
      confidence
        ? `Kararın güven seviyesi ${CONFIDENCE_LABELS[confidence] || CONFIDENCE_LABELS.low}.`
        : "Daha fazla deneme ve çalışma kaydı geldikçe karar kalitesi artar.",
    ],
  };
}
