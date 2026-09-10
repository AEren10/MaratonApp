import assert from "node:assert/strict";
import test from "node:test";

import { capDebt, computeDebt } from "../../src/domain/route/debt.js";

// Tasarim borcu SAAT gosteriyor ("12 sa borc"), computeDebt ise yalniz soru
// sayiyordu. Dakika hafta verisindeki plannedMinutes'tan ORANLA turetiliyor.
const now = new Date("2026-09-11T12:00:00Z");
const weekStart = "2026-09-07";

test("kacirilan sorunun dakika karsiligi hafta oraniyla turetilir", () => {
  const debt = computeDebt(
    [{ weekStart, weekNo: 1, plannedQuestions: 100, plannedMinutes: 200, stops: [] }],
    { [weekStart]: { questions: 50 } },
    now,
  );
  // 50 soru kacirilmis, yas agirligi uygulanir; dakika ayni oranda (2 dk/soru)
  assert.ok(debt.totalQuestions > 0);
  assert.equal(debt.totalMinutes, debt.totalQuestions * 2);
});

test("plannedMinutes yoksa uydurma oran kullanilmaz", () => {
  const debt = computeDebt(
    [{ weekStart, weekNo: 1, plannedQuestions: 100, stops: [] }],
    { [weekStart]: { questions: 40 } },
    now,
  );
  assert.ok(debt.totalQuestions > 0);
  assert.equal(debt.totalMinutes, 0);
});

test("borc yoksa dakika da sifir", () => {
  const debt = computeDebt(
    [{ weekStart, weekNo: 1, plannedQuestions: 100, plannedMinutes: 200, stops: [] }],
    { [weekStart]: { questions: 100 } },
    now,
  );
  assert.equal(debt.hasDebt, false);
  assert.equal(debt.totalMinutes, 0);
});

test("borc tavani soru ve dakikayi ayni oranda sinirlar", () => {
  const capped = capDebt(
    { totalQuestions: 600, totalMinutes: 1200, items: [], hasDebt: true },
    { questionsPerWeek: 100 },
  );

  assert.equal(capped.capped, true);
  assert.equal(capped.totalQuestions, 300);
  assert.equal(capped.totalMinutes, 600);
  assert.equal(capped.originalQuestions, 600);
  assert.equal(capped.originalMinutes, 1200);
});
