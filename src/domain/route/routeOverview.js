import { ROUTE_STOP_STATUS, routeStopEffectiveStatus } from "./stopStatus.js";

// ROTA DERINLIGI ekranlarinin (Rota Detay, Rotanin tamami, Durak Detayi)
// ortak okuma katmani. SAF: rota haftalarini alir, sayi ve liste dondurur.
// Durak gecisi / kalicilik mantigi burada DEGIL (useStudyRoute + routePlan).

export function routeStopKey(stop = {}, week = {}) {
  return stop.logicalStopKey
    || stop.stopId
    || [stop.subject, stop.topic, week.weekStart || stop.weekStart || ""].join(":");
}

export function flattenRouteStops(weeks = [], { routeFrozen = false } = {}) {
  const out = [];
  for (const week of weeks || []) {
    for (const stop of week.stops || []) {
      out.push({
        key: routeStopKey(stop, week),
        number: out.length + 1,
        stop,
        weekStart: week.weekStart || null,
        isCurrentWeek: Boolean(week.isCurrent),
        status: routeStopEffectiveStatus(stop, { routeFrozen }),
      });
    }
  }
  return out;
}

export function routeStopCounts(flat = []) {
  let completed = 0;
  let rescheduled = 0;
  for (const item of flat) {
    if (item.status === ROUTE_STOP_STATUS.COMPLETED) completed += 1;
    else if (item.status === ROUTE_STOP_STATUS.RESCHEDULED) rescheduled += 1;
  }
  return {
    total: flat.length,
    completed,
    rescheduled,
    queued: flat.length - completed - rescheduled,
  };
}

function segmentKind(status) {
  if (status === ROUTE_STOP_STATUS.COMPLETED) return "completed";
  if (status === ROUTE_STOP_STATUS.RESCHEDULED) return "rescheduled";
  return "queued";
}

// Tasarim durak basina bir cubuk ciziyor (11 durak = 11 cubuk). Uzun rotada
// cubuklar okunmaz hale gelir; o zaman hafta basina bir cubuk: hafta tamamen
// bittiyse tamamlandi, yeniden planlanan varsa yeniden planlandi, yoksa sirada.
export function routeProgressSegments(weeks = [], flat = [], maxStopSegments = 24) {
  if (flat.length <= maxStopSegments) return flat.map((item) => segmentKind(item.status));
  const byWeek = new Map();
  for (const item of flat) {
    const kinds = byWeek.get(item.weekStart) || [];
    kinds.push(segmentKind(item.status));
    byWeek.set(item.weekStart, kinds);
  }
  return (weeks || []).map((week) => {
    const kinds = byWeek.get(week.weekStart || null) || [];
    if (kinds.length && kinds.every((k) => k === "completed")) return "completed";
    if (kinds.includes("rescheduled")) return "rescheduled";
    return "queued";
  });
}

const OPEN = new Set([ROUTE_STOP_STATUS.ACTIVE, ROUTE_STOP_STATUS.UPCOMING]);

export function upcomingRouteStops(flat = [], limit = 3) {
  return flat.filter((item) => OPEN.has(item.status)).slice(0, limit);
}

export function findRouteStop(flat = [], key) {
  const index = flat.findIndex((item) => item.key === key);
  if (index < 0) return null;
  const entry = flat[index];
  const subjectCompleted = flat.filter((item) => (
    item.stop.subject === entry.stop.subject && item.status === ROUTE_STOP_STATUS.COMPLETED
  )).length;
  return {
    entry,
    prev: flat[index - 1] || null,
    next: flat[index + 1] || null,
    subjectCompleted,
  };
}

const TR_MONTHS = ["OCA", "ŞUB", "MAR", "NİS", "MAY", "HAZ", "TEM", "AĞU", "EYL", "EKİ", "KAS", "ARA"];

// "12 TEM" — tasarimin tarih etiketi. withYear: "20 HAZ 2027".
export function routeDateTag(value, { withYear = false } = {}) {
  if (!value) return null;
  const date = new Date(value);
  if (!Number.isFinite(date.getTime())) return null;
  const base = `${date.getDate()} ${TR_MONTHS[date.getMonth()]}`;
  return withYear ? `${base} ${date.getFullYear()}` : base;
}
