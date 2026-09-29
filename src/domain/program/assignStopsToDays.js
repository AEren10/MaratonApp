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
// - Ogrencinin tasidigi durak (opts.moves: logicalStopKey -> tarih) o gune
//   yerlesir; algoritma sorgulamaz. Son soz ogrencinin.

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
  // Ders programi her zaman dizi (bos sablon dahil); dakika girilmemisse
  // program kapasite soylemiyor demektir, ritim devreye girer.
  const scheduleMinutes = Array.isArray(schedule) && schedule.some((d) => d.kind === "study" && Number(d.minutes) > 0);
  if (scheduleMinutes) {
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
// Tasinmis durak bu haftanin hangi gunune (0..6)? Hafta disiysa null.
function movedDayIndex(stop, moves, monday) {
  const target = moves && stop?.logicalStopKey ? moves[stop.logicalStopKey] : null;
  if (!target || !monday) return null;
  const idx = Math.round((new Date(`${target}T12:00:00`) - new Date(`${monday}T12:00:00`)) / 86400000);
  return idx >= 0 && idx < 7 ? idx : null;
}

export function assignWeekStops(stops = [], schedule = null, {
  rhythm = null, moves = null, monday = null, blockedDates = null, firstDate = null,
} = {}) {
  const days = Array.from({ length: 7 }, () => []);
  // Deneme provasi gunu (blockedDates) calisma gunu sayilmaz: ana sayfa o gun
  // durak gostermiyordu ama Program gosteriyordu.
  const blocked = new Set((blockedDates || [])
    .map((d) => (monday ? Math.round((new Date(`${d}T12:00:00`) - new Date(`${monday}T12:00:00`)) / 86400000) : -1))
    .filter((i) => i >= 0 && i < 7));
  // Plan hafta ortasinda basladiysa (firstDate) onceki gunlere durak dusmez;
  // yoksa yeni ogrenci "bu haftadan kalan" diye var olmadigi gunlerin isini
  // bugune tasiyordu.
  const firstIdx = firstDate && monday
    ? Math.round((new Date(`${firstDate}T12:00:00`) - new Date(`${monday}T12:00:00`)) / 86400000)
    : 0;
  const base = studyWeekdays(schedule).filter((d) => !blocked.has(d));
  const fromFirst = base.filter((d) => d >= firstIdx);
  const allowed = fromFirst.length ? fromFirst : base;
  if (allowed.length === 0) return days;
  const load = Array(7).fill(0);
  const cap = dayCapacity(schedule, rhythm);
  const lastDay = Math.max(...allowed);

  // Once ogrencinin tasidiklari: gunlerin yukune onlar sayilir.
  const free = [];
  stops.forEach((stop) => {
    const idx = movedDayIndex(stop, moves, monday);
    if (idx == null) { free.push(stop); return; }
    days[idx].push(stop);
    load[idx] += stopMinutes(stop);
  });

  free.forEach((stop) => {
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
    assignWeekStops(week.stops || [], schedule, { ...opts, monday, firstDate: week.planStartDay }).forEach((dayStops, i) => {
      if (!dayStops.length) return;
      const key = addDays(monday, i);
      out[key] = (out[key] || []).concat(dayStops);
    });
  });
  return out;
}
