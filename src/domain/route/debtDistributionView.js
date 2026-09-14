import { MONTHS_SHORT_TR } from "../../lib/trWords.js";
import { parseDayKey, addDays } from "../program/dayKeys.js";

// BORC DAGITILDI — "Dağıtım önce gösteriliyor, sonra rotaya işleniyor."
//
// Sayilar distributeDebt ciktisindan (haftaya dusen borc sorusu). Soru ->
// dakika cevrimi computeDebt'in kendi oraniyla (debt.totalMinutes /
// debt.totalQuestions); oran yoksa dakika gosterilmez. Konu adlari
// gecilmeyen duraklarin haftalara dakika payina gore sirayla yerlesmesi.

const MAX_WEEKS = 3;

function rangeLabel(week) {
  if (!week?.weekStart) return null;
  const startKey = String(week.weekStart).slice(0, 10);
  const endKey = week.weekEnd ? String(week.weekEnd).slice(0, 10) : addDays(startKey, 6);
  const a = parseDayKey(startKey);
  const b = parseDayKey(endKey);
  const ma = MONTHS_SHORT_TR[a.getUTCMonth()];
  const mb = MONTHS_SHORT_TR[b.getUTCMonth()];
  return ma === mb
    ? `${a.getUTCDate()}-${b.getUTCDate()} ${mb}`
    : `${a.getUTCDate()} ${ma}-${b.getUTCDate()} ${mb}`;
}

export function buildDebtDistributionView({ distribution, debt, stops = [] } = {}) {
  const weeks = (distribution?.weeks || []).filter((w) => (w.debtQuestions || 0) > 0).slice(0, MAX_WEEKS);
  if (!weeks.length) return null;

  const perQuestion = debt?.totalQuestions > 0 && debt?.totalMinutes > 0
    ? debt.totalMinutes / debt.totalQuestions
    : null;

  let cursor = 0;
  let allocated = 0;
  let target = 0;
  const rows = weeks.map((week, i) => {
    const minutes = perQuestion != null ? Math.round(week.debtQuestions * perQuestion) : null;
    target += minutes || 0;
    const topics = [];
    const isLast = i === weeks.length - 1;
    while (cursor < stops.length && (isLast || allocated < target)) {
      topics.push(stops[cursor].stop?.topic || stops[cursor].title);
      allocated += stops[cursor].minutes || 0;
      cursor += 1;
    }
    return {
      key: week.weekStart || String(i),
      order: i + 1,
      range: rangeLabel(week),
      minutes,
      questions: week.debtQuestions,
      topics: topics.filter(Boolean),
      baseStops: (week.stops || []).length,
      plannedQuestions: week.plannedQuestions || 0,
      totalQuestions: week.totalQuestions || 0,
    };
  });

  const planned = rows.reduce((s, r) => s + r.plannedQuestions, 0);
  const assigned = rows.reduce((s, r) => s + r.questions, 0);
  const first = rows[0];

  return {
    rows,
    weekCount: rows.length,
    loadIncreasePct: planned > 0 ? Math.round((assigned / planned) * 100) : null,
    uncovered: distribution?.uncovered || 0,
    firstWeek: {
      stops: first.baseStops + first.topics.length,
      questions: first.totalQuestions,
      minutesPerDay: first.minutes != null ? Math.round(first.minutes / 7) : null,
    },
  };
}
