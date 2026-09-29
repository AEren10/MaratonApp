import test from "node:test";
import assert from "node:assert/strict";

import { effectiveAccuracy } from "../../../src/domain/route/effectiveAccuracy.js";
import { buildRoute } from "../../../src/lib/routeEngine.js";

test("dogru girilmemisse %0 degil; geri bildirim ve hacim kullanilir", () => {
  assert.deepEqual(effectiveAccuracy({ q: 20, correct: 15 }), { acc: 75, known: true });
  assert.deepEqual(effectiveAccuracy({ q: 20, correct: 0 }), { acc: 70, known: false });
  assert.deepEqual(effectiveAccuracy({ q: 20, correct: 0, feel: "hard" }), { acc: 55, known: false });
  assert.deepEqual(effectiveAccuracy({ q: 50, correct: 0 }), { acc: 82, known: false });
});

test("dogrusu girilmemis calisilmis konu zayif damgasi yemez", () => {
  const pool = [{ key: "matematik", label: "Matematik", questionCount: 40, topics: ["Kümeler", "Olasılık"] }];
  const progressByKey = { matematik: { Kümeler: { total_questions: 12, correct_count: 0, last_studied_at: "2026-09-28T00:00:00Z", study_count: 1 } } };
  const route = buildRoute({ pool, progressByKey, daysLeft: 200, now: new Date("2026-09-30T12:00:00+03:00") });
  const stop = route.weeks.flatMap((w) => w.stops).find((s) => s.topic === "Kümeler");
  assert.ok(stop);
  assert.ok(!stop.reasonCodes.includes("LOW_ACCURACY"));
});
