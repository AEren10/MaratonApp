import { assignWeekStops } from "./assignStopsToDays.js";
import { mondayOf, weekdayIndex } from "./dayKeys.js";

// BIR GUNUN DURAKLARI — tek kaynak.
//
// Ana sayfa ve gunun plani eskiden haftanin TUM duraklarindan kendi
// secimini yapiyordu (generateDailyPlan); Program > Hafta ise ders
// programina gore dagitiyordu. Ayni gun iki farkli liste cikiyordu.
// Artik gunun duraklari hep ders programi dagilimindan okunur. Bugun
// tamamlanan durak hangi gune dusmus olursa olsun bugunun listesinde kalir.

export function stopsForDate(week, schedule, dateKey) {
  if (!week || !dateKey) return [];
  const monday = mondayOf(week.weekStart ? String(week.weekStart).slice(0, 10) : dateKey);
  if (mondayOf(dateKey) !== monday) return [];
  return assignWeekStops(week.stops || [], schedule)[weekdayIndex(dateKey)] || [];
}

export function todayPlanStops(week, schedule, todayKey, { isCompletedToday = () => false } = {}) {
  const own = stopsForDate(week, schedule, todayKey);
  const ownSet = new Set(own);
  const doneElsewhere = (week?.stops || []).filter((s) => !ownSet.has(s) && isCompletedToday(s));
  return [...own, ...doneElsewhere];
}
