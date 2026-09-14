import { subjectPaletteKey } from "../../themes/subjectPalette.js";
import { daysInMonth, monthKey } from "./dayKeys.js";

// AYLIK PLAN — "Program'ın ay sekmesi. Her gün planlanan durak sayısını
// nokta olarak taşıyor; ayın ders ağırlığı altta."
//
// Girdi: assignRouteStopsToDates ciktisi (gun -> duraklar). Ay disindaki
// gunler sayilmaz. Soru toplami duragin kendi maliyetinden (cost.questions).

export function buildMonthPlan(stopsByDate = {}, year, monthIndex, { weightLimit = 5 } = {}) {
  const prefix = monthKey(year, monthIndex);
  const total = daysInMonth(year, monthIndex);
  const days = [];
  const bySubject = new Map();
  let totalStops = 0;
  let totalQuestions = 0;
  let workDays = 0;

  for (let d = 1; d <= total; d += 1) {
    const key = `${prefix}-${String(d).padStart(2, "0")}`;
    const stops = stopsByDate[key] || [];
    if (stops.length) workDays += 1;
    totalStops += stops.length;
    stops.forEach((stop) => {
      totalQuestions += Number(stop.cost?.questions ?? stop.plannedQuestions) || 0;
      const subjectKey = subjectPaletteKey(stop.subject);
      if (!subjectKey) return;
      const prev = bySubject.get(subjectKey) || { key: subjectKey, subject: stop.subject, label: stop.subjectLabel || stop.subject, count: 0 };
      prev.count += 1;
      bySubject.set(subjectKey, prev);
    });
    days.push({ key, day: d, count: stops.length });
  }

  const weights = [...bySubject.values()].sort((a, b) => b.count - a.count).slice(0, weightLimit);
  const max = weights[0]?.count || 0;

  return {
    days,
    totalStops,
    totalQuestions,
    workDays,
    weights: weights.map((w) => ({ ...w, ratio: max > 0 ? w.count / max : 0 })),
    hasStops: totalStops > 0,
  };
}
