import test from "node:test";
import assert from "node:assert/strict";
import { accuracyGains } from "../../src/domain/summary/accuracyGains.js";

const range = { start: "2026-09-28", end: "2026-10-04", prevStart: "2026-09-21", prevEnd: "2026-09-27" };
const log = (d, topic, q, c) => ({ study_date: d, subject: "matematik", topic, question_count: q, correct_count: c });

test("real gains only, from graded logs with enough questions", () => {
  const logs = [
    log("2026-09-22", "Geometri", 25, 12), log("2026-09-30", "Geometri", 25, 16),
    log("2026-09-23", "Türev", 20, 15), log("2026-10-01", "Türev", 20, 15),
    log("2026-09-24", "Limit", 5, 1), log("2026-10-02", "Limit", 5, 5),
    log("2026-09-25", "Kümeler", 20, 0), log("2026-10-02", "Kümeler", 20, 18),
  ];
  assert.deepEqual(accuracyGains(logs, range), [{ subject: "matematik", topic: "Geometri", before: 48, after: 64 }]);
});
