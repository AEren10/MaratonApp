import assert from "node:assert/strict";
import test from "node:test";

import { estimateWeeklyCapacity, rampedCapacity } from "../../../src/domain/route/capacity.js";

test("includes zero completed weeks and ignores the current partial week", () => {
  const now = new Date("2026-09-09T12:00:00+03:00");
  const result = estimateWeeklyCapacity([
    { study_date: "2026-08-11T12:00:00+03:00", question_count: 700, duration_minutes: 700 },
    { study_date: "2026-09-08T12:00:00+03:00", question_count: 900, duration_minutes: 900 },
  ], 80, now);

  assert.equal(result.questionsPerWeek, 10);
  assert.equal(result.weeksObserved, 1);
  assert.equal(result.zeroWeeks, 3);
  assert.equal(result.confidence, "low");
});

test("falls back to the declared goal when log loading failed", () => {
  const result = estimateWeeklyCapacity([], 50, new Date(), { dataState: "error" });
  assert.equal(result.questionsPerWeek, 350);
  assert.equal(result.source, "goal");
  assert.equal(result.missingData, true);
});

test("returns gradually after a meaningful pause", () => {
  const base = { questionsPerWeek: 200, minutesPerWeek: 300 };
  assert.equal(rampedCapacity(base, null).questionsPerWeek, 200);
  assert.equal(rampedCapacity(base, 0).questionsPerWeek, 110);
  assert.equal(rampedCapacity(base, 1).questionsPerWeek, 140);
  assert.equal(rampedCapacity(base, 3).questionsPerWeek, 200);
});
