import { dateKey } from "../../lib/dateUtils.js";
import { formatMinutes, formatNumber } from "../../lib/format.js";
import { routeStopEffectiveStatus, ROUTE_STOP_STATUS } from "../route/stopStatus.js";
import { firstWeekStatus, FIRST_WEEK_DAYS } from "./paywallGate.js";

const DAY_MS = 86400000;

function toDate(value) {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function firstWeekRange(createdAt) {
  const start = toDate(createdAt);
  if (!start) return null;
  const endInclusive = new Date(start.getTime() + (FIRST_WEEK_DAYS * DAY_MS) - 1);
  return { from: dateKey(start), to: dateKey(endInclusive) };
}

function rowDateKey(row) {
  return String(row?.study_date || row?.date || dateKey(row?.created_at) || "").slice(0, 10);
}

function inRange(row, range) {
  if (!range) return true;
  const key = rowDateKey(row);
  return !!key && key >= range.from && key <= range.to;
}

function numberValue(...values) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number)) return Math.max(0, number);
  }
  return 0;
}

function flattenStops(routeWeeks = []) {
  return (routeWeeks || []).flatMap((week) => week?.stops || []);
}

function completedStopCount(routeWeeks = []) {
  return flattenStops(routeWeeks).filter((stop) =>
    routeStopEffectiveStatus(stop) === ROUTE_STOP_STATUS.COMPLETED,
  ).length;
}

export function buildFirstWeekMomentData({
  createdAt,
  now = new Date(),
  studyLogs = [],
  trials = [],
  routeWeeks = [],
} = {}) {
  const status = firstWeekStatus(createdAt, now);
  const range = firstWeekRange(createdAt);
  const weekLogs = (studyLogs || []).filter((log) => inRange(log, range));
  const weekTrials = (trials || []).filter((trial) => inRange(trial, range));
  const stops = flattenStops(routeWeeks);
  const completedStops = completedStopCount(routeWeeks);
  const activeDays = new Set(weekLogs.map(rowDateKey).filter(Boolean)).size;
  const minutes = weekLogs.reduce((sum, log) =>
    sum + numberValue(log.duration, log.duration_minutes), 0);
  const questions = weekLogs.reduce((sum, log) =>
    sum + numberValue(log.questionCount, log.question_count), 0);

  const steps = [
    { key: "trial", done: weekTrials.length > 0 },
    { key: "study", done: weekLogs.length > 0 },
    { key: "first_stop", done: completedStops > 0 },
    { key: "second_day", done: activeDays >= 2 },
    { key: "next_stop", done: stops.length > 0 },
    { key: "weekly_summary", done: activeDays >= 3 || status.dayNumber > FIRST_WEEK_DAYS },
    { key: "route_learning", done: weekTrials.length + weekLogs.length >= 2 },
  ];
  const completedTasks = steps.filter((step) => step.done).length;

  return {
    ...status,
    range,
    totalTasks: steps.length,
    completedTasks,
    steps,
    totals: {
      minutes: Math.round(minutes),
      minutesLabel: formatMinutes(minutes, "0 dk"),
      questions: Math.round(questions),
      questionsLabel: formatNumber(questions, 0, "0"),
      activeDays,
      trials: weekTrials.length,
      routeStops: stops.length,
      completedStops,
    },
  };
}
