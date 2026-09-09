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
  assert.equal(plan.tasks.reduce((sum, task) => sum + task.questionCount, 0), 80);
});
