import test from "node:test";
import assert from "node:assert/strict";

import { findSubjectOverflow } from "../../../src/validations/trialScoreOverflow.js";

const MAT = [{ key: "tyt_matematik", name: "Matematik", max: 40 }];

test("no overflow when counts fit the question count", () => {
  assert.equal(findSubjectOverflow(MAT, { tyt_matematik: { correct: "28", wrong: "8" } }), null);
});

test("design case: 28 + 16 + 4 blank on 40 blames wrong by 8", () => {
  const result = findSubjectOverflow(MAT, { tyt_matematik: { correct: "28", wrong: "16", empty: "4" } });
  assert.equal(result.total, 48);
  assert.equal(result.excess, 8);
  assert.equal(result.field, "wrong");
  assert.equal(result.fixedValue, 8);
});

test("auto blank never adds to overflow; wrong carries the excess", () => {
  const result = findSubjectOverflow(MAT, { tyt_matematik: { correct: "28", wrong: "20" } });
  assert.equal(result.total, 48);
  assert.equal(result.empty, 0);
  assert.equal(result.field, "wrong");
  assert.equal(result.fixedValue, 12);
});

test("manual blank that covers the excess is blamed first", () => {
  const result = findSubjectOverflow(MAT, { tyt_matematik: { correct: "30", wrong: "6", empty: "10" } });
  assert.equal(result.field, "empty");
  assert.equal(result.fixedValue, 4);
});

test("correct is blamed when wrong cannot absorb the excess", () => {
  const result = findSubjectOverflow(MAT, { tyt_matematik: { correct: "40", wrong: "3", empty: "1" } });
  assert.equal(result.excess, 4);
  assert.equal(result.field, "correct");
  assert.equal(result.fixedValue, 36);
});
