import { subjectPaletteKey } from "../../themes/subjectPalette.js";
import { studyWeekdays } from "./classSchedule.js";
import { addDays, mondayOf } from "./dayKeys.js";

// ROTA DURAKLARINI GUNLERE DAGITMA — Program ve Aylık Plan gorunumleri icin.
//
// Rota motoru duraklari HAFTAYA atar, gune atamaz. Kurallar:
// - Durak once kendi dersinin gunune (ders programi), eslesmezse calisma
//   gunlerine. Deneme ve bos gunlere durak dusmez. Sira korunur.
// - Yuk DAKIKA ile dengelenir, durak sayisiyla degil: 90 dakikalik durak
//   15 dakikalikla ayni yuk sayiliyordu.
// - Gun kapasitesi: ders programindaki gun dakikasi; yoksa ogrencinin gun
//   ritmi (weekdayRhythm); o da yoksa esit.
// - Hafta tekrari haftanin SON calisma gunune duser: konular once gorulur.

const FALLBACK_MINUTES = 30;
const stopMinutes = (stop) => Number(stop?.cost?.minutes ?? stop?.minutes) || FALLBACK_MINUTES;
const isWeeklyReview = (stop) => String(stop?.reviewCycle || "").startsWith("weekly");

function subjectDays(schedule, key) {
  if (!key || !Array.isArray(schedule)) return [];
  return schedule
    .filter((d) => d.kind === "study" && d.subjects.some((s) => subjectPaletteKey(s) === key))
    .map((d) => d.weekday);
}

function dayCapacity(schedule, rhythm) {
  const cap = Array(7).fill(1);
  if (Array.isArray(schedule)) {
    // Dakikasi girilmemis calisma gunu, girilenlerin ortalamasini alir;
    // yoksa 1 ile 180 ayni olcekte karsilasirdi.
    const set = schedule.filter((d) => d.kind === "study" && Number(d.minutes) > 0);
    const avg = set.length ? set.reduce((n, d) => n + Number(d.minutes), 0) / set.length : 1;
    schedule.forEach((d) => { if (d.kind === "study") cap[d.weekday] = Number(d.minutes) > 0 ? Number(d.minutes) : avg; });
  } else if (Array.isArray(rhythm) && rhythm.length === 7) {
    rhythm.forEach((w, i) => { cap[i] = Math.max(0.1, Number(w) || 1); });
  }
  return cap;
}

// En dusuk doluluk (yuk / kapasite) olan gun; esitlikte erken gun.
function leastFilled(candidates, load, cap, minutes) {
  return candidates.reduce((best, day) => (
    (load[day] + minutes) / cap[day] < (load[best] + minutes) / cap[best] ? day : best
  ), candidates[0]);
}

/** Tek hafta: 7 elemanli dizi, her eleman o gunun duraklari. */
export function assignWeekStops(stops = [], schedule = null, { rhythm = null } = {}) {
  const days = Array.from({ length: 7 }, () => []);
  const allowed = studyWeekdays(schedule);
  if (allowed.length === 0) return days;
  const load = Array(7).fill(0);
  const cap = dayCapacity(schedule, rhythm);
  const lastDay = Math.max(...allowed);

  stops.forEach((stop) => {
    const m = stopMinutes(stop);
    let day;
    if (isWeeklyReview(stop)) {
      day = lastDay;
    } else {
      const own = subjectDays(schedule, subjectPaletteKey(stop.subject)).filter((d) => allowed.includes(d));
      day = leastFilled(own.length ? own : allowed, load, cap, m);
    }
    days[day].push(stop);
    load[day] += m;
  });
  return days;
}

/**
 * Tum haftalar: { "YYYY-MM-DD": stops[] }. weekStart olmayan hafta
 * atlanir — tarihi bilinmeyen durak bir gune yazilamaz.
 */
export function assignRouteStopsToDates(weeks = [], schedule = null, opts = {}) {
  const out = {};
  weeks.forEach((week) => {
    if (!week?.weekStart) return;
    const monday = mondayOf(String(week.weekStart).slice(0, 10));
    assignWeekStops(week.stops || [], schedule, opts).forEach((dayStops, i) => {
      if (!dayStops.length) return;
      const key = addDays(monday, i);
      out[key] = (out[key] || []).concat(dayStops);
    });
  });
  return out;
}
