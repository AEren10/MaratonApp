import { subjectPaletteKey } from "../../themes/subjectPalette.js";
import { studyWeekdays } from "./classSchedule.js";
import { addDays, mondayOf } from "./dayKeys.js";

// ROTA DURAKLARINI GUNLERE DAGITMA — Program ve Aylık Plan gorunumleri icin.
//
// Rota motoru duraklari HAFTAYA atar, gune atamaz. Haftalik ders programi
// ("rota durakları o günlere düşsün") tanimliysa durak once kendi dersinin
// gunune, o gunlerin en bos olanina duser; ders eslesmezse ders gunlerinin
// en bosuna. Program tanimsizsa haftanin yedi gunune esit yayilir.
// Deneme ve bos gunlere durak dusmez. Sira (position) korunur.

function subjectDays(schedule, key) {
  if (!key || !Array.isArray(schedule)) return [];
  return schedule
    .filter((d) => d.kind === "study" && d.subjects.some((s) => subjectPaletteKey(s) === key))
    .map((d) => d.weekday);
}

function leastLoaded(candidates, load) {
  return candidates.reduce((best, day) => (load[day] < load[best] ? day : best), candidates[0]);
}

/** Tek hafta: 7 elemanli dizi, her eleman o gunun duraklari. */
export function assignWeekStops(stops = [], schedule = null) {
  const days = Array.from({ length: 7 }, () => []);
  const allowed = studyWeekdays(schedule);
  if (allowed.length === 0) return days;
  const load = Array(7).fill(0);

  stops.forEach((stop) => {
    const own = subjectDays(schedule, subjectPaletteKey(stop.subject)).filter((d) => allowed.includes(d));
    const day = leastLoaded(own.length ? own : allowed, load);
    days[day].push(stop);
    load[day] += 1;
  });
  return days;
}

/**
 * Tum haftalar: { "YYYY-MM-DD": stops[] }. weekStart olmayan hafta
 * atlanir — tarihi bilinmeyen durak bir gune yazilamaz.
 */
export function assignRouteStopsToDates(weeks = [], schedule = null) {
  const out = {};
  weeks.forEach((week) => {
    if (!week?.weekStart) return;
    const monday = mondayOf(String(week.weekStart).slice(0, 10));
    assignWeekStops(week.stops || [], schedule).forEach((dayStops, i) => {
      if (!dayStops.length) return;
      const key = addDays(monday, i);
      out[key] = (out[key] || []).concat(dayStops);
    });
  });
  return out;
}
