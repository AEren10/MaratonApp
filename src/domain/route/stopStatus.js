export const ROUTE_STOP_STATUS = Object.freeze({
  COMPLETED: "completed",
  ACTIVE: "active",
  UPCOMING: "upcoming",
  RESCHEDULED: "rescheduled",
  SKIPPED: "skipped",
  LOCKED: "locked",
  FROZEN: "frozen",
});

export const ROUTE_STOP_LABELS = Object.freeze({
  [ROUTE_STOP_STATUS.COMPLETED]: "Tamamlandı",
  [ROUTE_STOP_STATUS.ACTIVE]: "Aktif",
  [ROUTE_STOP_STATUS.UPCOMING]: "Sırada",
  [ROUTE_STOP_STATUS.RESCHEDULED]: "Yeniden planlandı",
  [ROUTE_STOP_STATUS.SKIPPED]: "Atlandı",
  [ROUTE_STOP_STATUS.LOCKED]: "Kilitli",
  [ROUTE_STOP_STATUS.FROZEN]: "Donduruldu",
});

export const PERSISTED_ROUTE_STOP_STATUSES = Object.freeze([
  ROUTE_STOP_STATUS.COMPLETED,
  ROUTE_STOP_STATUS.ACTIVE,
  ROUTE_STOP_STATUS.UPCOMING,
  ROUTE_STOP_STATUS.RESCHEDULED,
  ROUTE_STOP_STATUS.SKIPPED,
]);

const PERSISTED = new Set(PERSISTED_ROUTE_STOP_STATUSES);
const TERMINAL = new Set([
  ROUTE_STOP_STATUS.COMPLETED,
  ROUTE_STOP_STATUS.RESCHEDULED,
]);

const TRANSITIONS = Object.freeze({
  [ROUTE_STOP_STATUS.UPCOMING]: new Set([
    ROUTE_STOP_STATUS.ACTIVE,
    ROUTE_STOP_STATUS.SKIPPED,
    ROUTE_STOP_STATUS.RESCHEDULED,
  ]),
  [ROUTE_STOP_STATUS.ACTIVE]: new Set([
    ROUTE_STOP_STATUS.COMPLETED,
    ROUTE_STOP_STATUS.SKIPPED,
    ROUTE_STOP_STATUS.RESCHEDULED,
  ]),
  [ROUTE_STOP_STATUS.SKIPPED]: new Set([ROUTE_STOP_STATUS.RESCHEDULED]),
  [ROUTE_STOP_STATUS.COMPLETED]: new Set(),
  [ROUTE_STOP_STATUS.RESCHEDULED]: new Set(),
});

export function isPersistedRouteStopStatus(status) {
  return PERSISTED.has(status);
}

export function isTerminalRouteStopStatus(status) {
  return TERMINAL.has(status);
}

export function canTransitionRouteStop(from, to) {
  return !!TRANSITIONS[from]?.has(to);
}

export function getEffectiveRouteStopStatus(
  lifecycleStatus,
  { locked = false, frozen = false } = {},
) {
  const status = isPersistedRouteStopStatus(lifecycleStatus)
    ? lifecycleStatus
    : ROUTE_STOP_STATUS.UPCOMING;
  if (locked) return ROUTE_STOP_STATUS.LOCKED;
  if (frozen && (status === ROUTE_STOP_STATUS.ACTIVE || status === ROUTE_STOP_STATUS.UPCOMING)) {
    return ROUTE_STOP_STATUS.FROZEN;
  }
  return status;
}

export function routeStopStatusLabel(status) {
  return ROUTE_STOP_LABELS[status] || ROUTE_STOP_LABELS[ROUTE_STOP_STATUS.UPCOMING];
}

export function ensureSingleActiveRouteStop(weeks) {
  const hasActive = (weeks || []).some((week) =>
    (week.stops || []).some((stop) => stop.lifecycleStatus === ROUTE_STOP_STATUS.ACTIVE),
  );
  if (hasActive) return weeks;

  let promoted = false;
  return (weeks || []).map((week) => ({
    ...week,
    stops: (week.stops || []).map((stop) => {
      if (!promoted && stop.lifecycleStatus === ROUTE_STOP_STATUS.UPCOMING) {
        promoted = true;
        return { ...stop, lifecycleStatus: ROUTE_STOP_STATUS.ACTIVE };
      }
      return stop;
    }),
  }));
}
