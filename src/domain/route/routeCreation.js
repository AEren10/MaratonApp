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

const READINESS_TITLES = Object.freeze({
  ready: "Rota kalite kontrolü hazır",
  partial: "Rota kalite kontrolü geliştirilebilir",
  blocked: "Rota için temel bilgi eksik",
});

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function item(key, status, label, detail) {
  return { key, status, label, detail };
}

function riskCodeSet(intelligence) {
  return new Set((intelligence?.risks || []).map((risk) => risk.code));
}

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

export function routeReadinessSummary({
  weeks = [],
  intelligence = null,
  daysLeft = null,
  forecast = null,
  tempoScenarios = [],
  dataHealth = {},
} = {}) {
  const firstWeekStops = weeks?.[0]?.stops?.length || 0;
  const risks = riskCodeSet(intelligence);
  const checks = [
    daysLeft == null
      ? item("exam_date", "warn", "Sınav tarihi", "Tarih girilirse hafta baskısı daha doğru hesaplanır.")
      : item("exam_date", "ok", "Sınav tarihi", `${daysLeft} gün kaldığı hesaba katıldı.`),
    firstWeekStops > 0
      ? item("first_week", "ok", "İlk hafta", `${firstWeekStops} durak programlanabilir.`)
      : item("first_week", "block", "İlk hafta", "Hedef veya müfredat bilgisi tamamlanmadan durak çıkmıyor."),
    risks.has("capacity_low_confidence")
      ? item("tempo", "warn", "Tempo verisi", "Gerçek çalışma geçmişi az; rota hedef temposuna yaslanıyor.")
      : item("tempo", "ok", "Tempo verisi", "Haftalık kapasite sinyali rota hesabına girdi."),
    forecast
      ? item("trial_forecast", "ok", "Deneme tahmini", `${forecast.sampleSize} denemeyle sınav günü bandı üretildi.`)
      : item("trial_forecast", "warn", "Deneme tahmini", "En az 3 deneme girilirse net bandı ve tempo etkisi güçlenir."),
    risks.has("topic_signal_sparse")
      ? item("topic_signal", "warn", "Konu sinyali", "Bazı konularda veri az; tamamladıkça seçimler keskinleşir.")
      : item("topic_signal", "ok", "Konu sinyali", "Zayıflık ve tekrar sinyalleri okunabilir durumda."),
  ];
  if (dataHealth?.logs === "error") {
    checks.push(item("logs", "warn", "Çalışma kayıtları", "Log verisi alınamadı; rota güvenli yedek tempoyla çizilecek."));
  }
  const blockers = checks.filter((check) => check.status === "block").length;
  const warnings = checks.filter((check) => check.status === "warn").length;
  const scenarioReady = tempoScenarios.length >= 3;
  const baseScore = Number(intelligence?.confidenceScore || 0);
  const score = clamp(baseScore + (scenarioReady ? 5 : 0) - warnings * 8 - blockers * 24);
  const status = blockers > 0 ? "blocked" : warnings > 0 ? "partial" : "ready";

  return {
    status,
    title: READINESS_TITLES[status],
    score,
    summary: blockers > 0
      ? "Önizleme yoksa rota kaydedilmez; önce hedef ve sınav bilgilerini tamamla."
      : warnings > 0
        ? "Rota oluşturulabilir; deneme ve çalışma verisi arttıkça daha akıllı revize olur."
        : "Veriler yeterli görünüyor; ilk haftayı güvenle kilitleyebilirsin.",
    checks,
    blockers,
    warnings,
  };
}
