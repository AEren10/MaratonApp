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
  assert.equal(route.intelligence.strategy.version, "route-strategy-v1");
  assert.equal(route.intelligence.strategy.firstWeek.stopCount, route.weeks[0].stops.length);
  assert.ok(route.intelligence.strategy.firstWeek.questions > 0);
  assert.ok(route.intelligence.strategy.focusAreas.length > 0);
  assert.ok(route.intelligence.strategy.qualityHeadline.includes("tempo"));
  assert.ok(route.intelligence.qualityChecks.some((check) => check.key === "first_week_action"));
  assert.ok(route.intelligence.decisionTrace.length >= 3);
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
  assert.equal(route.intelligence.risks[0].code, "route_overflow");
  assert.ok(route.intelligence.risks.some((risk) => risk.code === "route_overflow"));
  assert.ok(route.intelligence.confidenceScore < 75);
  assert.match(route.intelligence.strategy.headline, /tempo/);
  assert.notEqual(route.intelligence.strategy.pacing.pressure, "dengeli");
  assert.ok(route.intelligence.decisionTrace.some((line) => line.includes("süre baskısı")));
  assert.equal(
    route.intelligence.qualityChecks.find((check) => check.key === "deadline_fit").status,
    "warn",
  );
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

test("route treats topic-level low accuracy as a weak signal without subject flag", () => {
  const route = buildRoute({
    pool: pool(["Temel Kavramlar", "Problemler", "Oran Orantı"]),
    progressByKey: {
      matematik: {
        "Temel Kavramlar": { total_questions: 12, correct_count: 10 },
        Problemler: { total_questions: 10, correct_count: 3 },
        "Oran Orantı": { total_questions: 8, correct_count: 0 },
      },
    },
    studyLogs: historyLogs(),
    weakSubjectKeys: [],
    dailyQuestionGoal: 30,
    daysLeft: 90,
    now: NOW,
    examType: "tyt",
  });

  const problemStop = route.weeks
    .flatMap((week) => week.stops)
    .find((stop) => stop.topic === "Problemler");

  assert.ok(problemStop);
  assert.equal(problemStop.insight.reasonCode, "LOW_ACCURACY");
  assert.equal(problemStop.scoreComponents.weakAreaBoost, 1.35);

  const zeroCorrectStop = route.weeks
    .flatMap((week) => week.stops)
    .find((stop) => stop.topic === "Oran Orantı");

  assert.ok(zeroCorrectStop);
  assert.equal(zeroCorrectStop.insight.reasonCode, "LOW_ACCURACY");
  assert.equal(zeroCorrectStop.scoreComponents.weakAreaBoost, 1.35);
});

test("route intelligence exposes neglected topic recency as an explainable signal", () => {
  const route = buildRoute({
    pool: pool(["Temel Kavramlar", "Problemler"]),
    progressByKey: {
      matematik: {
        "Temel Kavramlar": {
          total_questions: 12,
          correct_count: 10,
          last_studied_at: "2026-08-10T09:00:00+03:00",
        },
        Problemler: { total_questions: 4, correct_count: 1 },
      },
    },
    studyLogs: historyLogs(),
    weakSubjectKeys: [],
    dailyQuestionGoal: 20,
    daysLeft: 90,
    now: NOW,
    examType: "tyt",
  });

  const recency = route.intelligence.qualityChecks
    .find((check) => check.key === "recency_balance");

  assert.equal(route.intelligence.signals.neglectedStops, 1);
  assert.equal(recency.status, "ok");
  assert.match(recency.detail, /uzun ara verilen/);
});
