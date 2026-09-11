import assert from "node:assert/strict";
import test from "node:test";

import {
  buildDailyRouteTaskAllocations,
  DAILY_TASK_ALLOCATOR_VERSION,
  isDailyAssignableRouteStop,
} from "../../src/domain/plan/dailyTaskAllocator.js";

test("daily route allocation prioritizes active high-signal stops", () => {
  const allocations = buildDailyRouteTaskAllocations([
    {
      key: "turkce",
      score: 50,
      routeStop: {
        lifecycleStatus: "upcoming",
        cost: { questions: 80 },
        reasonCodes: ["ROUTE_COMMITMENT"],
      },
    },
    {
      key: "matematik",
      score: 30,
      routeStop: {
        lifecycleStatus: "active",
        cost: { questions: 80 },
        insight: { reasonCode: "LOW_ACCURACY", confidence: "high" },
      },
    },
  ], 40);

  assert.equal(allocations[0].key, "matematik");
  assert.equal(allocations[0].allocation.version, DAILY_TASK_ALLOCATOR_VERSION);
  assert.equal(allocations[0].allocation.reasonCode, "LOW_ACCURACY");
  assert.equal(allocations.reduce((sum, item) => sum + item.questionCount, 0), 40);
});

test("daily route allocation respects route stop cost and redistributes headroom", () => {
  const allocations = buildDailyRouteTaskAllocations([
    {
      key: "matematik",
      score: 100,
      routeStop: {
        lifecycleStatus: "active",
        cost: { questions: 5 },
        reasonCodes: ["LOW_ACCURACY"],
      },
    },
    {
      key: "turkce",
      score: 20,
      routeStop: {
        lifecycleStatus: "upcoming",
        cost: { questions: 80 },
        reasonCodes: ["ROUTE_COMMITMENT"],
      },
    },
  ], 30);

  assert.deepEqual(allocations.map((item) => item.questionCount), [5, 25]);
  assert.equal(allocations[0].allocation.cappedByRouteCost, true);
  assert.equal(allocations.reduce((sum, item) => sum + item.questionCount, 0), 30);
});

test("daily route allocation skips non-actionable route statuses", () => {
  assert.equal(isDailyAssignableRouteStop({ lifecycleStatus: "completed" }), false);
  assert.equal(isDailyAssignableRouteStop({ effectiveStatus: "frozen" }), false);
  assert.equal(isDailyAssignableRouteStop({ lifecycleStatus: "active", locked: true }), false);
  assert.equal(isDailyAssignableRouteStop({ lifecycleStatus: "upcoming", frozenUntil: "2026-09-17" }), false);
  assert.equal(isDailyAssignableRouteStop({ lifecycleStatus: "upcoming" }), true);

  const allocations = buildDailyRouteTaskAllocations([
    { key: "a", routeStop: { lifecycleStatus: "completed", cost: { questions: 50 } } },
    { key: "b", routeStop: { effectiveStatus: "frozen", cost: { questions: 50 } } },
    { key: "c", routeStop: { lifecycleStatus: "active", locked: true, cost: { questions: 50 } } },
    { key: "c", routeStop: { lifecycleStatus: "upcoming", cost: { questions: 50 } } },
  ], 20);

  assert.deepEqual(allocations.map((item) => item.key), ["c"]);
  assert.equal(allocations[0].questionCount, 20);
});

test("daily route allocation uses remaining route stop questions", () => {
  const allocations = buildDailyRouteTaskAllocations([
    {
      key: "matematik",
      score: 100,
      routeStop: {
        lifecycleStatus: "active",
        cost: { questions: 30 },
        completedQuestions: 24,
        reasonCodes: ["LOW_ACCURACY"],
      },
    },
    {
      key: "turkce",
      score: 80,
      routeStop: {
        lifecycleStatus: "upcoming",
        cost: { questions: 50 },
        reasonCodes: ["ROUTE_COMMITMENT"],
      },
    },
    {
      key: "fen",
      score: 70,
      routeStop: {
        lifecycleStatus: "upcoming",
        questions: 20,
        completed_questions: 20,
        reasonCodes: ["ROUTE_COMMITMENT"],
      },
    },
  ], 30);

  assert.deepEqual(allocations.map((item) => item.key), ["matematik", "turkce"]);
  assert.deepEqual(allocations.map((item) => item.questionCount), [6, 24]);
  assert.equal(allocations[0].allocation.maxQuestions, 6);
  assert.equal(allocations[0].allocation.cappedByRouteCost, true);
});

test("daily route allocation backfills capped top stops to cover the daily target", () => {
  const allocations = buildDailyRouteTaskAllocations([
    { key: "a", score: 100, routeStop: { lifecycleStatus: "active", cost: { questions: 2 } } },
    { key: "b", score: 90, routeStop: { lifecycleStatus: "active", cost: { questions: 2 } } },
    { key: "c", score: 80, routeStop: { lifecycleStatus: "active", cost: { questions: 2 } } },
    { key: "d", score: 75, routeStop: { lifecycleStatus: "active", cost: { questions: 2 } } },
    { key: "e", score: 70, routeStop: { lifecycleStatus: "upcoming", cost: { questions: 80 } } },
  ], 40, { maxTasks: 4 });

  assert.deepEqual(allocations.map((item) => item.key), ["a", "b", "c", "e"]);
  assert.equal(allocations.reduce((sum, item) => sum + item.questionCount, 0), 40);
  assert.equal(allocations[3].questionCount, 34);
  assert.equal(allocations[3].allocation.undistributedQuestions, 0);
});
