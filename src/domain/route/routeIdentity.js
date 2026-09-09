import { ROUTE_STOP_STATUS } from "./stopStatus.js";

export const ROUTE_ALGORITHM_VERSION = "route-v2";

function stableHash(value) {
  let hash = 2166136261;
  const input = String(value ?? "");
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

export function makeRouteStopRootKey(stop, examType = "unknown") {
  const kind = stop?.isReview ? "review" : "learn";
  const cycle = stop?.reviewCycle || "base";
  return `stop_${stableHash([examType, stop?.subject, stop?.topic, kind, cycle].join("|"))}`;
}

export function decorateScheduledRoute(weeks, { examType = "unknown" } = {}) {
  const segmentCounts = new Map();
  let activated = false;

  return (weeks || []).map((week) => ({
    ...week,
    stops: (week.stops || []).map((stop, position) => {
      const rootStopKey = makeRouteStopRootKey(stop, examType);
      const segmentIndex = segmentCounts.get(rootStopKey) || 0;
      segmentCounts.set(rootStopKey, segmentIndex + 1);
      const lifecycleStatus = activated
        ? ROUTE_STOP_STATUS.UPCOMING
        : ROUTE_STOP_STATUS.ACTIVE;
      activated = true;
      return {
        ...stop,
        rootStopKey,
        logicalStopKey: `${rootStopKey}:${segmentIndex}`,
        segmentIndex,
        position,
        lifecycleStatus,
      };
    }),
  }));
}

export function createRouteRevision({ weeks, examType = "unknown", capacity, weekStart }) {
  const stopSignature = (weeks || []).flatMap((week) =>
    (week.stops || []).map((stop) => [
      stop.logicalStopKey,
      week.weekStart,
      stop.cost?.questions ?? stop.plannedQuestions ?? 0,
    ].join(":")),
  ).join("|");
  const inputHash = stableHash([
    examType,
    weekStart,
    capacity?.questionsPerWeek || 0,
    stopSignature,
  ].join("|"));
  return {
    algorithmVersion: ROUTE_ALGORITHM_VERSION,
    inputHash,
    revisionKey: `${ROUTE_ALGORITHM_VERSION}:${weekStart || "undated"}:${inputHash}`,
  };
}
