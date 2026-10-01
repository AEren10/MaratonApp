const SAFE_PROPERTY_KEYS = new Set([
  "accepted", "added", "branchSubject", "changed", "closed", "coldStart", "confidence",
  "daysUntilExam", "difficultyLevel", "due", "duration",
  "durationMinutes", "durationMs", "durationSec", "entry", "examType", "field", "filter", "flow",
  "form", "guessed", "hasBaselineNet", "hasImage", "hasNet", "hasNote", "hasPublisher",
  "hasQuestions", "hasSubject", "hasSubjectBreakdown", "hasTargetNet",
  "id", "isBounce", "isTab", "keepOpen", "lostStreak", "minutes", "mode", "moved",
  "net", "nextFlow", "nextScreen", "period", "plan", "provider", "questions", "queued", "remembered",
  "reason", "removed", "resized", "routeCreated", "screen", "selectedPlan", "source",
  "status", "stayCategory", "stopCount", "streak", "subject", "subjectKey", "surface",
  "targetScreen", "taskCount", "tier", "topicSource", "transition", "trialCount", "trialType",
  "type", "usedFreeze", "weeks",
]);

const MAX_STRING_LENGTH = 80;
const MAX_ABS_NUMBER = 1_000_000_000;
const SAFE_STATIC_ID = /^[A-Za-z0-9_.:-]{1,80}$/;
const UUID_LIKE_ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
let eventSequence = 0;

export function newAnalyticsId(now = Date.now(), random = Math.random()) {
  eventSequence = (eventSequence + 1) % 1_000_000;
  return `${now.toString(36)}-${eventSequence.toString(36)}-${random.toString(36).slice(2, 10)}`;
}

export function sanitizeAnalyticsProperties(value) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const safe = {};
  for (const [key, raw] of Object.entries(value)) {
    if (!SAFE_PROPERTY_KEYS.has(key) || raw == null) continue;
    if (typeof raw === "boolean") safe[key] = raw;
    else if (typeof raw === "number" && Number.isFinite(raw)) {
      safe[key] = Math.max(-MAX_ABS_NUMBER, Math.min(MAX_ABS_NUMBER, raw));
    } else if (typeof raw === "string") {
      if (key === "id" && (!SAFE_STATIC_ID.test(raw) || UUID_LIKE_ID.test(raw))) continue;
      safe[key] = raw.slice(0, MAX_STRING_LENGTH);
    }
  }
  return safe;
}

export function createAnalyticsEnvelope(event, props, options = {}) {
  const at = options.at || new Date().toISOString();
  return {
    clientEventId: options.clientEventId || newAnalyticsId(),
    event,
    props: sanitizeAnalyticsProperties(props),
    userId: options.userId || null,
    sessionId: options.sessionId || null,
    at,
  };
}

export function mergeAnalyticsEvents(...lists) {
  const merged = new Map();
  for (const list of lists) {
    for (const item of Array.isArray(list) ? list : []) {
      if (!item?.clientEventId || !item?.event) continue;
      if (!merged.has(item.clientEventId)) merged.set(item.clientEventId, item);
    }
  }
  return [...merged.values()];
}

export function removeAnalyticsEvents(events, deliveredIds) {
  const ids = deliveredIds instanceof Set ? deliveredIds : new Set(deliveredIds || []);
  return (events || []).filter((item) => !ids.has(item.clientEventId));
}

export function mergeAnalyticsPartitions(stored = {}, current = {}, limit = 200) {
  const result = {};
  const owners = new Set([...Object.keys(stored || {}), ...Object.keys(current || {})]);
  for (const owner of owners) {
    result[owner] = mergeAnalyticsEvents(stored[owner], current[owner]).slice(-limit);
  }
  return result;
}

export function acknowledgeAnalyticsPartition(partitions, owner, deliveredIds) {
  return {
    ...partitions,
    [owner]: removeAnalyticsEvents(partitions?.[owner], deliveredIds),
  };
}

export function needsNewAnalyticsSession(pausedAt, now, timeoutMs = 30 * 60 * 1000) {
  return Number.isFinite(pausedAt) && Math.max(0, now - pausedAt) >= timeoutMs;
}

export function isActiveAnalyticsIdentity(expectedOwner, expectedGeneration, owner, generation) {
  return Boolean(expectedOwner) && expectedOwner === owner && expectedGeneration === generation;
}

export function canReuseAnalyticsInitialization(record, owner, generation) {
  return Boolean(record && record.owner === owner && record.generation === generation);
}
