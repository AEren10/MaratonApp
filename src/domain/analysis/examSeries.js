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
    .map((key) => {
      const filtered = (trials || [])
        .map((t, index) => ({ trial: t, orderIndex: index }))
        .filter(({ trial: t }) => kind(t) === key)
        .sort((a, b) => {
          const tA = a.trial;
          const tB = b.trial;
          const dateCmp = String(tA.date || tA.trial_date || "").localeCompare(String(tB.date || tB.trial_date || ""));
          if (dateCmp !== 0) return dateCmp;
          const timeA = tA.created_at || tA.createdAt ? new Date(tA.created_at || tA.createdAt).getTime() : 0;
          const timeB = tB.created_at || tB.createdAt ? new Date(tB.created_at || tB.createdAt).getTime() : 0;
          if (timeA !== timeB) return timeA - timeB;
          return b.orderIndex - a.orderIndex;
        })
        .slice(-limit);

      let lastT = -Infinity;
      const points = filtered.map(({ trial: t }) => {
        // Eksen deneme tarihi; ayni gun 3 saat arayla (girilme ani degil).
        let timestamp = new Date(t.date || t.trial_date).getTime();
        if (!Number.isFinite(timestamp)) timestamp = 0;
        if (timestamp <= lastT) timestamp = lastT + 3 * 3600000;
        lastT = timestamp;
        return { t: timestamp, v: Number(t.normalizedTotalNet ?? t.totalNet) || 0 };
      });

      return { key, points };
    })
    .filter((s) => s.points.length);
}

// Sayfa ancak IKI sinav da varsa anlamli; tek sinav zaten rota sayfasinda.
export function showExamSeries(series = []) {
  return series.length === 2 && series.some((s) => s.points.length >= 2);
}
