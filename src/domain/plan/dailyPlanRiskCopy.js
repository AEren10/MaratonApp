const RISK_COPY = Object.freeze({
  plan_data_missing: {
    title: "Veri bekleniyor",
    body: "Hedef, deneme veya rota bilgisi geldikçe bugünkü program netleşir.",
  },
  route_not_attached: {
    title: "Rota bağlanmadı",
    body: "Bugünkü görevler adaptif seçildi; rota oluşturunca program haftalık duraklara bağlanır.",
  },
  route_signal_sparse: {
    title: "Güven başlangıçta",
    body: "Rota kullanılabilir; birkaç deneme ve çalışma kaydı daha geldikçe kararlar keskinleşir.",
  },
});

const LEVEL_ORDER = Object.freeze({ high: 3, medium: 2, low: 1 });

function riskPriority(risk = {}) {
  return LEVEL_ORDER[risk.level] || 0;
}

export function dailyPlanRiskCopy(risks = []) {
  const top = [...(risks || [])]
    .filter((risk) => RISK_COPY[risk.code])
    .sort((a, b) => riskPriority(b) - riskPriority(a))[0];

  return top ? { code: top.code, level: top.level, ...RISK_COPY[top.code] } : null;
}
