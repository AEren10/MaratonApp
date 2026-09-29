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

test("same-day trials maintain correct chronological order and positive delta when net increased", () => {
  // Redux trials array is newest-first: index 0 is the newest trial (28.75 net), index 1 is older trial (23.75 net)
  const newerTrial = {
    date: "2026-09-29",
    trialType: "TYT",
    created_at: "2026-09-29T14:00:00Z",
    subjects: { ingilizce: { correct: 30, wrong: 5, empty: 5, net: 28.75 } },
  };
  const olderTrial = {
    date: "2026-09-29",
    trialType: "TYT",
    created_at: "2026-09-29T10:00:00Z",
    subjects: { ingilizce: { correct: 25, wrong: 5, empty: 10, net: 23.75 } },
  };

  const a = subjectAnalysis([newerTrial, olderTrial], "ingilizce");
  assert.equal(a.count, 2);
  assert.equal(a.last, 28.8);
  assert.equal(a.delta, 5); // 28.8 - 23.8 = +5.0 (positive improvement)
  assert.match(subjectAnalysisSentence(a), /Son denemede yükseldi/);
  // Chart points must have strictly increasing timestamps to prevent vertical collapse
  assert.equal(a.points.length, 2);
  assert.ok(a.points[1].t > a.points[0].t);
});

test("same-day trials without created_at maintain order via Redux array index", () => {
  // If created_at is absent, index 0 is newest, index 1 is older
  const newerTrial = {
    date: "2026-09-29",
    trialType: "TYT",
    subjects: { ingilizce: { correct: 30, wrong: 5, empty: 5, net: 28.75 } },
  };
  const olderTrial = {
    date: "2026-09-29",
    trialType: "TYT",
    subjects: { ingilizce: { correct: 25, wrong: 5, empty: 10, net: 23.75 } },
  };

  const a = subjectAnalysis([newerTrial, olderTrial], "ingilizce");
  assert.equal(a.count, 2);
  assert.equal(a.last, 28.8);
  assert.equal(a.delta, 5);
  assert.ok(a.points[1].t > a.points[0].t);
});
