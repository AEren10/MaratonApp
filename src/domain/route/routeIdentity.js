import { ROUTE_STOP_STATUS } from "./stopStatus.js";

// v3 (2026-10-03): olculmus 0 dogru, hedef modu 3 deneme, ilk hafta kalibrasyonu, yumusak gerekceler.
export const ROUTE_ALGORITHM_VERSION = "route-v3";

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
      // segmentBase: konuda cozulmus hacimden gelen baslangic (scheduler).
      // Ilk parca bitince kalan is yeniden bolunuyor; numara 0'dan baslasa
      // yeni ilk parca bitmis parcanin kimligini (ve "bitti" durumunu) alirdi.
      const count = segmentCounts.get(rootStopKey) || 0;
      segmentCounts.set(rootStopKey, count + 1);
      const segmentIndex = (Number(stop.segmentBase) || 0) + count;
      const lifecycleStatus = activated
        ? ROUTE_STOP_STATUS.UPCOMING
        : ROUTE_STOP_STATUS.ACTIVE;
      activated = true;
      return {
        ...stop,
        rootStopKey,
        // Kimlik HAFTAYI tasir: sunucu ayni anahtarli durağa onceki
        // revizyonlarin durumunu (bitti/atlandi/ertelendi) kopyaliyor. Hafta
        // olmadan bir haftada bitirilen durak sonraki haftalarin ayni
        // anahtarli duragina "bitti" diye geciyor, is kayboluyordu.
        logicalStopKey: `${rootStopKey}:${week.weekStart || "w"}:${segmentIndex}`,
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
