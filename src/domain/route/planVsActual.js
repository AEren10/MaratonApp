import { ROUTE_STOP_STATUS } from "./stopStatus.js";

const DONE = new Set([ROUTE_STOP_STATUS.COMPLETED]);

/**
 * PLAN vs GERCEK — rotanin sozu ile gerceklesen arasindaki fark.
 *
 * Tasarim (AKIS 7 · "Plan vs Gercek") iki sayi gosteriyor: bugune kadar
 * kac durak bitmeliydi, kac durak bitti. Ikisi de duraktan sayilir;
 * net tahmini burada KULLANILMAZ -- net tahmini ayri bir model ve
 * "sozunu tuttun mu" sorusunun cevabi degil.
 *
 * Gecmis hafta = weekStart bugunden once baslamis hafta. Icinde
 * bulunulan hafta henuz bitmedigi icin "bitmeliydi"ye sayilmaz.
 */
export function buildPlanVsActual(weeks = [], now = new Date()) {
  const today = new Date(now);
  const series = [];
  let plannedCum = 0;
  let doneCum = 0;
  let plannedDue = 0;
  let doneDue = 0;

  for (const week of weeks) {
    const stops = week.stops || [];
    plannedCum += stops.length;
    const doneHere = stops.filter((s) => DONE.has(s.lifecycleStatus)).length;
    doneCum += doneHere;

    const start = week.weekStart ? new Date(week.weekStart) : null;
    const end = start ? new Date(start.getTime() + 7 * 86400000) : null;
    const elapsed = Boolean(end && end <= today);
    if (elapsed) {
      plannedDue += stops.length;
      doneDue += doneHere;
    }

    series.push({
      weekStart: week.weekStart || null,
      weekNo: week.weekNo ?? series.length + 1,
      planned: plannedCum,
      // Gelecek haftada "gerceklesen" diye bir sey yok; hat bugunde biter.
      done: elapsed || doneHere > 0 ? doneCum : null,
      elapsed,
    });
  }

  const gap = Math.max(0, plannedDue - doneDue);

  return {
    series,
    plannedDue,
    doneDue,
    gap,
    ahead: doneDue > plannedDue,
    totalPlanned: plannedCum,
    totalDone: doneCum,
    hasData: series.length > 0 && plannedCum > 0,
  };
}

/**
 * Bosluk kac haftada kapanir — kalan hafta sayisina bolerek.
 * Kalan hafta yoksa null: "0 haftada kapanir" gibi bir sey soylenemez.
 */
export function gapClosurePlan(gap, remainingWeeks) {
  if (!gap || gap <= 0) return null;
  const weeks = Math.max(0, Number(remainingWeeks) || 0);
  if (weeks === 0) return { weeks: 0, perWeek: null, feasible: false };
  const perWeek = Math.ceil(gap / weeks);
  // Uc haftaya yaymak makul ust sinir; daha kisasi haftalik yuku ikiye katlar.
  const spread = Math.min(weeks, 3);
  return { weeks: spread, perWeek: Math.ceil(gap / spread), feasible: true };
}
