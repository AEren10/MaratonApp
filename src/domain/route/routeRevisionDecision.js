export const ROUTE_REVISION_DECISION_VERSION = "route-revision-decision-v1";

function hasStructuralChange(counts = {}) {
  return (counts.added || 0) > 0 || (counts.removed || 0) > 0;
}

function hasOrderChange(counts = {}) {
  return (counts.moved || 0) > 0;
}

function hasEffortChange(counts = {}) {
  return (counts.resized || 0) > 0;
}

function urgencyFor(counts = {}, totalChanges = 0) {
  if (!totalChanges) return "none";
  if ((counts.removed || 0) > 0) return "high";
  if ((counts.added || 0) >= 2 || totalChanges >= 4) return "high";
  if (hasStructuralChange(counts)) return "medium";
  if (hasOrderChange(counts) && hasEffortChange(counts)) return "medium";
  return "low";
}

function headlineFor(urgency, counts = {}) {
  if (urgency === "none") return "Revizyon gerekmiyor";
  if ((counts.removed || 0) > 0) return "Rota dar odakla yenilenmeli";
  if ((counts.added || 0) > 0) return "Yeni odak rotaya alınmalı";
  if ((counts.moved || 0) > 0) return "Sıra küçük bir ayar istiyor";
  return "Çalışma yükü ayarlanmalı";
}

function reasonFor(urgency, counts = {}) {
  if (urgency === "none") {
    return "Yeni veri mevcut rotayı değiştirecek kadar güçlü değil; plana devam edilebilir.";
  }
  if ((counts.removed || 0) > 0) {
    return "Bazı duraklar yeni sinyale göre verimsiz kaldı; eski ilerleme korunarak rota sadeleşmeli.";
  }
  if ((counts.added || 0) > 0) {
    return "Yeni güçlü sinyal rotaya girdi; kullanıcıya sebebiyle birlikte gösterilmeli.";
  }
  if ((counts.moved || 0) > 0) {
    return "Duraklar aynı kalıyor ama öncelik sırası yeni veriye göre yumuşakça değişiyor.";
  }
  return "Duraklar korunuyor; soru/dakika yükü yeni kapasiteye göre dengeleniyor.";
}

export function routeRevisionDecision({ counts = {}, totalChanges = 0 } = {}) {
  const urgency = urgencyFor(counts, totalChanges);
  const changed = urgency !== "none";

  return {
    version: ROUTE_REVISION_DECISION_VERSION,
    changed,
    urgency,
    shouldNotify: urgency === "high" || urgency === "medium",
    shouldCreateRevision: changed,
    primaryAction: changed ? "review_route_update" : "continue_current_route",
    headline: headlineFor(urgency, counts),
    reason: reasonFor(urgency, counts),
  };
}
