// Ana sayfa grafiginin "TYT · AYT" sayfasi: iki sinav AYRI cizgi, toplanmaz
// (kullanici karari, 28 Eylul). AYT denemeleri AYT_SAY/EA/SOZ tipinde.
// Donen: [{ key, points: [{ t, v }] }] -- yalniz noktasi olan sinavlar.
export function examSeries(trials = [], limit = 12) {
  const kind = (t) => {
    const type = String(t?.trialType || "");
    if (type === "TYT") return "TYT";
    return type.startsWith("AYT") ? "AYT" : null;
  };
  return ["TYT", "AYT"]
    .map((key) => ({
      key,
      points: (trials || [])
        .filter((t) => kind(t) === key)
        .map((t) => ({ t: new Date(t.date || t.trial_date).getTime(), v: Number(t.normalizedTotalNet ?? t.totalNet) || 0 }))
        .filter((p) => Number.isFinite(p.t))
        .sort((a, b) => a.t - b.t)
        .slice(-limit),
    }))
    .filter((s) => s.points.length);
}

// Sayfa ancak IKI sinav da varsa anlamli; tek sinav zaten rota sayfasinda.
export function showExamSeries(series = []) {
  return series.length === 2 && series.some((s) => s.points.length >= 2);
}
