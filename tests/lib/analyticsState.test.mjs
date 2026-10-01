import test from "node:test";
import assert from "node:assert/strict";

import {
  acknowledgeAnalyticsPartition,
  createAnalyticsEnvelope,
  canReuseAnalyticsInitialization,
  isActiveAnalyticsIdentity,
  mergeAnalyticsEvents,
  mergeAnalyticsPartitions,
  needsNewAnalyticsSession,
  removeAnalyticsEvents,
  sanitizeAnalyticsProperties,
} from "../../src/lib/analyticsState.js";

test("analytics envelope keeps its client id and original timestamp across merge and ack", () => {
  const original = createAnalyticsEnvelope("study.completed", { minutes: 42 }, {
    at: "2026-10-02T08:15:00.000Z",
    clientEventId: "event-stable-1",
    sessionId: "session-a",
    userId: "user-a",
  });
  const retried = { ...original };

  const merged = mergeAnalyticsEvents([original], [retried]);
  assert.equal(merged.length, 1);
  assert.equal(merged[0].clientEventId, "event-stable-1");
  assert.equal(merged[0].at, "2026-10-02T08:15:00.000Z");
  assert.deepEqual(removeAnalyticsEvents(merged, ["another-event"]), merged);
  assert.deepEqual(removeAnalyticsEvents(merged, ["event-stable-1"]), []);
});

test("user partition merge and acknowledgement cannot remove another user's events", () => {
  const eventA = createAnalyticsEnvelope("screen.view", {}, {
    clientEventId: "event-a", userId: "user-a",
  });
  const eventB = createAnalyticsEnvelope("screen.view", {}, {
    clientEventId: "event-b", userId: "user-b",
  });
  const duringInit = createAnalyticsEnvelope("button.tap", { id: "safe-button" }, {
    clientEventId: "event-a-new", userId: "user-a",
  });

  const merged = mergeAnalyticsPartitions(
    { "user-a": [eventA], "user-b": [eventB] },
    { "user-a": [duringInit] },
  );
  const afterOldUserFlush = acknowledgeAnalyticsPartition(merged, "user-a", ["event-a"]);

  assert.deepEqual(afterOldUserFlush["user-a"].map((event) => event.clientEventId), ["event-a-new"]);
  assert.deepEqual(afterOldUserFlush["user-b"].map((event) => event.clientEventId), ["event-b"]);
});

test("analytics property sanitizer allows product dimensions and removes sensitive values", () => {
  const result = sanitizeAnalyticsProperties({
    screen: "PlanDetail",
    durationMs: 1250,
    queued: true,
    email: "student@example.com",
    note: "private note",
    url: "maraton://yanlis/secret",
    wrongQuestionId: "database-row-id",
    notificationToken: "push-token",
    referralCode: "SECRET",
    unknown: "not-in-contract",
  });

  assert.deepEqual(result, { screen: "PlanDetail", durationMs: 1250, queued: true });
});

test("analytics strings and numbers are bounded", () => {
  const result = sanitizeAnalyticsProperties({ source: "x".repeat(200), durationMs: Infinity, weeks: 2e9 });
  assert.equal(result.source.length, 80);
  assert.equal("durationMs" in result, false);
  assert.equal(result.weeks, 1_000_000_000);
});

test("button identifiers accept static keys but reject record UUIDs", () => {
  assert.deepEqual(sanitizeAnalyticsProperties({ id: "home_nav_PlanDetail" }), {
    id: "home_nav_PlanDetail",
  });
  assert.deepEqual(sanitizeAnalyticsProperties({
    id: "123e4567-e89b-42d3-a456-426614174000",
  }), {});
});

test("30 minutes in background is a new analytics session boundary", () => {
  const pausedAt = 1_000;
  assert.equal(needsNewAnalyticsSession(pausedAt, pausedAt + 29 * 60 * 1000), false);
  assert.equal(needsNewAnalyticsSession(pausedAt, pausedAt + 30 * 60 * 1000), true);
});

test("stale auth initialization cannot become the active analytics identity", () => {
  const stale = { owner: "user-a", generation: 1 };
  assert.equal(canReuseAnalyticsInitialization(stale, "user-a", 1), true);
  assert.equal(canReuseAnalyticsInitialization(stale, "user-a", 2), false);
  assert.equal(isActiveAnalyticsIdentity("user-a", 1, "user-b", 2), false);
  assert.equal(isActiveAnalyticsIdentity("user-b", 2, "user-b", 2), true);
});
