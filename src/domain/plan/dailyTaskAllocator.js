import { getEffectiveRouteStopStatus } from "../route/stopStatus.js";

const REASON_PRIORITY = Object.freeze({
  REVIEW_DUE: 1.35,
  LOW_ACCURACY: 1.3,
  NET_DROP: 1.25,
  NEGLECTED: 1.18,
  HIGH_EXAM_WEIGHT: 1.12,
  PREREQUISITE: 0.88,
  ROUTE_COMMITMENT: 1,
});

const STATUS_PRIORITY = Object.freeze({
  active: 1.45,
  upcoming: 1,
  rescheduled: 0,
  skipped: 0,
  completed: 0,
  locked: 0,
  frozen: 0,
});

const CONFIDENCE_PRIORITY = Object.freeze({
  high: 1.08,
  medium: 1,
  low: 0.9,
});

function positiveNumber(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

function stopStatus(stop = {}) {
  if (stop.effectiveStatus || stop.effective_status) {
    return stop.effectiveStatus || stop.effective_status;
  }
  const lifecycleStatus = stop.lifecycleStatus || stop.lifecycle_status || stop.status || "upcoming";
  return getEffectiveRouteStopStatus(lifecycleStatus, {
    locked: Boolean(stop.locked || stop.isLocked),
    frozen: Boolean(stop.frozen || stop.isFrozen || stop.frozenUntil || stop.frozen_until),
  });
}

function reasonCode(stop = {}) {
  return stop.insight?.reasonCode || stop.reasonCodes?.[0] || "ROUTE_COMMITMENT";
}

function routeCostLimit(stop = {}, fallback) {
  return Math.max(1, Math.round(positiveNumber(stop.cost?.questions, fallback)));
}

export function isDailyAssignableRouteStop(stop = {}) {
  return (STATUS_PRIORITY[stopStatus(stop)] ?? 1) > 0;
}

export function scoreDailyRouteCandidate(candidate = {}, index = 0) {
  const stop = candidate.routeStop || {};
  if (!isDailyAssignableRouteStop(stop)) return 0;

  const base = Math.max(0.1, positiveNumber(stop.score, positiveNumber(candidate.score, 1)));
  const statusBoost = STATUS_PRIORITY[stopStatus(stop)] ?? 1;
  const reasonBoost = REASON_PRIORITY[reasonCode(stop)] || REASON_PRIORITY.ROUTE_COMMITMENT;
  const confidenceBoost = CONFIDENCE_PRIORITY[stop.insight?.confidence || stop.dataConfidence] || 1;
  const orderDampener = 1 / (1 + index * 0.04);

  return Math.round(base * statusBoost * reasonBoost * confidenceBoost * orderDampener * 100) / 100;
}

function distributeRemainder(rows, remaining) {
  let left = remaining;
  let guard = 0;

  while (left > 0 && guard < rows.length * 2) {
    let changed = false;
    for (const row of rows) {
      if (left <= 0) break;
      const headroom = row.maxQuestions - row.questionCount;
      if (headroom <= 0) continue;
      row.questionCount += 1;
      left -= 1;
      changed = true;
    }
    if (!changed) break;
    guard += 1;
  }

  return left;
}

export function buildDailyRouteTaskAllocations(candidates = [], dailyTarget = 0, { maxTasks = 4 } = {}) {
  const target = Math.max(0, Math.round(Number(dailyTarget) || 0));
  if (!target) return [];

  const ranked = candidates
    .map((candidate, index) => ({
      candidate,
      index,
      score: scoreDailyRouteCandidate(candidate, index),
    }))
    .filter((row) => row.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, Math.max(1, maxTasks));

  const scoreTotal = ranked.reduce((sum, row) => sum + row.score, 0) || 1;
  let allocated = 0;
  const rows = ranked.map((row, index) => {
    const rawShare = index === ranked.length - 1
      ? target - allocated
      : Math.round(target * (row.score / scoreTotal));
    const maxQuestions = routeCostLimit(row.candidate.routeStop, target);
    const questionCount = Math.min(maxQuestions, Math.max(1, rawShare));
    allocated += questionCount;

    return {
      ...row,
      maxQuestions,
      questionCount,
    };
  });

  if (allocated > target) {
    let overflow = allocated - target;
    for (let i = rows.length - 1; i >= 0 && overflow > 0; i -= 1) {
      const removable = Math.min(overflow, Math.max(0, rows[i].questionCount - 1));
      rows[i].questionCount -= removable;
      overflow -= removable;
    }
    allocated = rows.reduce((sum, row) => sum + row.questionCount, 0);
  }

  const undistributed = distributeRemainder(rows, target - allocated);

  return rows
    .filter((row) => row.questionCount > 0)
    .map((row, index) => ({
      ...row.candidate,
      questionCount: row.questionCount,
      priority: index + 1,
      allocation: {
        score: row.score,
        reasonCode: reasonCode(row.candidate.routeStop),
        maxQuestions: row.maxQuestions,
        cappedByRouteCost: row.questionCount >= row.maxQuestions,
        undistributedQuestions: index === 0 ? Math.max(0, undistributed) : 0,
      },
    }));
}
