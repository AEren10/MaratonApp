import assert from "node:assert/strict";
import test from "node:test";

import { buildRoute } from "../../src/lib/routeEngine.js";
import { explainRouteStop } from "../../src/domain/route/routeIntelligence.js";

const NOW = new Date("2026-09-10T12:00:00+03:00");

function pool(topics = ["Temel Kavramlar", "Problemler"]) {
  return [{
    key: "matematik",
    label: "Matematik",
    color: "#fb923c",
    questionCount: 40,
    topics,
  }];
}

function historyLogs() {
  return [
    { study_date: "2026-08-17", question_count: 120, duration_minutes: 180 },
    { study_date: "2026-08-24", question_count: 150, duration_minutes: 210 },
    { study_date: "2026-08-31", question_count: 130, duration_minutes: 190 },
  ];
}

test("route intelligence exposes confidence, signals and stop explanations", () => {
  const route = buildRoute({
    pool: pool(),
    progressByKey: {
      matematik: {
        "Temel Kavramlar": { total_questions: 12, correct_count: 8 },
        Problemler: { total_questions: 4, correct_count: 1 },
      },
    },
    studyLogs: historyLogs(),
    weakSubjectKeys: ["matematik"],
    dailyQuestionGoal: 20,
    daysLeft: 90,
    now: NOW,
    examType: "tyt",
  });

  assert.equal(route.intelligence.version, "route-intelligence-v1");
  assert.match(route.intelligence.confidence, /high|medium/);
  assert.equal(route.intelligence.signals.capacitySource, "history");
  assert.ok(route.weeks[0].stops[0].insight.reasonText.length > 0);
});

test("route intelligence flags overflow when the route does not fit", () => {
  const topics = Array.from({ length: 18 }, (_, index) => `Konu ${index + 1}`);
  const route = buildRoute({
    pool: pool(topics),
    progressByKey: {},
    studyLogs: [],
    dailyQuestionGoal: 1,
    daysLeft: 7,
    now: NOW,
    examType: "tyt",
  });

  assert.equal(route.feasible, false);
  assert.ok(route.intelligence.risks.some((risk) => risk.code === "route_overflow"));
  assert.ok(route.intelligence.confidenceScore < 75);
});

test("stop explanation prefers the dominant route reason", () => {
  const insight = explainRouteStop({
    reasonCodes: ["LOW_ACCURACY", "HIGH_EXAM_WEIGHT"],
    dataConfidence: "medium",
    scoreComponents: { expectedNetGain: 1.234, effortQuestions: 18 },
  });

  assert.equal(insight.reasonCode, "LOW_ACCURACY");
  assert.equal(insight.confidence, "medium");
  assert.equal(insight.expectedNetGain, 1.23);
});
