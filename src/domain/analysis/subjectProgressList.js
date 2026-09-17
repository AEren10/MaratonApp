import { ROUTE_STOP_STATUS, routeStopStatusLabel } from "../route/stopStatus.js";
import { subjectPaletteKey } from "../../themes/subjectPalette.js";

export const SUBJECT_PROGRESS_TAB = Object.freeze({
  PRIORITY: "PRIORITY",
  PROGRESS: "PROGRESS",
  CLOSED: "CLOSED",
});

const WEAK_ACCURACY = 50;
const CLOSED_ACCURACY = 70;
const EXPECTED_QUESTIONS = 100;
const DAY_MS = 86400000;

// useDerslerProgress.calcTopicProgress ile ayni formul; o dosya React'e bagli.
function topicPct(row) {
  if (!row) return 0;
  const q = row.total_questions || 0;
  const qScore = Math.min(q / EXPECTED_QUESTIONS, 1) * 40;
  const accScore = q > 0 ? ((row.correct_count || 0) / q) * 30 : 0;
  const freqScore = Math.min((row.study_count || 0) / 3, 1) * 30;
  return Math.min(100, Math.round(qScore + accScore + freqScore));
}

function formatMinutes(min) {
  if (!min) return null;
  if (min >= 60) return `${(min / 60).toFixed(1).replace(".", ",")} sa`;
  return `${min} dk`;
}

function buildMeta({ row, stop, now }) {
  const parts = [];
  const q = row?.total_questions || 0;
  if (q > 0) {
    const dur = formatMinutes(row?.total_minutes);
    parts.push(dur ? `${q} soru · ${dur}` : `${q} soru`);
  }
  if (row?.last_studied_at) {
    const days = Math.max(0, Math.round((now - new Date(row.last_studied_at).getTime()) / DAY_MS));
    parts.push(days === 0 ? "bugün çalışıldı" : `${days} gün önce`);
  }
  if (stop?.lifecycleStatus) parts.push(routeStopStatusLabel(stop.lifecycleStatus).toLocaleLowerCase("tr"));
  return parts.length ? parts.join(" · ") : "henüz veri yok";
}

function collect({ progressRows, routeStops, notebookItems }) {
  const entries = new Map();
  const ensure = (name, subjectKey) => {
    if (!name) return null;
    const prev = entries.get(name);
    if (prev) {
      if (!prev.subjectKey && subjectKey) prev.subjectKey = subjectKey;
      return prev;
    }
    const next = { name, subjectKey: subjectKey || null, row: null, stop: null, weekIndex: null, notebookCount: 0 };
    entries.set(name, next);
    return next;
  };

  progressRows.forEach((r) => {
    const e = ensure(r?.topic_name, subjectPaletteKey(r?.subject_key));
    if (e && !e.row) e.row = r;
  });

  routeStops.forEach((stop) => {
    const e = ensure(stop?.topic, subjectPaletteKey(stop?.subject));
    if (!e) return;
    // Ayni konu birden fazla haftada durabilir; en erken durak temsil eder.
    if (e.stop === null || (stop.weekIndex ?? 0) < (e.weekIndex ?? Infinity)) {
      e.stop = stop;
      e.weekIndex = stop.weekIndex ?? null;
    }
  });

  notebookItems.forEach((item) => {
    if (item?.is_resolved) return;
    const subject = typeof item?.subject === "string" ? item.subject : item?.subject?.key;
    const e = ensure(item?.topic, subjectPaletteKey(subject));
    if (e) e.notebookCount += 1;
  });

  return [...entries.values()];
}

function decorate(entry, now) {
  const row = entry.row;
  const totalQuestions = row?.total_questions || 0;
  const accuracy = totalQuestions > 0
    ? Math.round(((row.correct_count || 0) / totalQuestions) * 100)
    : null;
  const status = entry.stop?.lifecycleStatus || null;
  const pctValue = topicPct(row);
  return {
    key: entry.name,
    name: entry.name,
    subjectKey: entry.subjectKey,
    notebookCount: entry.notebookCount,
    status,
    weekIndex: entry.weekIndex,
    totalQuestions,
    accuracy,
    pctValue,
    pct: `${pctValue}%`,
    badge: entry.notebookCount > 0
      ? `defter ${entry.notebookCount}`
      : (status ? routeStopStatusLabel(status) : ""),
    meta: buildMeta({ row, stop: entry.stop, now }),
  };
}

function isPriority(item) {
  if (item.notebookCount > 0) return true;
  if (item.status === ROUTE_STOP_STATUS.SKIPPED || item.status === ROUTE_STOP_STATUS.RESCHEDULED) return true;
  // Sifir veri zayiflik degildir: dogruluk ancak soru cozulduyse konusulur.
  return item.totalQuestions > 0 && item.accuracy !== null && item.accuracy < WEAK_ACCURACY;
}

function isProgress(item) {
  return (item.weekIndex === 0 || item.weekIndex === 1) && item.status !== ROUTE_STOP_STATUS.COMPLETED;
}

function isClosed(item) {
  return item.status === ROUTE_STOP_STATUS.COMPLETED
    && item.accuracy !== null
    && item.accuracy >= CLOSED_ACCURACY;
}

const byName = (a, b) => a.name.localeCompare(b.name, "tr");
const acc = (v) => (v === null ? Infinity : v);

export function buildSubjectProgressList({
  progressRows = [],
  routeStops = [],
  notebookItems = [],
  tab = SUBJECT_PROGRESS_TAB.PRIORITY,
  now = Date.now(),
} = {}) {
  const items = collect({ progressRows, routeStops, notebookItems }).map((e) => decorate(e, now));

  if (tab === SUBJECT_PROGRESS_TAB.PROGRESS) {
    return items.filter(isProgress).sort((a, b) => (a.weekIndex - b.weekIndex) || byName(a, b));
  }
  if (tab === SUBJECT_PROGRESS_TAB.CLOSED) {
    return items.filter(isClosed).sort((a, b) => (b.accuracy - a.accuracy) || byName(a, b));
  }
  return items.filter(isPriority).sort((a, b) =>
    (b.notebookCount - a.notebookCount)
    || (acc(a.accuracy) - acc(b.accuracy))
    || byName(a, b));
}
