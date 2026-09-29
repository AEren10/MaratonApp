import test from "node:test";
import assert from "node:assert/strict";

import { depthToneFor } from "../../src/lib/depthTone.js";

test("hedef tuttuysa yesil, sinav yakinsa sicak, degilse notr", () => {
  assert.equal(depthToneFor({ solvedToday: 80, dailyGoal: 80, daysUntilExam: 10 }), "up");
  assert.equal(depthToneFor({ solvedToday: 20, dailyGoal: 80, daysUntilExam: 10 }), "warn");
  assert.equal(depthToneFor({ solvedToday: 20, dailyGoal: 80, daysUntilExam: 259 }), null);
  assert.equal(depthToneFor({ solvedToday: 0, dailyGoal: 0, daysUntilExam: null }), null);
});
