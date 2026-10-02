import test from "node:test";
import assert from "node:assert/strict";
import { weekReasons } from "../../src/domain/route/weekReasons.js";

const s = (subject, topic, status, reasonText) => ({ subject, subjectLabel: subject, topic, lifecycleStatus: status, insight: reasonText ? { reasonText } : null });

test("open stops with the engine's own reason, one per topic", () => {
  const week = { stops: [
    s("fizik", "Kuvvet", "completed", "x"),
    s("fizik", "Hareket", "active", "Son denemede fizik düştü."),
    s("fizik", "Hareket", "upcoming", "Son denemede fizik düştü."),
    s("turkce", "Paragraf", "upcoming", null),
    s("matematik", "Türev", "upcoming", "Tekrar zamanı."),
  ] };
  const r = weekReasons(week);
  assert.deepEqual(r.rows.map((x) => x.topic), ["Hareket", "Türev"]);
  assert.equal(r.open, 4);
  assert.equal(r.total, 5);
});
