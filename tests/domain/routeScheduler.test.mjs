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

test("partial stops split questions and minutes proportionally", () => {
  const { weeks, overflow } = scheduleWeeks([
    item("Büyük konu", 100, 200),
  ], { questionsPerWeek: 100, minutesPerWeek: 100 }, 1);
  const segment = weeks[0].stops[0];
  assert.equal(segment.cost.questions, 32);
  assert.equal(segment.cost.minutes, 65);
  assert.equal(segment.partial, true);
  assert.equal(overflow[0].cost.questions, 68);
  assert.equal(overflow[0].cost.minutes, 135);
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
