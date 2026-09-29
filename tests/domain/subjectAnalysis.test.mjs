import test from "node:test";
import assert from "node:assert/strict";

import { subjectAnalysis, subjectAnalysisSentence } from "../../src/domain/analysis/subjectAnalysis.js";

const trial = (date, correct, wrong, empty) => ({ date, trialType: "TYT", subjects: { turkce: { correct, wrong, empty, net: correct - wrong / 4 } } });

test("stats come only from trials that include the subject, oldest to newest", () => {
  const a = subjectAnalysis([trial("2026-09-20", 30, 8, 2), trial("2026-09-10", 25, 10, 5), { date: "2026-09-15", subjects: {} }], "turkce");
  assert.equal(a.count, 2);
  assert.equal(a.last, 28);
  assert.equal(a.delta, 5.5);
  assert.equal(a.best, 28);
  assert.equal(a.accuracy, Math.round((55 / 73) * 100));
  assert.equal(a.leak, "wrong");
});

test("no data -> honest empty sentence", () => {
  assert.equal(subjectAnalysis([], "turkce").count, 0);
  assert.match(subjectAnalysisSentence({ count: 0 }), /henüz/);
});
