const CONFIDENCE_LABELS = Object.freeze({
  high: "yüksek",
  medium: "orta",
  low: "başlangıç",
});

const IMPACT_BY_REASON = Object.freeze({
  REVIEW_DUE: "Net kaybını koruma",
  LOW_ACCURACY: "Zayıf alanda hızlı kazanım",
  NET_DROP: "Düşüşü erken yakalama",
  NEGLECTED: "Unutma riskini düşürme",
  HIGH_EXAM_WEIGHT: "Sınav getirisi yüksek",
  PREREQUISITE: "Temeli güçlendirme",
  ROUTE_COMMITMENT: "Rota ritmini koruma",
});

const SIGNAL_LABELS = Object.freeze({
  REVIEW_DUE: "tekrar zamanı",
  LOW_ACCURACY: "düşük doğruluk",
  NET_DROP: "net düşüşü",
  NEGLECTED: "uzun ara",
  HIGH_EXAM_WEIGHT: "yüksek katsayı",
  PREREQUISITE: "ön koşul",
  ROUTE_COMMITMENT: "rota sırası",
});

function round(value, digits = 1) {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function roundMinutes(value) {
  const minutes = Math.round(Number(value) || 0);
  return minutes > 0 ? Math.max(5, minutes) : null;
}

export function estimateAssignmentMinutes({ questionCount = 0, routeStop = null } = {}) {
  const questions = Math.max(0, Math.round(Number(questionCount) || 0));
  const stopQuestions = Number(routeStop?.cost?.questions ?? routeStop?.questions ?? 0);
  const stopMinutes = Number(routeStop?.cost?.minutes ?? routeStop?.minutes ?? 0);
  if (questions > 0 && stopQuestions > 0 && stopMinutes > 0) {
    return roundMinutes(stopMinutes * (questions / stopQuestions));
  }
  if (stopMinutes > 0) return roundMinutes(stopMinutes);
  return roundMinutes(questions * 1.2) || 5;
}

function effortLabel(questionCount, estimatedMinutes) {
  const questions = Math.max(0, Math.round(Number(questionCount) || 0));
  return `${questions} soru · ~${estimatedMinutes} dk`;
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

function buildSignalChips({ routeReasonCode, routeStop, routeAllocation, accuracy, daysSince }) {
  const chips = [];
  const reason = SIGNAL_LABELS[routeReasonCode];
  if (reason) chips.push(reason);
  if (routeStop?.status === "active" || routeStop?.lifecycleStatus === "active"
      || routeStop?.lifecycle_status === "active") {
    chips.push("aktif durak");
  }
  if (Number.isFinite(daysSince) && daysSince >= 10) chips.push(`${daysSince} gün ara`);
  if (Number.isFinite(accuracy) && accuracy < 60) chips.push(`%${Math.round(accuracy)} doğruluk`);
  if (routeAllocation?.cappedByRouteCost) chips.push("yük tavana yakın");
  return [...new Set(chips)].slice(0, 4);
}

function decisionSummary({ source, signalChips, confidenceLabel }) {
  const signalText = signalChips.length
    ? signalChips.join(" + ")
    : source === "route" ? "rota sırası" : "günlük denge";
  return `${signalText}; güven ${confidenceLabel}.`;
}

export function buildDailyAssignmentNarrative({
  reason,
  routeInsight = null,
  routeReasonCode = null,
  routeStop = null,
  routeAllocation = null,
  questionCount = 0,
  tier = "low",
  accuracy = null,
  daysSince = null,
} = {}) {
  const confidence = routeInsight?.confidence || routeStop?.dataConfidence || null;
  const expectedNetGain = Number(routeInsight?.expectedNetGain) || 0;
  const source = routeStop ? "route" : "adaptive";
  const primaryReason = reason || "Bugünkü programa dengeli dağıtım için eklendi.";
  const estimatedMinutes = estimateAssignmentMinutes({ questionCount, routeStop });
  const confidenceLabel = confidence
    ? CONFIDENCE_LABELS[confidence] || CONFIDENCE_LABELS.low
    : "veri topluyor";
  const signalChips = buildSignalChips({
    routeReasonCode, routeStop, routeAllocation, accuracy, daysSince,
  });
  const impact = expectedNetGain > 0
    ? `~+${round(expectedNetGain)} net potansiyeli`
    : IMPACT_BY_REASON[routeReasonCode] || fallbackImpact({ accuracy, daysSince });

  return {
    source,
    title: routeStop ? "Rota motoru seçti" : fallbackTitle(tier),
    confidenceLabel,
    impact,
    estimatedMinutes,
    effort: effortLabel(questionCount, estimatedMinutes),
    signalChips,
    decisionSummary: decisionSummary({ source, signalChips, confidenceLabel }),
    bullets: [
      primaryReason,
      signalChips.length
        ? `Karar sinyalleri: ${signalChips.join(", ")}.`
        : "Karar sinyalleri dengeli dağıtım ve günlük hedefe göre tartıldı.",
      routeStop
        ? "Bu görev haftalık rotadaki sırayı bozmaz; tamamlanınca durak geçmişine işlenir."
        : "Rota durağı yoksa zayıflık, ihmal ve sınava kalan süre sinyalleriyle seçilir.",
      confidence
        ? `Kararın güven seviyesi ${CONFIDENCE_LABELS[confidence] || CONFIDENCE_LABELS.low}.`
        : "Daha fazla deneme ve çalışma kaydı geldikçe karar kalitesi artar.",
    ],
  };
}
