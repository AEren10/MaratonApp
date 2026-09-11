import { routeRevisionDecision } from "./routeRevisionDecision.js";

export const ROUTE_REVISION_SUMMARY_VERSION = "route-revision-summary-v1";

function stopKey(stop = {}) {
  return stop.logicalStopKey || stop.logical_key || stop.rootStopKey || stop.root_key
    || [stop.subject, stop.topic].filter(Boolean).join(":");
}

function weekStart(week = {}) {
  return week.weekStart || week.week_start || "";
}

function flattenStops(weeks = []) {
  return (weeks || []).flatMap((week, weekIndex) => (week.stops || []).map((stop, position) => ({
    key: stopKey(stop),
    subject: stop.subject,
    subjectLabel: stop.subjectLabel || stop.subject_label || stop.subject,
    topic: stop.topic,
    weekStart: weekStart(week),
    weekIndex,
    position,
    questions: Math.round(Number(
      stop.cost?.questions ?? stop.questions ?? stop.plannedQuestions ?? stop.planned_questions ?? 0,
    ) || 0),
    minutes: Math.round(Number(
      stop.cost?.minutes ?? stop.minutes ?? stop.plannedMinutes ?? stop.planned_minutes ?? 0,
    ) || 0),
    reasonCode: stop.insight?.reasonCode || stop.reasonCodes?.[0] || null,
  }))).filter((stop) => stop.key && stop.subject && stop.topic);
}

function byKey(stops = []) {
  return new Map(stops.map((stop) => [stop.key, stop]));
}

function samePlacement(a, b) {
  return a.weekStart === b.weekStart && a.position === b.position;
}

function effortDelta(next, prev) {
  return {
    questions: next.questions - prev.questions,
    minutes: next.minutes - prev.minutes,
  };
}

function changeTitle(change) {
  const label = `${change.subjectLabel} / ${change.topic}`;
  if (change.type === "added") return `${label} rotaya eklendi`;
  if (change.type === "removed") return `${label} rotadan çıktı`;
  if (change.type === "moved") {
    return change.fromWeekStart === change.toWeekStart
      ? `${label} hafta içinde yeniden sıralandı`
      : `${label} farklı haftaya taşındı`;
  }
  if (change.type === "resized") return `${label} yükü güncellendi`;
  return `${label} korundu`;
}

function headline(counts) {
  if (counts.added || counts.removed) return "Rota yeni veriye göre yeniden dengelendi";
  if (counts.moved) return "Rota sırası güncellendi";
  if (counts.resized) return "Rota yükü güncellendi";
  return "Rota aynı stratejiyi koruyor";
}

function nextAction(counts) {
  if (counts.added || counts.moved || counts.resized) {
    return "İlk aktif durağı tamamla; revizyon geçmişi eski planı ezmeden yeni sırayı takip eder.";
  }
  if (counts.removed) return "Çıkan durakları borç sayma; yeni rota daha dar odakla devam eder.";
  return "Mevcut plana devam et; yeni veriler şimdilik rota kararını değiştirmedi.";
}

export function summarizeRouteRevision({
  previousWeeks = [],
  nextWeeks = [],
  previousRevision = null,
  nextRevision = null,
} = {}) {
  const previousStops = flattenStops(previousWeeks);
  const nextStops = flattenStops(nextWeeks);
  const previous = byKey(previousStops);
  const next = byKey(nextStops);
  const changes = [];

  for (const stop of nextStops) {
    const old = previous.get(stop.key);
    if (!old) {
      changes.push({ type: "added", ...stop, title: changeTitle({ type: "added", ...stop }) });
      continue;
    }
    if (!samePlacement(old, stop)) {
      changes.push({
        type: "moved",
        ...stop,
        fromWeekStart: old.weekStart,
        toWeekStart: stop.weekStart,
        title: changeTitle({ type: "moved", ...stop }),
      });
    }
    const delta = effortDelta(stop, old);
    if (delta.questions !== 0 || delta.minutes !== 0) {
      changes.push({
        type: "resized",
        ...stop,
        delta,
        title: changeTitle({ type: "resized", ...stop }),
      });
    }
  }

  for (const stop of previousStops) {
    if (next.has(stop.key)) continue;
    changes.push({ type: "removed", ...stop, title: changeTitle({ type: "removed", ...stop }) });
  }

  const counts = {
    added: changes.filter((change) => change.type === "added").length,
    removed: changes.filter((change) => change.type === "removed").length,
    moved: changes.filter((change) => change.type === "moved").length,
    resized: changes.filter((change) => change.type === "resized").length,
    unchanged: nextStops.filter((stop) => {
      const old = previous.get(stop.key);
      if (!old) return false;
      const delta = effortDelta(stop, old);
      return samePlacement(old, stop) && delta.questions === 0 && delta.minutes === 0;
    }).length,
  };

  return {
    version: ROUTE_REVISION_SUMMARY_VERSION,
    previousRevisionKey: previousRevision?.revisionKey || previousRevision?.revision_key || null,
    nextRevisionKey: nextRevision?.revisionKey || nextRevision?.revision_key || null,
    changed: changes.length > 0,
    headline: headline(counts),
    nextAction: nextAction(counts),
    counts,
    totalChanges: changes.length,
    decision: routeRevisionDecision({ counts, totalChanges: changes.length }),
    changes: changes.slice(0, 8),
  };
}
