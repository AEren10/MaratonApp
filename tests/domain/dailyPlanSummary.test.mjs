import assert from "node:assert/strict";
import test from "node:test";

import { buildDailyPlanSummary } from "../../src/domain/plan/dailyPlanSummary.js";

test("summarizes a route-backed daily plan with confidence and next action", () => {
  const summary = buildDailyPlanSummary({
    totalQuestions: 40,
    estimatedMinutes: 80,
    tasks: [{
      subject: "matematik",
      subjectLabel: "Matematik",
      topicLabel: "Problemler",
      routeStopId: "stop-1",
      routeConfidence: "medium",
      planTaskKey: "plan_math:problemler",
      assignment: { source: "route" },
    }],
  });

  assert.equal(summary.version, "daily-plan-summary-v1");
  assert.equal(summary.source, "route");
  assert.equal(summary.title, "Bugünkü rota hamlesi hazır");
  assert.equal(summary.confidenceLabel, "orta");
  assert.equal(summary.effort, "~1 saat");
  assert.equal(summary.routeTaskCount, 1);
  assert.equal(summary.primaryTaskKey, "plan_math:problemler");
  assert.equal(summary.primaryTopic, "Problemler");
  assert.match(summary.nextAction, /Matematik \/ Problemler/);
});

test("marks adaptive plans as route-not-attached without blocking the program", () => {
  const summary = buildDailyPlanSummary({
    totalQuestions: 24,
    estimatedMinutes: 29,
    tasks: [{
      subject: "turkce",
      subjectLabel: "Türkçe",
      topicLabel: "Paragraf",
      planTaskKey: "plan_adaptive:turkce",
      assignment: { source: "adaptive" },
    }],
  });

  assert.equal(summary.source, "adaptive");
  assert.equal(summary.confidenceLabel, "veri topluyor");
  assert.equal(summary.effort, "~29 dk");
  assert.ok(summary.risks.some((risk) => risk.code === "route_not_attached"));
});

test("returns an actionable empty state when no task can be generated", () => {
  const summary = buildDailyPlanSummary();

  assert.equal(summary.source, "empty");
  assert.equal(summary.totalTasks, 0);
  assert.equal(summary.primaryTaskKey, null);
  assert.ok(summary.risks.some((risk) => risk.code === "plan_data_missing"));
  assert.match(summary.nextAction, /İlk hedef veya deneme/);
});
