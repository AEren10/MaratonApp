import { inRange, toKey } from "./dateKeys.js";
import { ROUTE_STOP_STATUS } from "../route/stopStatus.js";

const logKey = (log) => toKey(log?.study_date ?? log?.date);
const logQuestions = (log) => Number(log?.questionCount ?? log?.question_count ?? 0) || 0;
const logMinutes = (log) => Number(log?.duration ?? log?.duration_minutes ?? 0) || 0;

/** Donem icindeki calisma kayitlarinin toplami. */
export function aggregateLogs(logs = [], startKey, endKey) {
  const byDay = new Map();
  const bySubject = new Map();
  let questions = 0;
  let minutes = 0;

  for (const log of logs) {
    const key = logKey(log);
    if (!inRange(key, startKey, endKey)) continue;
    const q = logQuestions(log);
    const m = logMinutes(log);
    questions += q;
    minutes += m;
    const day = byDay.get(key) || { questions: 0, minutes: 0 };
    day.questions += q;
    day.minutes += m;
    byDay.set(key, day);
    const subjectKey = log.subject || "other";
    const subject = bySubject.get(subjectKey) || { key: subjectKey, questions: 0, minutes: 0 };
    subject.questions += q;
    subject.minutes += m;
    bySubject.set(subjectKey, subject);
  }

  const subjects = [...bySubject.values()]
    .sort((a, b) => b.questions - a.questions || b.minutes - a.minutes);

  return { questions, minutes, activeDays: byDay.size, byDay, subjects };
}

/**
 * Durak sayilari. planned: haftasi donem icinde baslayan rota duraklari.
 * done: tamamlanma gunu donem icinde olan duraklar (hangi haftaya ait
 * olursa olsun -- devreden durak da o gun gecildi).
 */
export function countStops(routeWeeks = [], startKey, endKey) {
  let planned = 0;
  let done = 0;
  for (const week of routeWeeks) {
    const stops = week.stops || [];
    if (inRange(toKey(week.weekStart), startKey, endKey)) planned += stops.length;
    for (const stop of stops) {
      if (stop.lifecycleStatus === ROUTE_STOP_STATUS.COMPLETED && inRange(stop.completedKey, startKey, endKey)) {
        done += 1;
      }
    }
  }
  return { planned, done };
}

/** En yuksek iki (sifir olmayan) cubuk vurgulanir -- tasarimda iki kizil cubuk. */
export function markTopBars(bars, count = 2) {
  const top = bars
    .map((bar, index) => ({ index, value: bar.questions }))
    .filter((b) => b.value > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, count)
    .map((b) => b.index);
  return bars.map((bar, index) => ({ ...bar, highlight: top.includes(index) }));
}

export function percentChange(current, previous) {
  if (!previous) return null;
  return Math.round(((current - previous) / previous) * 100);
}
