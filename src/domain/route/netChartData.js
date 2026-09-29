import { forecastNetValue } from "../../lib/netForecast.js";

// NET GRAFIGI VERISI -- SAF.
//
// Olculmus noktalar tahmine BAGLI DEGIL. Tahmin (forecastNet) 3 deneme ve
// 14 gunluk aralik istiyor; grafik eskiden noktalarini da tahminin
// dataPoints'inden aliyordu ve 6 gunde 4 TYT giren kullanici hic kirilma
// goremiyordu. Ilerlemeyi gormek motivasyonun kendisi: noktalar ikinci
// denemeden itibaren cizilir, tahmin hazir olunca kesikli uc TAHMIN'e doner.

// Ana sayfa slider'i son 8 deneme (bakis); Rota ekrani son 12 (analiz).
export const NET_CHART_LIMIT = 8;
export const NET_CHART_LIMIT_DETAIL = 12;
// Gecmis genisligin payi; kalan pay sinava kadar olan zaman. Duz zaman
// ekseninde 259 gunun yaninda 6 gunluk denemeler sol kenarda tek yigin
// oluyordu.
export const PAST_SHARE = 0.6;

const pad = (n) => String(n).padStart(2, "0");
const createdTime = (t) => {
  const raw = t.created_at || t.createdAt;
  if (raw) return new Date(raw).getTime() || 0;
  return Number(t.id) > 1e9 ? Number(t.id) : 0;
};

/** Tahminle ayni sinav ailesinin denemeleri, eskiden yeniye, son `limit` tane. */
export function netChartSeries(trials, types = [], limit = NET_CHART_LIMIT) {
  const allowed = new Set((types || []).map((t) => String(t).toUpperCase()));
  return (trials || [])
    .map((t) => ({ t, date: new Date(t?.date || t?.trial_date), net: forecastNetValue(t || {}) }))
    .filter(({ t, date, net }) => net != null && Number.isFinite(date.getTime())
      && (!allowed.size || allowed.has(String(t.trialType || t.exam_type || "").toUpperCase())))
    .sort((a, b) => (a.date - b.date) || (createdTime(a.t) - createdTime(b.t)))
    .slice(-limit)
    .map(({ date, net }) => ({ net, date, dateStr: `${pad(date.getDate())}/${pad(date.getMonth() + 1)}` }));
}

/**
 * Noktalarin yatay konumu, 0..1. Gecmis PAST_SHARE'e esit aralikla yayilir,
 * gelecek noktalari kalan payi paylasir. Gelecek yoksa gecmis tum genislik.
 */
export function routeXs(pastCount, futureCount, pastShare = PAST_SHARE) {
  const share = futureCount > 0 ? pastShare : 1;
  const past = Array.from({ length: pastCount }, (_, i) => (pastCount > 1 ? (share * i) / (pastCount - 1) : 0));
  const future = Array.from({ length: futureCount }, (_, j) => share + ((1 - share) * (j + 1)) / futureCount);
  return [...past, ...future].map((x) => Math.round(x * 1e4) / 1e4);
}

/**
 * Tahmin makulse ucu TAHMIN, degilse hedef netine giden kesikli HEDEF.
 * Ikisi de yoksa yalniz olculmus hat.
 */
export function netChartProjection({ series, forecast, target }) {
  const lastNet = series[series.length - 1]?.net;
  const projected = forecast?.projected;
  const plausible = Number.isFinite(projected) && projected > 0
    && (!Number.isFinite(lastNet) || projected >= lastNet * 0.5);
  if (plausible) {
    return {
      mode: "forecast",
      projection: [projected],
      band: { upper: [forecast.range?.high ?? projected], lower: [forecast.range?.low ?? projected] },
      endLabel: `TAHMİN ${Math.round(projected)}`,
      projectedNet: Math.round(projected),
    };
  }
  if (Number.isFinite(target) && target > 0) {
    return { mode: "target", projection: [target], band: undefined, endLabel: `HEDEF ${Math.round(target)}`, projectedNet: null };
  }
  return { mode: "none", projection: [], band: undefined, endLabel: null, projectedNet: null };
}

export function buildNetChart({ trials, types, forecast, target, minPoints = 2, limit = NET_CHART_LIMIT }) {
  const series = netChartSeries(trials, types, limit);
  if (series.length < minPoints) return null;
  const proj = netChartProjection({ series, forecast, target });
  return {
    series,
    stops: series.map((p) => ({ y: p.net, label: p.dateStr })),
    todayIndex: series.length - 1,
    xs: routeXs(series.length, proj.projection.length),
    ...proj,
  };
}
