import { dateKey, startOfWeekTR } from "../../lib/dateUtils.js";

// Kullanıcının GERÇEK haftalık kapasitesi.
//
// Eski roadmapEngine konuları haftalara eşit bölüyordu: "80 konu / 12 hafta =
// haftada 7". Bu, günde 20 soru çözen öğrenciyle günde 200 soru çözene aynı
// planı veriyordu — yani plan ya ulaşılamaz ya da anlamsız kolay oluyordu.
//
// Buradaki model kullanıcının SON 4 HAFTASINA bakar. Geçmiş yoksa beyan
// edilen günlük hedefe düşer. Böylece rota, kişinin gerçekten yapabildiği
// tempoya göre çizilir.

const LOOKBACK_WEEKS = 4;
// Kademeli yuklenme: plan gercek temponun biraz ustunde kurulur, beyan
// edilen hedefe kadar. Rota ogrenciyi oldugu yerde tutan "kibar antrenor"
// olmasin; ama tek seferde hedefe atlatip da kirmasin.
export const STRETCH = 1.15;
// Veri azken hedefin bu payina yaslanilir (hedefin tamami degil: beyan
// genelde iyimser).
const GOAL_FLOOR_SHARE = 0.6;
// Bos hafta temposu SIFIRLAMAZ, duzenliligi olcer: 4 haftanin 2'si bos
// ise plan aktif haftalarin temposunun %62'sine iner (0.25 + 0.75 * 2/4).
const consistencyFactor = (observed, total) => 0.25 + 0.75 * (observed / Math.max(1, total));
const MS_WEEK = 7 * 86400000;

// Hic kayit yokken (ilk hafta) beyanin tamami degil bu payi: "gunde 80
// cozerim" diyen ama aliskanligi henuz olmayan ogrenciye ilk haftada 560
// soruluk taban kurulmasin. Ilk kayitlardan sonra gercek tempo devralir.
const CALIBRATION_SHARE = 0.75;

/** Beyan edilen günlük hedeften haftalık taban kapasite (ilk hafta kalibrasyonu). */
function fallbackCapacity(dailyQuestionGoal, share = 1) {
  const daily = (Number(dailyQuestionGoal) || 20) * share;
  return {
    questionsPerWeek: Math.max(20, Math.round(daily * 7)),
    minutesPerWeek: Math.max(60, Math.round(daily * 7 * 1.5)), // ~1.5 dk/soru
    activeDaysPerWeek: 5,
    source: "goal",
    confidence: "low",
  };
}

/**
 * @param logs  study_logs kayıtları: { study_date, question_count, duration_minutes }
 * @param dailyQuestionGoal  profildeki günlük soru hedefi (yedek)
 */
