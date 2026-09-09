const SUBJECT_NAMES = {
  tyt_turkce: "Türkçe", tyt_matematik: "TYT Mat", tyt_fen: "Fen",
  tyt_sosyal: "Sosyal", ayt_matematik: "AYT Mat", ayt_fizik: "Fizik",
  ayt_kimya: "Kimya", ayt_biyoloji: "Biyoloji", ayt_edebiyat: "Edebiyat",
  ayt_tarih1: "Tarih-1", ayt_cografya1: "Coğrafya-1",
  ayt_tarih2: "Tarih-2", ayt_cografya2: "Coğrafya-2",
  ayt_felsefe: "Felsefe", ayt_din: "Din",
};
const MS_PER_DAY = 86400000;
const Z_95 = 1.96;
const round = (value, digits = 4) => {
  const scale = 10 ** digits;
  return Math.round(value * scale) / scale;
};
const daysBetween = (a, b) => Math.round((b - a) / MS_PER_DAY);
const formatDDMM = (date) => {
  const d = String(date.getDate()).padStart(2, "0");
  const m = String(date.getMonth() + 1).padStart(2, "0");
  return `${d}/${m}`;
};
const finite = (value) => {
  if (value == null || value === "") return null;
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};
export const forecastNetValue = (trial = {}) => finite(
  trial.normalizedTotalNet ?? trial.normalized_total_net,
) ?? finite(trial.rawTotalNet ?? trial.raw_total_net)
  ?? finite(trial.totalNet ?? trial.total_net);

function dominantTrialGroup(trials, expectedType = null) {
  const groups = new Map();
  for (const trial of trials || []) {
    const date = new Date(trial.date || trial.trial_date);
    const net = forecastNetValue(trial);
    if (!Number.isFinite(date.getTime()) || net == null) continue;
    const type = String(trial.trialType || trial.exam_type || "UNKNOWN").toUpperCase();
    if (expectedType && type !== String(expectedType).toUpperCase()) continue;
    if (!groups.has(type)) groups.set(type, []);
    groups.get(type).push({ ...trial, __date: date, __net: net, __type: type });
  }
  return [...groups.values()].sort((a, b) => b.length - a.length)[0] || [];
}

function linearRegression(points) {
  const n = points.length;
  const sumX = points.reduce((sum, p) => sum + p.x, 0);
  const sumY = points.reduce((sum, p) => sum + p.y, 0);
  const meanX = sumX / n;
  const meanY = sumY / n;
  const sxx = points.reduce((sum, p) => sum + (p.x - meanX) ** 2, 0);
  if (sxx === 0) return null;
  const slope = points.reduce(
    (sum, p) => sum + (p.x - meanX) * (p.y - meanY), 0,
  ) / sxx;
  const intercept = meanY - slope * meanX;
  const residuals = points.map((p) => p.y - (slope * p.x + intercept));
  const ssRes = residuals.reduce((sum, value) => sum + value ** 2, 0);
  const ssTot = points.reduce((sum, p) => sum + (p.y - meanY) ** 2, 0);
  return { slope, intercept, meanX, sxx, ssRes, r2: ssTot ? 1 - ssRes / ssTot : 1 };
}

export function forecastNet(trials, examDate, maxNet = null, expectedType = null) {
  const exam = new Date(examDate);
  if (!Number.isFinite(exam.getTime())) return null;
  const sameType = dominantTrialGroup(trials, expectedType)
    .sort((a, b) => a.__date - b.__date).slice(-5);
  if (sameType.length < 3) return null;
  const firstDate = sameType[0].__date;
  const points = sameType.map((trial) => ({
    x: daysBetween(firstDate, trial.__date), y: trial.__net, trial,
  }));
  const regression = linearRegression(points);
  if (!regression) return null;
  const { slope, intercept, meanX, sxx, ssRes, r2 } = regression;
  const n = points.length;
  const examDays = daysBetween(firstDate, exam);
  const cap = (value) => Math.min(maxNet ?? Infinity, Math.max(0, value));
  const projected = cap(slope * examDays + intercept);
  const mse = ssRes / (n - 2);
  const leverage = 1 + 1 / n + ((examDays - meanX) ** 2 / sxx);
  const standardError = Math.sqrt(Math.max(0, mse * leverage));
  // Kusursuz doğrusal 3-5 nokta gerçek hayatta "sıfır belirsizlik" değildir.
  // Ölçüm gürültüsü görünmese bile küçük örneklem için muhafazakâr taban tut.
  const uncertaintyFloor = (maxNet ? maxNet * 0.01 : 1) * (n < 5 ? 2 : 1);
  const margin = Math.max(Z_95 * standardError, uncertaintyFloor);
  const confidence = n < 4 || r2 < 0.3 ? "low"
    : n < 5 || r2 < 0.6 ? "medium" : "high";
  const dataPoints = points.map(({ x, y, trial }) => ({
    dayIndex: x, net: y, rawNet: finite(
      trial.rawTotalNet ?? trial.raw_total_net ?? trial.totalNet ?? trial.total_net,
    ), dateStr: formatDDMM(trial.__date),
  }));
  return {
    projected, current: points[n - 1].y, first: points[0].y,
    weeklyGain: slope * 7, r2, confidence,
    range: { low: cap(projected - margin), high: cap(projected + margin) },
    dataPoints, projectionEnd: { dayIndex: examDays, net: projected },
    daysLeft: daysBetween(new Date(), exam), sampleSize: n,
    trialType: sameType[0].__type,
    valueBasis: sameType.some((t) => finite(
      t.normalizedTotalNet ?? t.normalized_total_net,
    ) != null) ? "normalized" : "raw",
    regression: { slope, intercept, meanX, sxx, mse },
    predictionInterval: {
      level: 0.95, method: "ols_prediction", criticalValue: Z_95,
      standardError, margin, leverage,
      uncertaintyFloor,
      floorApplied: margin === uncertaintyFloor,
    },
  };
}

export function forecastBySubject(trials, examDate) {
  const exam = new Date(examDate);
  if (!Number.isFinite(exam.getTime())) return [];
  const sorted = [...(trials || [])].sort(
    (a, b) => new Date(a.date) - new Date(b.date),
  );
  if (sorted.length < 2) return [];
  const firstDate = new Date(sorted[0].date);
  const map = {};
  for (const trial of sorted) for (const [key, value] of Object.entries(trial.subjects || {})) {
    if (finite(value.net) == null) continue;
    (map[key] ||= []).push({ x: daysBetween(firstDate, new Date(trial.date)), y: value.net });
  }
  return Object.entries(map).flatMap(([key, points]) => {
    if (points.length < 2) return [];
    const regression = linearRegression(points);
    if (!regression) return [];
    const current = points.at(-1).y;
    const projected = Math.max(0, regression.slope
      * daysBetween(firstDate, exam) + regression.intercept);
    return [{
      key, name: SUBJECT_NAMES[key] || key, current, projected,
      weeklyGain: regression.slope * 7, improving: regression.slope > 0,
    }];
  }).sort((a, b) => b.weeklyGain - a.weeklyGain);
}
