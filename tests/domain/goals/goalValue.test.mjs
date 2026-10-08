import test from "node:test";
import assert from "node:assert/strict";

import { normalizeGoalValue } from "../../../src/domain/goals/goalValue.js";

test("elle girilen hedef degeri adima yuvarlanip sinirlarda tutulur", () => {
  assert.equal(normalizeGoalValue("58", 20, 120, 1, 50), 58);
  assert.equal(normalizeGoalValue("999", 20, 120, 1, 50), 120);
  assert.equal(normalizeGoalValue("34", 20, 500, 10, 80), 30);
});

test("bos veya gecersiz giris mevcut degeri korur", () => {
  assert.equal(normalizeGoalValue("", 20, 120, 1, 58), 58);
  assert.equal(normalizeGoalValue("abc", 20, 120, 1, 58), 58);
});