export function estimateWeeklyCapacity(
  logs = [],
  dailyQuestionGoal = 20,
  now = new Date(),
  { dataState = "ready", weeklyMinutesGoal = 0, recovering = false } = {},
) {
  // Ogrencinin beyan ettigi haftalik sure siniri: plan bunu asmaz (gozlenen
  // tempo zaten ustundeyse onu kesmeyiz). Eskiden hic okunmuyordu.
  const capMinutes = (cap) => {
    const goalM = Number(weeklyMinutesGoal) || 0;
    if (goalM <= 0 || cap.minutesPerWeek <= goalM) return cap;
    const observedM = Number(cap.observedMinutesPerWeek) || 0;
    return { ...cap, minutesPerWeek: Math.max(goalM, observedM), minutesCapped: true };
  };
  if (dataState === "error") {
    return capMinutes({ ...fallbackCapacity(dailyQuestionGoal), missingData: true });
  }
  if (!Array.isArray(logs) || logs.length === 0) {
    // Gercekten hic kayit yok (yukleme hatasi degil): ilk hafta kalibrasyonu.
    return capMinutes({ ...fallbackCapacity(dailyQuestionGoal, CALIBRATION_SHARE), calibrating: true });
  }

  const currentWeek = new Date(startOfWeekTR(now));
  const since = new Date(currentWeek.getTime() - LOOKBACK_WEEKS * MS_WEEK);
  const buckets = new Map(); // haftaBaşı -> { q, m, days:Set }
  for (let index = LOOKBACK_WEEKS; index > 0; index -= 1) {
    const key = startOfWeekTR(new Date(currentWeek.getTime() - index * MS_WEEK));
    buckets.set(key, { q: 0, m: 0, days: new Set() });
  }

  for (const log of logs) {
    const raw = log.study_date || log.studyDate;
    if (!raw) continue;
    const when = new Date(raw);
    if (Number.isNaN(when.getTime()) || when < since || when >= currentWeek) continue;

    const wk = startOfWeekTR(when);
    if (!buckets.has(wk)) continue;
    const b = buckets.get(wk);
    b.q += Math.max(0, Number(log.question_count ?? log.questionCount ?? 0) || 0);
    b.m += Math.max(0, Number(log.duration_minutes ?? log.duration ?? 0) || 0);
    b.days.add(dateKey(when));
  }

  // Kayitlarin basladigi haftadan ONCEKI haftalar sayilmaz: uygulamayi bir
  // haftadir kullanan ogrenciye "3 hafta bos biraktin" duzenlilik cezasi
  // veriliyordu (hedefi gunde 80 olan kullaniciya haftada 39 soru).
  const firstWeek = logs.reduce((min, log) => {
    const raw = log.study_date || log.studyDate;
    if (!raw) return min;
    const wk = startOfWeekTR(new Date(raw));
    return !min || wk < min ? wk : min;
  }, null);
  const weeks = [...buckets.entries()]
    .filter(([key]) => !firstWeek || key >= firstWeek)
    .map(([, week]) => week);
  if (!weeks.length) return fallbackCapacity(dailyQuestionGoal);
  const observedWeeks = weeks.filter((week) => week.q > 0 || week.m > 0).length;
  // Kayit var ama son haftalarda hic yok (uzun ara): hedefin tamamiyla
  // degil, kademeli baslanir. Eskiden 4+ hafta ara verene 3 hafta ara
  // verenden DAHA COK is dusuyordu (hedefin tamami).
  if (observedWeeks === 0) {
    const base = fallbackCapacity(dailyQuestionGoal);
    return capMinutes({
      ...base,
      questionsPerWeek: Math.max(20, Math.round(base.questionsPerWeek * 0.6)),
      minutesPerWeek: Math.max(60, Math.round(base.minutesPerWeek * 0.6)),
      comeback: true,
    });
  }

  // Ortalama değil MEDYAN: tek bir maraton hafta ya da tek boş hafta
  // kapasiteyi yanıltmasın.
  const med = (arr) => {
    const a = [...arr].sort((x, y) => x - y);
    const i = Math.floor(a.length / 2);
    return a.length % 2 ? a[i] : Math.round((a[i - 1] + a[i]) / 2);
  };

  // Eskiden bos haftalar da medyana giriyordu: 4 haftanin 2'si bossa tempo
  // yariya, 3'u bossa sifira iniyordu (700 soruluk haftadan sonra "haftada
  // 10 soru"). Tempo AKTIF haftalardan, duzenlilik ayri carpan.
  const active = weeks.filter((week) => week.q > 0 || week.m > 0);
  // Dondurmadan donus: ara zaten bilinen bir ara; bos haftalar duzenlilik
  // cezasi DEGIL (rampa ayrica kademeli getiriyor, ikisi ust uste binmesin).
  const consistency = recovering ? 1 : consistencyFactor(observedWeeks, weeks.length);
  const observedQ = Math.round(med(active.map((w) => w.q)) * consistency);
  const observedM = Math.round(med(active.map((w) => w.m)) * consistency);
  const activeDays = med(active.map((w) => w.days.size));

  // Hedefe dogru esnet; hedefin ustunde calisan ogrenciyi yavaslatma.
  const goalQ = Math.max(20, Math.round((Number(dailyQuestionGoal) || 20) * 7));
  const stretchedQ = observedQ >= goalQ ? observedQ : Math.min(goalQ, Math.round(observedQ * STRETCH));
  // Az veride plan beyan edilen hedefe yaslanir: ilk haftalar alisma
  // donemi, tek haftanin temposu kisinin gercek temposu degil. 3 gozlenen
  // haftada tamamen olculen tempo.
  const trust = Math.min(1, observedWeeks / 3);
  const goalFloor = Math.round(goalQ * GOAL_FLOOR_SHARE);
  const plannedQ = stretchedQ >= goalFloor || trust >= 1
    ? stretchedQ
    : Math.round(trust * stretchedQ + (1 - trust) * goalFloor);
  const stretch = observedQ > 0 ? plannedQ / observedQ : 1;

  return capMinutes({
    questionsPerWeek: Math.max(10, plannedQ),
    minutesPerWeek: Math.max(30, Math.round(observedM * stretch)),
    observedMinutesPerWeek: observedM,
    activeDaysPerWeek: Math.max(1, Math.min(7, activeDays || 4)),
    observedQuestionsPerWeek: observedQ,
    goalQuestionsPerWeek: goalQ,
    stretch: Math.round(stretch * 100) / 100,
    source: "history",
    confidence: observedWeeks >= 3 ? "high" : observedWeeks >= 2 ? "medium" : "low",
    weeksObserved: observedWeeks,
    calendarWeeks: weeks.length,
    zeroWeeks: weeks.length - observedWeeks,
  });
}

/**
 * Ara verme / dondurma sonrası kapasiteyi kademeli geri getir.
 * Bir kişi 3 hafta ara verdiyse ilk hafta eski temposuna dönemez; rota
 * bunu varsayarsa daha ilk günden borç birikir ve kullanıcı vazgeçer.
 */
export function rampedCapacity(base, recoveryWeek = null) {
  if (recoveryWeek == null || recoveryWeek < 0) return base;
  const ramp = Math.min(1, 0.55 + 0.15 * recoveryWeek); // %55 → %100
  return {
    ...base,
    questionsPerWeek: Math.round(base.questionsPerWeek * ramp),
    minutesPerWeek: Math.round(base.minutesPerWeek * ramp),
    ramped: ramp < 1,
    rampFactor: Math.round(ramp * 100) / 100,
  };
}
