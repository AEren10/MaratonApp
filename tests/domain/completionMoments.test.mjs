import assert from "node:assert/strict";
import test from "node:test";

import {
  summarizeWeekCompletion,
  isRouteComplete,
  pickCompletionMoment,
  markCompletionSeen,
  summarizeComebackStops,
} from "../../src/domain/route/completionMoments.js";

const week = (statuses) => ({
  weekStart: "2026-09-07",
  stops: statuses.map((lifecycleStatus) => ({ lifecycleStatus })),
});

test("week is complete only when every stop is completed", () => {
  assert.equal(summarizeWeekCompletion(week(["completed", "completed"])).complete, true);
  assert.equal(summarizeWeekCompletion(week(["completed", "active"])).complete, false);
  assert.equal(summarizeWeekCompletion(week([])).complete, false);
  assert.equal(summarizeWeekCompletion(null).complete, false);
});

test("route is complete only with topics and zero pending", () => {
  assert.equal(isRouteComplete({ topics: 40, pending: 0 }), true);
  assert.equal(isRouteComplete({ topics: 40, pending: 2 }), false);
  assert.equal(isRouteComplete({ topics: 0, pending: 0 }), false);
  assert.equal(isRouteComplete({ topics: 40 }), false);
  assert.equal(isRouteComplete(null), false);
});

test("nothing is picked before seen state loads", () => {
  const w = summarizeWeekCompletion(week(["completed"]));
  assert.equal(pickCompletionMoment({ seen: null, routeComplete: true, week: w, dayKey: "2026-09-13" }), null);
});

test("priority is route, then week, then day; each shows once", () => {
  const w = summarizeWeekCompletion(week(["completed"]));
  const input = { routeComplete: true, week: w, dayKey: "2026-09-13" };
  assert.equal(pickCompletionMoment({ ...input, seen: {} }), "route");
  assert.equal(pickCompletionMoment({ ...input, seen: { route: true } }), "week");
  assert.equal(pickCompletionMoment({ ...input, seen: { route: true, week: "2026-09-07" } }), "day");
  assert.equal(
    pickCompletionMoment({ ...input, seen: { route: true, week: "2026-09-07", day: "2026-09-13" } }),
    null,
  );
});

test("dismissing marks every concurrently eligible moment as seen", () => {
  const w = summarizeWeekCompletion(week(["completed"]));
  const input = { routeComplete: false, week: w, dayKey: "2026-09-13" };
  const next = markCompletionSeen({ ...input, seen: { day: "2026-09-12" } });
  assert.deepEqual(next, { day: "2026-09-13", week: "2026-09-07" });
  assert.equal(pickCompletionMoment({ ...input, seen: next }), null);
});

test("a new week or a new day becomes eligible again", () => {
  const seen = { week: "2026-08-31", day: "2026-09-12" };
  const w = summarizeWeekCompletion(week(["completed"]));
  assert.equal(pickCompletionMoment({ seen, routeComplete: false, week: w, dayKey: null }), "week");
  assert.equal(
    pickCompletionMoment({ seen: { week: w.key, day: "2026-09-12" }, routeComplete: false, week: w, dayKey: "2026-09-13" }),
    "day",
  );
});

test("comeback stop summary counts pending and today's closed stops", () => {
  const now = new Date(2026, 8, 13, 15, 0);
  const summary = summarizeComebackStops({
    stops: [
      { lifecycleStatus: "active" },
      { lifecycleStatus: "upcoming" },
      { lifecycleStatus: "completed", completedAt: new Date(2026, 8, 13, 10, 0).toISOString() },
      { lifecycleStatus: "completed", completedAt: new Date(2026, 8, 10, 10, 0).toISOString() },
      { lifecycleStatus: "completed" },
    ],
  }, now);
  assert.deepEqual(summary, { pendingStops: 2, stopsClosedToday: 1 });
  assert.deepEqual(summarizeComebackStops(null, now), { pendingStops: 0, stopsClosedToday: 0 });
});
