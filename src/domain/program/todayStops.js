import { assignWeekStops } from "./assignStopsToDays.js";
import { mondayOf, weekdayIndex } from "./dayKeys.js";

// BIR GUNUN DURAKLARI — tek kaynak.
//
// Ana sayfa ve gunun plani eskiden haftanin TUM duraklarindan kendi
// secimini yapiyordu (generateDailyPlan); Program > Hafta ise ders
// programina gore dagitiyordu. Ayni gun iki farkli liste cikiyordu.
// Artik gunun duraklari hep ders programi dagilimindan okunur. Bugun
// tamamlanan durak hangi gune dusmus olursa olsun bugunun listesinde kalir.
//
// opts.rhythm: ogrencinin gun ritmi (weekdayRhythm) -- dagitimi etkiler,
// o yuzden her ekran AYNI degeri gecmeli.

const CLOSED = new Set(["completed", "skipped", "rescheduled", "frozen"]);
// Bu haftanin gecmis gunlerinden bugune tasinan en fazla durak. Fazlasi
// gununde kalir; hafta bitince "Geride kalan konular"a duser.
export const CARRY_LIMIT = 2;

export function stopsForDate(week, schedule, dateKey, opts = {}) {
  if (!week || !dateKey) return [];
  const monday = mondayOf(week.weekStart ? String(week.weekStart).slice(0, 10) : dateKey);
  if (mondayOf(dateKey) !== monday) return [];
  return assignWeekStops(week.stops || [], schedule, { ...opts, monday, firstDate: week.planStartDay })[weekdayIndex(dateKey)] || [];
}

export function todayPlanStops(week, schedule, todayKey, {
  isCompletedToday = () => false, rhythm = null, moves = null, blockedDates = null, examDate = null,
} = {}) {
  if (!week || !todayKey) return [];
  const monday = mondayOf(week.weekStart ? String(week.weekStart).slice(0, 10) : todayKey);
  if (mondayOf(todayKey) !== monday) return [];
  const days = assignWeekStops(week.stops || [], schedule, {
    rhythm, moves, monday, blockedDates, examDate, firstDate: week.planStartDay,
  });
  const todayIdx = weekdayIndex(todayKey);
  const own = days[todayIdx] || [];
  const ownSet = new Set(own);

  // KACIRILAN DURAK: pazartesi yapilmayan durak eskiden o gunde kalip
  // gozden kayboluyordu; hafta bitene kadar hicbir listede yoktu. Bitmemis
  // olanlar (en eskiden) bugune tasinir.
  const carried = days.slice(0, todayIdx).flat()
    .filter((s) => !CLOSED.has(s.lifecycleStatus) && !isCompletedToday(s))
    .slice(0, CARRY_LIMIT);
  const carriedSet = new Set(carried);

  const doneElsewhere = (week.stops || [])
    .filter((s) => !ownSet.has(s) && !carriedSet.has(s) && isCompletedToday(s));
  // Listede neden durdugu belli olsun: gerekcenin basina "Bu haftadan kalan".
  const carriedStops = carried.map((s) => ({
    ...s,
    carried: true,
    insight: {
      ...(s.insight || {}),
      reasonText: `Bu haftadan kalan · ${s.insight?.reasonText || "yapılmamış durak"}`,
    },
  }));
  return [...own, ...carriedStops, ...doneElsewhere];
}
