const CONFIDENCE_LABELS = Object.freeze({
  high: "yüksek",
  medium: "orta",
  low: "düşük",
});

const RISK_LABELS = Object.freeze({
  route_overflow: "Tempo sıkışık",
  capacity_low_confidence: "Tempo verisi az",
  topic_signal_sparse: "Konu verisi seyrek",
  prerequisite_debt: "Temel sıra hassas",
  study_log_unavailable: "Çalışma verisi eksik",
});

export function routeCreationSummary({
  weeks = [],
  intelligence = null,
  daysLeft = null,
  routeCreated = false,
} = {}) {
  const firstWeekStops = weeks?.[0]?.stops?.length || 0;
  const confidence = intelligence?.confidence || "low";
  const risk = intelligence?.risks?.[0]?.code || null;

  return {
    title: routeCreated ? "Rotan canlı ve takipte" : "Rotanı oluşturalım",
    body: routeCreated
      ? "Yeni deneme ve çalışma verileri geldikçe rotayı tekrar analiz edebilirsin."
      : "Deneme, çalışma temposu ve konu sinyallerini okuyup ilk haftanı kilitleyelim.",
    actionLabel: routeCreated ? "Yeniden analiz et" : "Rotayı oluştur",
    confidenceLabel: CONFIDENCE_LABELS[confidence] || CONFIDENCE_LABELS.low,
    confidenceScore: Number(intelligence?.confidenceScore || 0),
    riskLabel: RISK_LABELS[risk] || "Kritik risk yok",
    firstWeekStops,
    daysLeftLabel: daysLeft == null ? "Tarih eksik" : `${daysLeft} gün`,
    hasPreview: weeks.length > 0 && firstWeekStops > 0,
    nextBestAction: intelligence?.nextBestAction || "İlk hafta duraklarını oluşturmak için hedef bilgilerini tamamla.",
  };
}
