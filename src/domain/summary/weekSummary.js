import { addDays, dayOfMonth, toKey } from "./dateKeys.js";
import { aggregateLogs, countStops, markTopBars, percentChange } from "./activity.js";
import { DAYS_FULL, DAYS_SHORT, formatInt, formatShortHours, spanLabel } from "./summaryFormat.js";
import { rangeHeaderLabel } from "./periodRange.js";

/**
 * "Bu hafta rotanin en verimli haftasi oldu." yalniz dogruysa soylenir:
 * rotanin ilk haftasindan bu yana kapanmis her haftadan fazla soru, ve
 * karsilastirilacak en az bir onceki hafta var.
 */
export function isBestRouteWeek(logs, range, routeWeeks = []) {
  const routeStart = toKey(routeWeeks[0]?.weekStart);
  if (!routeStart || routeStart > range.prevStart) return false;
  const current = aggregateLogs(logs, range.start, range.end).questions;
  if (current <= 0) return false;
  for (let start = routeStart; start < range.start; start = addDays(start, 7)) {
    if (aggregateLogs(logs, start, addDays(start, 6)).questions >= current) return false;
  }
  return true;
}

export function buildWeekSummary({ range, logs = [], routeWeeks = [] }) {
  const cur = aggregateLogs(logs, range.start, range.end);
  const prev = aggregateLogs(logs, range.prevStart, range.prevEnd);
  const stops = countStops(routeWeeks, range.start, range.end);
  const prevStops = countStops(routeWeeks, range.prevStart, range.prevEnd);

  const bars = markTopBars(range.days.map((key, i) => ({
    key,
    label: DAYS_SHORT[i],
    questions: cur.byDay.get(key)?.questions || 0,
  })));

  const best = bars.reduce((acc, bar, i) => (bar.questions > (acc?.questions || 0) ? { ...bar, i } : acc), null);
  const routeWeek = routeWeeks.find((w) => toKey(w.weekStart) === range.start);
  const stopDelta = stops.done - prevStops.done;

  return {
    period: "week",
    headerLabel: rangeHeaderLabel(range),
    eyebrow: routeWeek?.weekNo ? `${routeWeek.weekNo}. HAFTA` : null,
    headline: isBestRouteWeek(logs, range, routeWeeks) ? "Bu hafta rotanın en verimli haftası oldu." : null,
    hero: { value: formatInt(cur.questions), label: `SORU · ${spanLabel(range.start, range.end)}` },
    side: [
      {
        value: String(stops.done),
        suffix: stops.planned > 0 ? `/${stops.planned}` : null,
        label: stopDelta !== 0 && prevStops.done > 0 ? `DURAK ${stopDelta > 0 ? "+" : "−"}${Math.abs(stopDelta)}` : "DURAK",
      },
      { value: formatShortHours(cur.minutes), label: "SÜRE" },
    ],
    bestLine: best ? { label: "HAFTANIN EN VERİMLİ GÜNÜ", value: `${DAYS_FULL[best.i]} · ${formatInt(best.questions)} soru` } : null,
    chart: { label: "GÜNLERİN", trailing: `${formatInt(cur.questions)} soru`, bars },
    promise: stops.planned > 0
      ? { title: `Plana göre ${stops.planned} durak, gerçekte ${stops.done}.`, body: "Farkın nereden geldiğini gör" }
      : null,
    totals: { ...pick(cur), stopsDone: stops.done, stopsPlanned: stops.planned },
    previous: { ...pick(prev), stopsDone: prevStops.done },
    questionsDeltaPct: percentChange(cur.questions, prev.questions),
    hasActivity: cur.questions > 0 || cur.minutes > 0 || stops.done > 0,
  };
}

/** Gunun Ozeti · "SON 7 GÜN · SORU": son yedi gun, bugun vurgulu, ortalama cizgisi. */
export function buildRecentDays({ range, logs = [] }) {
  const cur = aggregateLogs(logs, range.start, range.end);
  const prev = aggregateLogs(logs, range.prevStart, range.prevEnd);
  const bars = range.days.map((key, i) => ({
    key,
    label: String(dayOfMonth(key)),
    questions: cur.byDay.get(key)?.questions || 0,
    highlight: i === range.days.length - 1,
  }));
  return {
    bars,
    average: Math.round(cur.questions / range.days.length),
    deltaPct: percentChange(cur.questions, prev.questions),
    activeDays: cur.activeDays,
  };
}

function pick(agg) {
  return { questions: agg.questions, minutes: agg.minutes, activeDays: agg.activeDays, subjects: agg.subjects };
}
