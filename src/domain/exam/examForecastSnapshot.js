// SINAV GUNU TAHMININ DONDURULMUS HALI — saf mantik.
//
// "Tahminim 71'di" cumlesi GECMIS zaman: sinav gunu icin uretilmis tahmini
// anlatiyor. Tahmini ekran acildikca yeniden hesaplarsak sinavdan sonra
// girilen/silinen denemeler gecmisi degistirir. Bu yuzden sonuc kaydedilirken
// yalniz sinav tarihine kadarki denemelerle bir kez hesaplanip saklanir.
//
// Karsilastirilan net rotanin ANA neti (TYT ya da LGS) — Sinav Sonucu
// ekraninin zorunlu alani ile ayni.

import { forecastNet, forecastNetValue } from "../../lib/netForecast.js";

export function primaryForecastProfile(examType) {
  if (examType === "lgs") return { types: ["LGS"], max: 90 };
  return { types: ["TYT"], max: 120 };
}

const endOfDay = (value) => {
  const d = value instanceof Date ? new Date(value) : new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  d.setHours(23, 59, 59, 999);
  return d;
};

export function examForecastSnapshot({ trials = [], examDate, examType } = {}) {
  const exam = endOfDay(examDate);
  if (!exam) return null;
  const { types, max } = primaryForecastProfile(examType);
  const eligible = (trials || []).filter((trial) => {
    if (!types.includes(String(trial?.trialType || "").toUpperCase())) return false;
    const date = new Date(trial?.date || trial?.trial_date);
    return Number.isFinite(date.getTime()) && date <= exam;
  });

  const forecast = forecastNet(eligible, exam, max, types);
  if (!forecast) return null;

  const series = eligible
    .map((trial) => ({ at: new Date(trial.date || trial.trial_date), net: forecastNetValue(trial) }))
    .filter((point) => point.net != null)
    .sort((a, b) => a.at - b.at);
  const lastThree = series.slice(-3);
  const risingLastThree = lastThree.length === 3
    && lastThree[1].net > lastThree[0].net
    && lastThree[2].net > lastThree[1].net;

  const r2 = (v) => Math.round(v * 100) / 100;
  return {
    projected: r2(forecast.projected),
    range: { low: r2(forecast.range.low), high: r2(forecast.range.high) },
    first: r2(forecast.first),
    sampleSize: forecast.sampleSize,
    trialType: forecast.trialType,
    risingLastThree,
    // Grafigin ara dugumleri: GERCEK deneme netleri, zaman cizgisinin
    // ucte bir ve ucte iki noktasina en yakin iki kayit.
    waypoints: pickWaypoints(series).map((point) => r2(point.net)),
  };
}

function pickWaypoints(series) {
  if (series.length < 3) return [];
  const at = (share) => series[Math.min(series.length - 1, Math.round((series.length - 1) * share))];
  const first = at(1 / 3);
  const second = at(2 / 3);
  return first === second ? [first] : [first, second];
}
