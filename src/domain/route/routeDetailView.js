// Rota Detay ekraninin tahmin tarafi — SAF. forecastNet + tempo senaryolari
// ne veriyorsa o yazilir; tahmin yoksa tasarimin kendi bos hali doner.

const round = (value) => (Number.isFinite(value) ? Math.round(value) : null);

export function routeDetailForecast({ forecast, targetNet, tempoScenarios = [] } = {}) {
  const projected = round(forecast?.projected);
  const target = Number.isFinite(targetNet) ? targetNet : null;
  const points = forecast?.dataPoints || [];

  let note = "3. denemeden sonra açılır";
  if (projected != null) {
    if (target == null) note = null;
    else if (projected >= target) note = `hedefin ${round(projected - target)} net üstünde`;
    else note = `hedefin ${round(target - projected)} net altında`;
  }

  const low = round(forecast?.range?.low);
  const high = round(forecast?.range?.high);

  const chart = points.length ? {
    stops: points.map((p) => ({ y: p.net })),
    todayIndex: points.length - 1,
    projection: projected != null ? [forecast.projected] : [],
    band: forecast.range ? { upper: [forecast.range.high], lower: [forecast.range.low] } : null,
    projectedNet: projected,
  } : null;

  const byMultiplier = (m) => tempoScenarios.find((item) => item?.multiplier === m) || null;
  const more = byMultiplier(1.1);
  const less = byMultiplier(0.9);
  const tempoRows = [
    more ? { id: "more", label: "Haftada %10 daha çok soru", value: `${round(more.projectedNet)} net`, tone: "up" } : null,
    less ? { id: "less", label: "Haftada %10 daha az soru", value: `${round(less.projectedNet)} net`, tone: "down" } : null,
  ].filter(Boolean);

  return {
    caption: points.length ? `${points.length} deneme · bugün · sınav günü tahmini` : null,
    chart,
    projectedNet: projected,
    note,
    rangeText: projected != null && low != null && high != null ? `${low}–${high} net` : "—",
    tempoRows,
  };
}
