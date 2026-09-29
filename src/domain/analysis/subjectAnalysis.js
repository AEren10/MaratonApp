// DERS ANALIZI — bir dersin denemeler boyunca hikayesi.
//
// Analiz'deki ders kartina dokununca eskiden Mufredat (konu listesi)
// aciliyordu; "neredeyim, neden, ne yapayim" sorusu cevapsiz kaliyordu.
// Buradaki sayilar yalniz o dersin girildigi denemelerden (trials yeniden
// eskiye gelir). Uydurma deger yok: veri yoksa alan null.
const round1 = (n) => Math.round(n * 10) / 10;
const avg = (a) => (a.length ? a.reduce((s, x) => s + x, 0) / a.length : null);

export function subjectAnalysis(trials = [], subjectKey) {
  const rows = (trials || [])
    .map((t, index) => ({ trial: t, orderIndex: index }))
    .filter(({ trial: t }) => t?.subjects?.[subjectKey])
    .map(({ trial: t, orderIndex }) => ({
      date: t.date || t.trial_date,
      createdAt: t.created_at || t.createdAt || null,
      orderIndex,
      type: t.trialType,
      ...t.subjects[subjectKey],
    }))
    .filter((r) => r.date)
    .sort((a, b) => {
      const dateCmp = String(a.date).localeCompare(String(b.date));
      if (dateCmp !== 0) return dateCmp;
      if (a.createdAt && b.createdAt) {
        const timeCmp = String(a.createdAt).localeCompare(String(b.createdAt));
        if (timeCmp !== 0) return timeCmp;
      }
      return b.orderIndex - a.orderIndex;
    });
  if (!rows.length) return { count: 0 };

  const nets = rows.map((r) => Number(r.net) || 0);
  const last = nets[nets.length - 1];
  const prev = nets.length > 1 ? nets[nets.length - 2] : null;
  const recent = nets.slice(-3);
  const earlier = nets.slice(-6, -3);
  const answered = rows.map((r) => (Number(r.correct) || 0) + (Number(r.wrong) || 0) + (Number(r.empty) || 0));
  const totals = rows.reduce((acc, r) => ({
    correct: acc.correct + (Number(r.correct) || 0),
    wrong: acc.wrong + (Number(r.wrong) || 0),
    empty: acc.empty + (Number(r.empty) || 0),
  }), { correct: 0, wrong: 0, empty: 0 });
  const all = totals.correct + totals.wrong + totals.empty;

  // Kayip nerede: yanlis mi bos mu daha cok net goturuyor?
  const lossFromWrong = totals.wrong * 1.25; // yanlis hem soruyu hem ceyrek net goturur
  const lossFromEmpty = totals.empty;
  const leak = all === 0 ? null : lossFromWrong >= lossFromEmpty ? "wrong" : "empty";

  let lastT = -Infinity;
  const points = rows.map((r) => {
    // Eksen deneme tarihi; ayni gun 3 saat arayla (girilme ani degil).
    let t = new Date(r.date).getTime();
    if (!Number.isFinite(t)) t = 0;
    if (t <= lastT) t = lastT + 3 * 3600000;
    lastT = t;
    return { t, v: Number(r.net) || 0 };
  });

  return {
    count: rows.length,
    points,
    last: round1(last),
    delta: prev == null ? null : round1(last - prev),
    best: round1(Math.max(...nets)),
    worst: round1(Math.min(...nets)),
    average: round1(avg(nets)),
    // Son uc deneme ile ondan onceki uc denemenin ortalama farki.
    momentum: earlier.length ? round1(avg(recent) - avg(earlier)) : null,
    accuracy: totals.correct + totals.wrong > 0 ? Math.round((totals.correct / (totals.correct + totals.wrong)) * 100) : null,
    emptyShare: all > 0 ? Math.round((totals.empty / all) * 100) : null,
    questionsPerTrial: Math.round(avg(answered) || 0) || null,
    leak,
  };
}

export function subjectAnalysisSentence(a) {
  if (!a?.count) return "Bu ders için henüz deneme verisi yok.";
  if (a.count === 1) return "İlk deneme kaydın. Bir deneme daha girince eğilim görünür.";
  const trend = a.momentum == null
    ? (a.delta > 0 ? "Son denemede yükseldi" : a.delta < 0 ? "Son denemede geriledi" : "Son denemede aynı kaldı")
    : (a.momentum > 0.5 ? "Son denemelerde yükselişte" : a.momentum < -0.5 ? "Son denemelerde düşüşte" : "Son denemelerde yatay");
  const leak = a.leak === "wrong"
    ? "Net kaybının çoğu yanlışlardan: hız değil doğruluk."
    : a.leak === "empty" ? "Net kaybının çoğu boşlardan: bilmediğin konular var." : "";
  return `${trend}. ${leak}`.trim();
}
