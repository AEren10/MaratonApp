import test from "node:test";
import assert from "node:assert/strict";

import { wrongSignalByTopic, wrongBoost } from "../../../src/domain/route/wrongSignal.js";
import { buildRoute } from "../../../src/lib/routeEngine.js";

const now = new Date("2026-09-30T12:00:00+03:00");

test("cozulmemis ve zamani gelen yanlislar konu konu sayilir", () => {
  const s = wrongSignalByTopic([
    { subject: "matematik", topic: "Üslü Sayılar", is_resolved: false, next_review_at: "2026-09-29T00:00:00Z" },
    { subject: "matematik", topic: "Üslü Sayılar", is_resolved: false, next_review_at: "2026-10-09T00:00:00Z" },
    { subject: "matematik", topic: "Üslü Sayılar", is_resolved: true },
  ], now);
  assert.deepEqual(s.matematik["Üslü Sayılar"], { open: 2, due: 1 });
  assert.equal(wrongBoost({ open: 10 }), 1.3);
});

test("bekleyen yanlisi olan konunun onceligi yanlis sayisiyla artar", () => {
  const pool = [{ key: "matematik", label: "Matematik", questionCount: 40, topics: ["Kümeler", "Fonksiyonlar"] }];
  const stopOf = (route) => route.weeks.flatMap((w) => w.stops).find((s) => s.topic === "Fonksiyonlar");
  const base = stopOf(buildRoute({ pool, daysLeft: 200, now }));
  const boosted = stopOf(buildRoute({ pool, daysLeft: 200, now, wrongsByTopic: { matematik: { Fonksiyonlar: { open: 5, due: 5 } } } }));
  assert.ok(Math.abs(boosted.score - base.score * 1.3) < 0.02);
  assert.ok(boosted.reasonCodes.includes("WRONG_BACKLOG"));
});

test("ustalasilmis konuda zamani gelen yanlislar ayri 'yanlis tekrari' duragi olur", () => {
  const pool = [{ key: "matematik", label: "Matematik", questionCount: 40, topics: ["Kümeler", "Olasılık"] }];
  const progressByKey = { matematik: { Kümeler: { total_questions: 60, correct_count: 55, last_studied_at: "2026-09-29T00:00:00Z", study_count: 5 } } };
  const route = buildRoute({ pool, progressByKey, daysLeft: 200, now, wrongsByTopic: { matematik: { Kümeler: { open: 3, due: 3 } } } });
  const all = route.weeks.flatMap((w) => w.stops);
  const wr = all.find((s) => s.reasonCodes.includes("WRONG_REVIEW"));
  assert.ok(wr);
  assert.equal(wr.topic, "Kümeler");
  assert.equal(wr.reviewCycle, "wrongs");
});
