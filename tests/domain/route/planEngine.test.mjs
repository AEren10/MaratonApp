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

test("daily plan preserves completed today stops and strictly caps total tasks", () => {
  const todayIso = new Date().toISOString();
  const routeWeekStops = [
    {
      id: "done-1",
      subject: "matematik",
      topic: "Fonksiyonlar",
      lifecycleStatus: "completed",
      completedAt: todayIso,
      cost: { questions: 20, minutes: 30 },
    },
    {
      id: "done-2",
      subject: "turkce",
      topic: "Paragraf",
      lifecycleStatus: "completed",
      completedToday: true,
      cost: { questions: 20, minutes: 30 },
    },
    {
      id: "active-1",
      subject: "fizik",
      topic: "Kuvvet ve Hareket",
      lifecycleStatus: "active",
      cost: { questions: 20, minutes: 30 },
    },
    {
      id: "active-2",
      subject: "kimya",
      topic: "Mol Kavramı",
      lifecycleStatus: "upcoming",
      cost: { questions: 20, minutes: 30 },
    },
    {
      id: "extra-1",
      subject: "biyoloji",
      topic: "Hücre",
      lifecycleStatus: "upcoming",
      cost: { questions: 20, minutes: 30 },
    },
    {
      id: "extra-2",
      subject: "tarih",
      topic: "İlk Çağ",
      lifecycleStatus: "upcoming",
      cost: { questions: 20, minutes: 30 },
    },
  ];

  const plan = generateDailyPlan({
    examType: "tyt",
    dailyTarget: 80,
    routeWeekStops,
  });

  // maxTaskCount = 4
  // 2 tamamlanan + 2 aktif = tam 4 durak (extra-1 ve extra-2 ÇEKİLMEZ)
  assert.equal(plan.tasks.length, 4);
  assert.equal(plan.tasks.filter((t) => t.completed).length, 2);
  assert.equal(plan.tasks.filter((t) => !t.completed).length, 2);
  assert.deepEqual(plan.tasks.map((t) => t.stopId), ["done-1", "done-2", "active-1", "active-2"]);
});

test("when quota is full with completed today stops, no new active stops are spawned", () => {
  const routeWeekStops = [
    { id: "d1", subject: "matematik", topic: "T1", lifecycleStatus: "completed", completedToday: true },
    { id: "d2", subject: "turkce", topic: "T2", lifecycleStatus: "completed", completedToday: true },
    { id: "d3", subject: "fizik", topic: "T3", lifecycleStatus: "completed", completedToday: true },
    { id: "d4", subject: "kimya", topic: "T4", lifecycleStatus: "completed", completedToday: true },
    { id: "extra", subject: "biyoloji", topic: "T5", lifecycleStatus: "upcoming" },
  ];

  const plan = generateDailyPlan({
    examType: "tyt",
    dailyTarget: 80,
    routeWeekStops,
  });

  // 4 durak da bugün bitmiş, arkadan ekstra durak gelmez!
  assert.equal(plan.tasks.length, 4);
  assert.ok(plan.tasks.every((t) => t.completed));
  assert.ok(!plan.tasks.some((t) => t.stopId === "extra"));
});
