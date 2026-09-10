import assert from "node:assert/strict";
import test from "node:test";

import { generateDailyPlan } from "../../../src/lib/planEngine.js";

test("keeps multiple stops from the same subject and assigns the full target", () => {
  const plan = generateDailyPlan({
    examType: "tyt",
    dailyTarget: 80,
    routeWeekStops: [
      { id: "a", subject: "matematik", topic: "Problemler", logicalStopKey: "math:a", version: 1 },
      { id: "b", subject: "matematik", topic: "Geometri", logicalStopKey: "math:b", version: 2 },
      { id: "c", subject: "turkce", topic: "Paragraf", logicalStopKey: "tr:c", version: 3 },
    ],
  });

  assert.equal(plan.tasks.length, 3);
  assert.deepEqual(plan.tasks.map((task) => task.topic), ["Problemler", "Geometri", "Paragraf"]);
  assert.deepEqual(plan.tasks.map((task) => task.routeStopId), ["a", "b", "c"]);
  assert.deepEqual(plan.tasks.map((task) => task.stopId), ["a", "b", "c"]);
  assert.deepEqual(plan.tasks.map((task) => task.version), [1, 2, 3]);
  assert.deepEqual(plan.tasks.map((task) => task.planTaskKey), ["plan_math:a", "plan_math:b", "plan_tr:c"]);
  assert.equal(plan.tasks.reduce((sum, task) => sum + task.questionCount, 0), 80);
});

test("carries route insight into the daily assignment reason", () => {
  const plan = generateDailyPlan({
    examType: "tyt",
    dailyTarget: 40,
    routeWeekStops: [{
      id: "a",
      subject: "matematik",
      topic: "Problemler",
      logicalStopKey: "math:a",
      cost: { questions: 80, minutes: 160 },
      insight: {
        reasonCode: "LOW_ACCURACY",
        reasonText: "Son denemelerde zayıf kalan alana denk geliyor.",
        confidence: "medium",
      },
    }],
  });

  assert.equal(plan.tasks[0].reason, "Son denemelerde zayıf kalan alana denk geliyor.");
  assert.equal(plan.tasks[0].estimatedMinutes, 80);
  assert.equal(plan.estimatedMinutes, 80);
  assert.equal(plan.tasks[0].routeConfidence, "medium");
  assert.equal(plan.tasks[0].routeInsight.reasonCode, "LOW_ACCURACY");
  assert.equal(plan.tasks[0].assignment.title, "Rota motoru seçti");
  assert.equal(plan.tasks[0].assignment.confidenceLabel, "orta");
  assert.equal(plan.summary.source, "route");
  assert.equal(plan.summary.routeTaskCount, 1);
  assert.equal(plan.summary.confidenceLabel, "orta");
  assert.equal(plan.summary.primaryTaskKey, "plan_math:a");
});

test("daily plan skips non-actionable route stops and caps route task cost", () => {
  const plan = generateDailyPlan({
    examType: "tyt",
    dailyTarget: 30,
    routeWeekStops: [
      {
        id: "done",
        subject: "matematik",
        topic: "Tamamlanan Konu",
        lifecycleStatus: "completed",
        cost: { questions: 90, minutes: 180 },
        score: 999,
      },
      {
        id: "active",
        subject: "matematik",
        topic: "Problemler",
        lifecycleStatus: "active",
        cost: { questions: 5, minutes: 10 },
        score: 120,
        insight: { reasonCode: "LOW_ACCURACY", confidence: "medium" },
      },
      {
        id: "next",
        subject: "turkce",
        topic: "Paragraf",
        lifecycleStatus: "upcoming",
        cost: { questions: 80, minutes: 100 },
        score: 30,
      },
    ],
  });

  assert.deepEqual(plan.tasks.map((task) => task.stopId), ["active", "next"]);
  assert.deepEqual(plan.tasks.map((task) => task.questionCount), [5, 25]);
  assert.equal(plan.tasks[0].routeAllocation.cappedByRouteCost, true);
  assert.equal(plan.summary.totalQuestions, 30);
});

test("daily plan fills route cost leftovers with adaptive tasks", () => {
  const plan = generateDailyPlan({
    examType: "tyt",
    dailyTarget: 30,
    weakAreas: { turkce: 35, sosyal: 90 },
    routeWeekStops: [
      {
        id: "active",
        subject: "matematik",
        topic: "Problemler",
        lifecycleStatus: "active",
        cost: { questions: 5, minutes: 10 },
        score: 120,
        insight: { reasonCode: "LOW_ACCURACY", confidence: "medium" },
      },
    ],
  });

  assert.equal(plan.tasks[0].stopId, "active");
  assert.equal(plan.tasks[0].questionCount, 5);
  assert.equal(plan.tasks[1].stopId, null);
  assert.equal(
    plan.tasks.slice(1).reduce((sum, task) => sum + task.questionCount, 0),
    25,
  );
  assert.equal(plan.totalQuestions, 30);
});
