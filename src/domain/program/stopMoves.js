import { studyWeekdays } from "./classSchedule.js";
import { addDays, mondayOf, weekdayIndex } from "./dayKeys.js";

// DURAK TASIMA / ERTELEME -- saf kurallar.
// Tasima haritasi: { logicalStopKey: "YYYY-MM-DD" }. Sunucuda route_prefs.stop_moves.

const KEEP_DAYS = 14;

/** Ertele: bu hafta icindeki bir sonraki calisma gunu; yoksa null (haftaya kalir). */
export function postponeTarget(todayKey, schedule) {
  const allowed = studyWeekdays(schedule);
  const monday = mondayOf(todayKey);
  const today = weekdayIndex(todayKey);
  const next = allowed.filter((d) => d > today).sort((a, b) => a - b)[0];
  return next == null ? null : addDays(monday, next);
}

/** Haritaya yaz; 14 gunden eski kayitlari at (sinirsiz buyumesin). */
export function withMove(moves = {}, logicalStopKey, dateKey, todayKey) {
  const floor = addDays(todayKey, -KEEP_DAYS);
  const next = Object.fromEntries(Object.entries(moves || {}).filter(([, d]) => d >= floor));
  if (logicalStopKey && dateKey) next[logicalStopKey] = dateKey;
  return next;
}
