import assert from "node:assert/strict";
import test from "node:test";

import { scheduleWeeks } from "../../src/domain/route/scheduler.js";

const item = (topic, questions, minutes) => ({
  subject: "matematik",
  subjectLabel: "Matematik",
  topic,
  cost: { questions, minutes },
});

test("scheduler never exceeds question or minute budget", () => {
  const { weeks } = scheduleWeeks([
    item("A", 60, 80),
    item("B", 30, 10),
  ], { questionsPerWeek: 100, minutesPerWeek: 100 }, 2);
  for (const week of weeks) {
    assert.ok(week.plannedQuestions <= week.budgetQuestions);
    assert.ok(week.plannedMinutes <= week.budgetMinutes);
  }
});

test("buyuk konu oturum boyunda parcalara bolunur; soru ve dakika orantili", () => {
  const { weeks, overflow } = scheduleWeeks([
    item("Büyük konu", 100, 200),
  ], { questionsPerWeek: 100, minutesPerWeek: 100 }, 1);
  // gunluk tempo 100/5 = 20 soru -> 5 parca, her biri 20 soru 40 dk
  const segment = weeks[0].stops[0];
  assert.equal(segment.cost.questions, 20);
  assert.equal(segment.cost.minutes, 40);
  assert.equal(segment.partial, true);
  const rest = overflow.reduce((n, s) => n + s.cost.questions, 0);
  assert.equal(rest + weeks[0].stops.reduce((n, s) => n + s.cost.questions, 0), 100);
});

test("oncelikli buyuk konu kucuk konulara yer kaptirip sinav sonrasina dusmez", () => {
  const { weeks } = scheduleWeeks([
    item("Paragraf", 60, 90),
    ...Array.from({ length: 10 }, (_, i) => ({ ...item(`Kucuk ${i}`, 12, 15), subject: `d${i}` })),
  ], { questionsPerWeek: 100, minutesPerWeek: 140 }, 3);
  assert.equal(weeks[0].stops[0].topic, "Paragraf");
});

test("final partial week scales both budgets by remaining days", () => {
  const { weeks } = scheduleWeeks([
    item("A", 40, 40),
    item("B", 40, 40),
    item("C", 40, 40),
  ], { questionsPerWeek: 140, minutesPerWeek: 210 }, 2, { daysLeft: 10 });
  assert.equal(weeks[1].capacityFraction, 3 / 7);
  assert.equal(weeks[1].budgetQuestions, 39);
  assert.equal(weeks[1].budgetMinutes, 58);
  assert.ok(weeks[1].plannedQuestions <= 39);
  assert.ok(weeks[1].plannedMinutes <= 58);
});

test("ilk parca bitince kalan isin parcalari bitmis parcanin kimligini almaz", async () => {
  const { decorateScheduledRoute } = await import("../../src/domain/route/routeIdentity.js");
  const cap = { questionsPerWeek: 85, minutesPerWeek: 400, activeDaysPerWeek: 5 }; // oturum 17 soru
  const keysFor = (q, questions) => {
    const { weeks } = scheduleWeeks([{ ...item("Paragraf", questions, questions * 2), q }], cap, 4);
    return decorateScheduledRoute(weeks).flatMap((w) => w.stops).map((s) => s.segmentIndex);
  };
  assert.deepEqual(keysFor(0, 51), [0, 1, 2]);
  assert.deepEqual(keysFor(17, 34), [1, 2]);
  assert.deepEqual(keysFor(34, 17), [2]);
});
