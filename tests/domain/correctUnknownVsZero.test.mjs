import test from "node:test";
import assert from "node:assert/strict";
import { effectiveAccuracy, knownAccuracy } from "../../src/domain/route/effectiveAccuracy.js";
import { toStudyLogRow, normalizeStudyLog } from "../../src/domain/study/studyLogModel.js";

test("measured zero is 0%, not unknown (no volume mastery)", () => {
  assert.equal(knownAccuracy({ q: 50, correct: 0, graded: 50 }), 0);
  assert.deepEqual(effectiveAccuracy({ q: 50, correct: 0, graded: 50 }), { acc: 0, known: true });
});

test("not entered stays unknown; old rows without graded keep old meaning", () => {
  assert.equal(knownAccuracy({ q: 50, correct: 0, graded: 0 }), null);
  assert.equal(effectiveAccuracy({ q: 50, correct: 0, graded: 0 }).known, false);
  assert.equal(knownAccuracy({ q: 40, correct: 30, graded: 0 }), 75);
});

test("study log rows keep null correct (not entered) apart from 0", () => {
  assert.equal(toStudyLogRow({ correct_count: null }).correct_count, null);
  assert.equal(toStudyLogRow({ correct_count: 0 }).correct_count, 0);
  assert.equal(normalizeStudyLog({ correct_count: null }).correctKnown, false);
  assert.equal(normalizeStudyLog({ correct_count: 0 }).correctKnown, true);
});
