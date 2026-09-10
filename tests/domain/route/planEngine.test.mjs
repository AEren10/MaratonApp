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
});
