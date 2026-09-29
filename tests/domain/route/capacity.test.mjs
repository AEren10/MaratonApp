import assert from "node:assert/strict";
import test from "node:test";

import { estimateWeeklyCapacity, rampedCapacity } from "../../../src/domain/route/capacity.js";

test("bos haftalar tempoyu sifirlamaz, duzenlilik carpani olur; mevcut kismi hafta sayilmaz", () => {
  const now = new Date("2026-09-09T12:00:00+03:00");
  const result = estimateWeeklyCapacity([
    { study_date: "2026-08-11T12:00:00+03:00", question_count: 700, duration_minutes: 700 },
    { study_date: "2026-09-08T12:00:00+03:00", question_count: 900, duration_minutes: 900 },
  ], 80, now);

  // aktif hafta 700 x duzenlilik (0.25 + 0.75 * 1/4) = 306, %15 esnetme = 352 (hedef 560)
  assert.equal(result.observedQuestionsPerWeek, 306);
  assert.equal(result.questionsPerWeek, 352);
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

test("hedefin altindaki ogrenci kademeli esnetilir, hedefin ustundeki yavaslatilmaz", () => {
  const now = new Date("2026-09-30T12:00:00+03:00");
  const weekLogs = (q) => ["2026-09-01", "2026-09-08", "2026-09-15", "2026-09-22"]
    .map((d) => ({ study_date: `${d}T12:00:00+03:00`, question_count: q, duration_minutes: q }));
  const slow = estimateWeeklyCapacity(weekLogs(100), 80, now);
  assert.equal(slow.observedQuestionsPerWeek, 100);
  assert.equal(slow.questionsPerWeek, 115);
  const fast = estimateWeeklyCapacity(weekLogs(900), 80, now);
  assert.equal(fast.questionsPerWeek, 900);
  const near = estimateWeeklyCapacity(weekLogs(540), 80, now);
  assert.equal(near.questionsPerWeek, 560);
});
