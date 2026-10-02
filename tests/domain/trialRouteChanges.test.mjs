import test from "node:test";
import assert from "node:assert/strict";
import { trialRouteChanges } from "../../src/domain/route/trialRouteChanges.js";

const trial = (date, mat) => ({ date, subjects: { tyt_matematik: { correct: mat, wrong: 40 - mat, empty: 0 }, tyt_turkce: { correct: 30, wrong: 10, empty: 0 } } });

test("dropped subject and its next open stop", () => {
  const trials = [trial("2026-10-01", 15), trial("2026-09-24", 30)];
  const weeks = [{ stops: [
    { subject: "matematik", topic: "Kümeler", lifecycleStatus: "completed" },
    { subject: "matematik", topic: "Türev", lifecycleStatus: "upcoming" },
  ] }];
  const r = trialRouteChanges({ trials, weeks, labelOf: () => "Matematik" });
  assert.equal(r.length, 1);
  assert.deepEqual([r[0].subject, r[0].label, r[0].nextTopic], ["matematik", "Matematik", "Türev"]);
});

test("no drop, no claim", () => {
  assert.deepEqual(trialRouteChanges({ trials: [trial("2026-10-01", 30), trial("2026-09-24", 30)], weeks: [] }), []);
});
