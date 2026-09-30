import { mondayOf } from "./dayKeys.js";

// GELECEK HAFTADAN ONE CEK -- saf kurallar.
//
// Ogrenci bu haftanin duraklarini bitirdiyse bos kalmasin: gelecek haftanin
// ilk acik duragini bugune alabilir. Ayri bir kayit yok; tasima haritasina
// (route_prefs.stop_moves) bugunun tarihi yazilir. Gun dagitimi (assignWeekStops)
// yalniz KENDI haftasindaki tarihlere uyuyor; baska haftaya tasinan durak
// burada o haftaya aktarilir, sonra dagitim onu tasindigi gune koyar.

const weekMonday = (week) => (week?.weekStart ? mondayOf(String(week.weekStart).slice(0, 10)) : null);
const OPEN = new Set(["active", "upcoming"]);

/** Tasima tarihi ONCEKI bir haftaya dusen duraklari o haftaya aktarir. */
export function applyPulls(weeks = [], moves = {}) {
  if (!weeks.length || !moves || !Object.keys(moves).length) return weeks;
  const byMonday = new Map(weeks.map((w, i) => [weekMonday(w), i]));
  const extra = weeks.map(() => []);
  let changed = false;
  const kept = weeks.map((week, i) => {
    const own = weekMonday(week);
    const stops = (week.stops || []).filter((stop) => {
      const target = stop?.logicalStopKey ? moves[stop.logicalStopKey] : null;
      if (!target) return true;
      const to = byMonday.get(mondayOf(target));
      if (to == null || to >= i || mondayOf(target) === own) return true;
      extra[to].push({ ...stop, pulledForward: true });
      changed = true;
      return false;
    });
    return stops.length === (week.stops || []).length ? week : { ...week, stops };
  });
  if (!changed) return weeks;
  return kept.map((week, i) => (extra[i].length ? { ...week, stops: [...(week.stops || []), ...extra[i]] } : week));
}

/**
 * One cekilecek durak: bu haftada acik rota duragi kalmadiysa gelecek
 * haftanin ilk acik duragi. Rutin (habit) ve kimligi olmayan durak cekilmez.
 */
export function pullCandidate(weeks = [], todayKey) {
  if (!todayKey) return null;
  const thisMonday = mondayOf(todayKey);
  const idx = weeks.findIndex((w) => weekMonday(w) === thisMonday);
  if (idx < 0 || !weeks[idx + 1]) return null;
  const open = (s) => OPEN.has(s?.lifecycleStatus) && s?.logicalStopKey && !String(s.logicalStopKey).startsWith("habit:");
  if ((weeks[idx].stops || []).some(open)) return null;
  return (weeks[idx + 1].stops || []).find(open) || null;
}
