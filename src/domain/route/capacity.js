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
const MS_WEEK = 7 * 86400000;

/** Beyan edilen günlük hedeften haftalık taban kapasite. */
function fallbackCapacity(dailyQuestionGoal) {
  const daily = Number(dailyQuestionGoal) || 20;
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
  { dataState = "ready" } = {},
) {
  if (dataState === "error") {
    return { ...fallbackCapacity(dailyQuestionGoal), missingData: true };
  }
  if (!Array.isArray(logs) || logs.length === 0) {
    return fallbackCapacity(dailyQuestionGoal);
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

  const weeks = [...buckets.values()];
  const observedWeeks = weeks.filter((week) => week.q > 0 || week.m > 0).length;
  if (observedWeeks === 0) return fallbackCapacity(dailyQuestionGoal);

  // Ortalama değil MEDYAN: tek bir maraton hafta ya da tek boş hafta
  // kapasiteyi yanıltmasın.
  const med = (arr) => {
    const a = [...arr].sort((x, y) => x - y);
    const i = Math.floor(a.length / 2);
    return a.length % 2 ? a[i] : Math.round((a[i - 1] + a[i]) / 2);
  };

  const questions = med(weeks.map((w) => w.q));
  const minutes = med(weeks.map((w) => w.m));
  const activeDays = med(weeks.map((w) => w.days.size));

  return {
    questionsPerWeek: Math.max(10, questions),
    minutesPerWeek: Math.max(30, minutes),
    activeDaysPerWeek: Math.max(1, Math.min(7, activeDays || 4)),
    source: "history",
    confidence: observedWeeks >= 3 ? "high" : observedWeeks >= 2 ? "medium" : "low",
    weeksObserved: observedWeeks,
    calendarWeeks: weeks.length,
    zeroWeeks: weeks.length - observedWeeks,
  };
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
