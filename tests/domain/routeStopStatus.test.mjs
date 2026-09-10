import assert from "node:assert/strict";
import test from "node:test";

import {
  canTransitionRouteStop,
  ensureSingleActiveRouteStop,
  getEffectiveRouteStopStatus,
  isPersistedRouteStopStatus,
  PERSISTED_ROUTE_STOP_STATUSES,
  ROUTE_STOP_STATUS,
  routeStopEffectiveStatus,
  routeStopStatusLabel,
} from "../../src/domain/route/stopStatus.js";

test("only lifecycle states are persisted", () => {
  assert.deepEqual(PERSISTED_ROUTE_STOP_STATUSES, [
    "completed", "active", "upcoming", "rescheduled", "skipped",
  ]);
  assert.equal(isPersistedRouteStopStatus(ROUTE_STOP_STATUS.LOCKED), false);
  assert.equal(isPersistedRouteStopStatus(ROUTE_STOP_STATUS.FROZEN), false);
});

test("locked overrides presentation without mutating lifecycle", () => {
  assert.equal(
    getEffectiveRouteStopStatus(ROUTE_STOP_STATUS.COMPLETED, { locked: true }),
    ROUTE_STOP_STATUS.LOCKED,
  );
  assert.equal(
    getEffectiveRouteStopStatus(ROUTE_STOP_STATUS.COMPLETED),
    ROUTE_STOP_STATUS.COMPLETED,
  );
});

test("frozen only overlays actionable stops", () => {
  assert.equal(
    getEffectiveRouteStopStatus(ROUTE_STOP_STATUS.ACTIVE, { frozen: true }),
    ROUTE_STOP_STATUS.FROZEN,
  );
  assert.equal(
    getEffectiveRouteStopStatus(ROUTE_STOP_STATUS.UPCOMING, { frozen: true }),
    ROUTE_STOP_STATUS.FROZEN,
  );
  assert.equal(
    getEffectiveRouteStopStatus(ROUTE_STOP_STATUS.COMPLETED, { frozen: true }),
    ROUTE_STOP_STATUS.COMPLETED,
  );
});

test("route stop effective status reads row overlay fields", () => {
  assert.equal(
    routeStopEffectiveStatus({ lifecycle_status: "active", locked: true }),
    ROUTE_STOP_STATUS.LOCKED,
  );
  assert.equal(
    routeStopEffectiveStatus({ lifecycleStatus: "upcoming", frozenUntil: "2026-09-17" }),
    ROUTE_STOP_STATUS.FROZEN,
  );
  assert.equal(
    routeStopEffectiveStatus({ lifecycleStatus: "completed", frozenUntil: "2026-09-17" }),
    ROUTE_STOP_STATUS.COMPLETED,
  );
  assert.equal(
    routeStopEffectiveStatus({ lifecycleStatus: "active" }, { routeFrozen: true }),
    ROUTE_STOP_STATUS.FROZEN,
  );
});

test("transition table rejects terminal and overlay transitions", () => {
  assert.equal(canTransitionRouteStop("upcoming", "active"), true);
  assert.equal(canTransitionRouteStop("active", "completed"), true);
  assert.equal(canTransitionRouteStop("skipped", "rescheduled"), true);
  assert.equal(canTransitionRouteStop("completed", "active"), false);
  assert.equal(canTransitionRouteStop("active", "locked"), false);
});

test("all seven statuses have Turkish labels", () => {
  for (const status of Object.values(ROUTE_STOP_STATUS)) {
    assert.ok(routeStopStatusLabel(status));
  }
});

test("first upcoming stop is promoted when restored history completed the old active stop", () => {
  const weeks = ensureSingleActiveRouteStop([
    { stops: [{ lifecycleStatus: "completed" }, { lifecycleStatus: "upcoming" }] },
    { stops: [{ lifecycleStatus: "upcoming" }] },
  ]);
  assert.deepEqual(
    weeks.flatMap((week) => week.stops.map((stop) => stop.lifecycleStatus)),
    ["completed", "active", "upcoming"],
  );
});
