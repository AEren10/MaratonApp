const REASON_LABELS = Object.freeze({
  REVIEW_DUE: "Tekrar sinyali",
  LOW_ACCURACY: "Zayıf alan",
  NEGLECTED: "İhmal edilen",
  HIGH_EXAM_WEIGHT: "Yüksek getiri",
  PREREQUISITE: "Ön koşul",
  ROUTE_COMMITMENT: "Rota dengesi",
});

function chip(key, label, tone) {
  return label ? { key, label, tone } : null;
}

function reasonLabel(reasonCode) {
  return REASON_LABELS[reasonCode] || null;
}

export function buildRouteActionInsightChips(action = {}) {
  return [
    chip("reason", reasonLabel(action.reasonCode), "reason"),
    chip("confidence", action.confidenceLabel ? `Güven ${action.confidenceLabel}` : null, "confidence"),
    chip("effort", action.effort, "effort"),
    chip("impact", action.impact, "impact"),
    chip("review", action.isReview ? "Tekrar durağı" : null, "review"),
  ].filter(Boolean).slice(0, 4);
}
