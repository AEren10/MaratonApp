import { getEffectiveRouteStopStatus, ROUTE_STOP_STATUS } from "./stopStatus.js";

const CONFIDENCE_LABELS = Object.freeze({
  high: "yüksek",
  medium: "orta",
  low: "başlangıç",
});

function stopStatus(stop) {
  const lifecycleStatus = stop?.lifecycle_status || stop?.lifecycleStatus || stop?.status || ROUTE_STOP_STATUS.UPCOMING;
  if (stop?.effective_status || stop?.effectiveStatus) {
    return stop.effective_status || stop.effectiveStatus;
  }
  return getEffectiveRouteStopStatus(lifecycleStatus, {
    locked: Boolean(stop?.locked || stop?.isLocked),
    frozen: Boolean(stop?.frozen || stop?.isFrozen || stop?.frozen_until || stop?.frozenUntil),
  });
}

function stopPosition(stop) {
  return Number(stop?.position ?? 9999);
}

function stopWeekStart(stop) {
  return stop?.week_start || stop?.weekStart || "";
}

function routeInsight(stop = {}) {
  return stop.insight || stop.routeInsight || stop.metadata?.insight || null;
}

function effortLabel(stop = {}) {
  const questions = Number(stop.cost?.questions ?? stop.questions ?? stop.metadata?.questions ?? 0);
  const minutes = Number(stop.cost?.minutes ?? stop.minutes ?? stop.metadata?.minutes ?? 0);
  if (questions > 0 && minutes > 0) return `${Math.round(questions)} soru · ~${Math.round(minutes)} dk`;
  if (questions > 0) return `${Math.round(questions)} soru`;
  if (minutes > 0) return `~${Math.round(minutes)} dk`;
  return null;
}

function netGainLabel(insight) {
  const gain = Number(insight?.expectedNetGain) || 0;
  return gain > 0 ? `~+${Math.round(gain * 10) / 10} net potansiyeli` : null;
}

function normalizeActionStop(stop) {
  if (!stop?.subject || !stop?.topic) return null;
  const insight = routeInsight(stop);
  const confidence = insight?.confidence || stop.dataConfidence || stop.metadata?.dataConfidence || null;
  const reasonText = insight?.reasonText || stop.reason_text || stop.reasonText || null;
  const effort = effortLabel(stop);
  const questions = Number(stop.cost?.questions ?? stop.questions ?? stop.metadata?.questions ?? 0);
  const minutes = Number(stop.cost?.minutes ?? stop.minutes ?? stop.metadata?.minutes ?? 0);
  return {
    stopId: stop.id || stop.stopId || null,
    version: stop.version ?? null,
    subjectKey: stop.subject,
    subjectLabel: stop.subject_label || stop.subjectLabel || stop.metadata?.subjectLabel || stop.subject,
    topicName: stop.topic,
    status: stopStatus(stop),
    weekStart: stopWeekStart(stop),
    position: stopPosition(stop),
    reasonCode: insight?.reasonCode || stop.reasonCodes?.[0] || stop.metadata?.reasonCodes?.[0] || null,
    reasonText,
    confidence,
    confidenceLabel: confidence ? CONFIDENCE_LABELS[confidence] || CONFIDENCE_LABELS.low : "veri topluyor",
    effort,
    questions: Math.round(questions) || 0,
    minutes: Math.round(minutes) || 0,
    impact: netGainLabel(insight),
    isReview: Boolean(stop.isReview || stop.metadata?.isReview),
  };
}

function actionMessage(stop) {
  const reason = stop.reasonText || "Bu durak rotanın sıradaki en mantıklı hamlesi.";
  const effort = stop.effort ? ` ${stop.effort} planlandı.` : "";
  return `${reason}${effort} Çalışma oturumunu buradan başlatırsan rota geçmişin doğru bağlanır.`;
}

export function firstRouteAction(stops = []) {
  const candidates = (stops || [])
    .map(normalizeActionStop)
    .filter(Boolean)
    .filter((stop) => [ROUTE_STOP_STATUS.ACTIVE, ROUTE_STOP_STATUS.UPCOMING].includes(stop.status))
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === ROUTE_STOP_STATUS.ACTIVE ? -1 : 1;
      return a.weekStart.localeCompare(b.weekStart) || a.position - b.position;
    });
  const first = candidates[0] || null;
  if (!first) return null;
  return {
    ...first,
    title: `${first.subjectLabel} · ${first.topicName}`,
    actionLabel: "Sıradaki durağa başla",
    message: actionMessage(first),
  };
}

export function routeActionTimerParams(action) {
  if (!action) return null;
  return {
    subjectKey: action.subjectKey,
    topicName: action.topicName,
    routeSubjectKey: action.subjectKey,
    routeTopicName: action.topicName,
    routeStopId: action.stopId || undefined,
    routeStopVersion: action.version ?? undefined,
  };
}
