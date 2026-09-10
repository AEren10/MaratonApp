function stopStatus(stop) {
  return stop?.lifecycle_status || stop?.lifecycleStatus || "upcoming";
}

function stopPosition(stop) {
  return Number(stop?.position ?? 9999);
}

function stopWeekStart(stop) {
  return stop?.week_start || stop?.weekStart || "";
}

function normalizeActionStop(stop) {
  if (!stop?.subject || !stop?.topic) return null;
  return {
    stopId: stop.id || stop.stopId || null,
    version: stop.version ?? null,
    subjectKey: stop.subject,
    subjectLabel: stop.subject_label || stop.subjectLabel || stop.subject,
    topicName: stop.topic,
    status: stopStatus(stop),
    weekStart: stopWeekStart(stop),
    position: stopPosition(stop),
  };
}

export function firstRouteAction(stops = []) {
  const candidates = (stops || [])
    .map(normalizeActionStop)
    .filter(Boolean)
    .filter((stop) => ["active", "upcoming"].includes(stop.status))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === "active" ? -1 : 1;
      return a.weekStart.localeCompare(b.weekStart) || a.position - b.position;
    });
  const first = candidates[0] || null;
  if (!first) return null;
  return {
    ...first,
    title: `${first.subjectLabel} · ${first.topicName}`,
    actionLabel: "İlk durağa başla",
    message: "İlk çalışma oturumunu bu duraktan başlatırsan rota geçmişin doğru bağlanır.",
  };
}

export function routeActionTimerParams(action) {
  if (!action) return null;
  return {
    subjectKey: action.subjectKey,
    topicName: action.topicName,
    routeStopId: action.stopId || undefined,
    routeStopVersion: action.version ?? undefined,
  };
}
