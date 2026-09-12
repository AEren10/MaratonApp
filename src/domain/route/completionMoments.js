import { ROUTE_STOP_STATUS } from "./stopStatus.js";
import { dateKey } from "../../lib/dateUtils.js";

// AKIS 16 tamamlama anlari. Uc an da mevcut durumdan TURER; ayri bir
// bayrak ya da esik uydurulmaz.
//   gun   — bugunun plan kartindaki tum maddeler isaretli (TodayPlanCard)
//   hafta — rotanin icinde bulunulan haftasindaki tum duraklar COMPLETED
//   rota  — mufredatta bekleyen konu kalmadi (totals.pending === 0)

export function summarizeWeekCompletion(currentWeek) {
  const stops = currentWeek?.stops || [];
  const done = stops.filter((s) => s.lifecycleStatus === ROUTE_STOP_STATUS.COMPLETED).length;
  return {
    key: currentWeek?.weekStart || null,
    planned: stops.length,
    done,
    complete: stops.length > 0 && done === stops.length,
  };
}

// Geri donus (AKIS 14) icin haftanin durak ozeti: bekleyen durak ve bugun
// kapanan durak. completedAt = duragin updated_at'i (bkz. useStudyRoute).
export function summarizeComebackStops(currentWeek, now = new Date()) {
  const stops = currentWeek?.stops || [];
  const today = dateKey(now);
  let pendingStops = 0;
  let stopsClosedToday = 0;
  for (const stop of stops) {
    if (stop.lifecycleStatus !== ROUTE_STOP_STATUS.COMPLETED) pendingStops += 1;
    else if (stop.completedAt && dateKey(new Date(stop.completedAt)) === today) stopsClosedToday += 1;
  }
  return { pendingStops, stopsClosedToday };
}

export function isRouteComplete(totals) {
  return (totals?.topics || 0) > 0 && totals?.pending === 0;
}

function eligible({ seen, routeComplete, week, dayKey }) {
  return {
    route: routeComplete && !seen.route,
    week: Boolean(week?.complete && week.key && seen.week !== week.key),
    day: Boolean(dayKey && seen.day !== dayKey),
  };
}

// Oncelik rota > hafta > gun. Ayni anda birden fazlasi hak kazanirsa
// yalniz en buyugu gosterilir; kapatilinca digerleri de gorulmus sayilir,
// ust uste modal zinciri kurulmaz.
export function pickCompletionMoment({ seen, routeComplete, week, dayKey }) {
  if (!seen) return null;
  const e = eligible({ seen, routeComplete, week, dayKey });
  if (e.route) return "route";
  if (e.week) return "week";
  if (e.day) return "day";
  return null;
}

export function markCompletionSeen({ seen, routeComplete, week, dayKey }) {
  const base = seen || {};
  const e = eligible({ seen: base, routeComplete, week, dayKey });
  return {
    ...base,
    ...(e.route ? { route: true } : null),
    ...(e.week ? { week: week.key } : null),
    ...(e.day ? { day: dayKey } : null),
  };
}
