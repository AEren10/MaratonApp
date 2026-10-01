// Rota Detay ekraninin tahmin tarafi — SAF. forecastNet + tempo senaryolari
// ne veriyorsa o yazilir; tahmin yoksa tasarimin kendi bos hali doner.

const round = (value) => (Number.isFinite(value) ? Math.round(value) : null);

// netChart (netChartData.buildNetChart) verilirse noktalar ondan gelir: tahmin
// hazir olmasa da olculmus denemeler cizilir.
export function routeDetailForecast({ forecast, targetNet, tempoScenarios = [], netChart = null } = {}) {
  const projected = round(forecast?.projected);
  const target = Number.isFinite(targetNet) ? targetNet : null;
  const points = forecast?.dataPoints || [];

  // Tahmin 3 deneme VE 2 haftalik olcum araligi ister (lib/netForecast).
  // 3 deneme girmis ama araligi kisa olana "3. denemeden sonra" demek yalan.
  const measured = Array.isArray(netChart?.stops) ? netChart.stops.length : 0;
  let note = measured >= 3 ? "denemeler 2 haftaya yayılınca açılır" : "3. denemeden sonra açılır";
  if (projected != null) {
    if (target == null) note = null;
    else if (projected >= target) note = `hedefin ${round(projected - target)} net üstünde`;
    else note = `hedefin ${round(target - projected)} net altında`;
  }

  const low = round(forecast?.range?.low);
  const high = round(forecast?.range?.high);

  const chart = netChart ? {
    stops: netChart.stops,
    todayIndex: netChart.todayIndex,
    projection: netChart.projection,
    band: netChart.band || null,
    projectedNet: netChart.projectedNet,
    xs: netChart.xs,
    mode: netChart.mode,
  } : points.length ? {
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
    caption: netChart
      ? `${netChart.stops.length} deneme · bugün · ${netChart.mode === "forecast" ? "sınav günü tahmini" : "hedef"}`
      : points.length ? `${points.length} deneme · bugün · sınav günü tahmini` : null,
    chart,
    projectedNet: projected,
    note,
    rangeText: projected != null && low != null && high != null ? `${low}–${high} net` : "—",
    tempoRows,
  };
}
