// TAHMIN DOGRULUGU GRAFIGI — saf geometri (tasarim AKIS 14 · 346x168).
//
// Gercek hat: baslangic -> (bant icindeyse) ara deneme dugumleri -> sinav
// gunu sonucu. Bant disinda kalinca tahmin hatti kesik cizgiyle ayrica
// cizilir ve ara dugumler dusurulur ("Tahmin Şaştı" varyanti).
// Butun y'ler GERCEK degerlerden olcekleniyor; ara dugum uydurulmuyor —
// yalniz dondurulmus tahmindeki deneme netleri kullaniliyor.

export const CHART = Object.freeze({ width: 346, height: 168, top: -12, x0: 8, x1: 338, yTop: 6, yBottom: 138 });

// Tasarimdaki bant sol uca dogru 18 birim asagi kayiyor (tahminin kuruldugu
// gunlerde net daha dusuktu). Bant yuksekligi gercek araliktan gelir.
const BAND_DRIFT = 18;
const BAND_MIN = 6;

const r1 = (v) => Math.round(v * 10) / 10;

function smoothPath(points) {
  if (points.length < 2) return null;
  let d = `M ${r1(points[0].x)} ${r1(points[0].y)}`;
  for (let i = 0; i < points.length - 1; i += 1) {
    const p0 = points[i - 1] || points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] || p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${r1(c1x)} ${r1(c1y)} ${r1(c2x)} ${r1(c2y)} ${r1(p2.x)} ${r1(p2.y)}`;
  }
  return d;
}

function bandPath(yHigh, yLow) {
  const { x0, x1 } = CHART;
  let hi = yHigh;
  let lo = yLow;
  if (lo - hi < BAND_MIN) {
    const mid = (hi + lo) / 2;
    hi = mid - BAND_MIN / 2;
    lo = mid + BAND_MIN / 2;
  }
  const at = (y, share) => r1(y + BAND_DRIFT * share);
  return `M ${x0} ${at(hi, 1)} C 90 ${at(hi, 0.78)} 190 ${at(hi, 0.45)} ${x1} ${r1(hi)}`
    + ` L ${x1} ${r1(lo)} C 190 ${at(lo, 0.45)} 90 ${at(lo, 0.78)} ${x0} ${at(lo, 1)} Z`;
}

export function forecastAccuracyChart({ start, predicted, actual, range, waypoints = [], inRange = true }) {
  if (![start, predicted, actual].every(Number.isFinite)) return null;

  const { x0, x1, yTop, yBottom } = CHART;
  const mids = inRange ? (waypoints || []).filter(Number.isFinite).slice(0, 2) : [];
  const values = [start, predicted, actual, range?.low, range?.high, ...mids].filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const y = (v) => yBottom - ((v - min) / span) * (yBottom - yTop);

  const step = (x1 - x0) / (mids.length + 1);
  const actualPoints = [start, ...mids, actual].map((v, i) => ({ x: x0 + step * i, y: y(v) }));
  const yPred = y(predicted);
  const yActual = y(actual);

  const hasBand = Number.isFinite(range?.low) && Number.isFinite(range?.high);
  const predAbove = yPred <= yActual;
  const labelY = (nodeY, above) => r1(above
    ? Math.max(CHART.top + 11, nodeY - 12)
    : Math.min(CHART.top + CHART.height - 2, nodeY + 20));

  return {
    viewBox: `0 ${CHART.top} ${CHART.width} ${CHART.height}`,
    aspectRatio: CHART.width / CHART.height,
    band: hasBand ? bandPath(y(range.high), y(range.low)) : null,
    actualPath: smoothPath(actualPoints),
    forecastPath: inRange ? null : smoothPath([actualPoints[0], { x: x1, y: yPred }]),
    start: { x: x0, y: r1(actualPoints[0].y) },
    waypoints: actualPoints.slice(1, -1).map((p) => ({ x: r1(p.x), y: r1(p.y) })),
    predictedNode: { x: x1, y: r1(yPred), labelX: x1 - 8, labelY: labelY(yPred, predAbove) },
    actualNode: { x: x1, y: r1(yActual), labelX: x1 - 8, labelY: labelY(yActual, !predAbove) },
  };
}
