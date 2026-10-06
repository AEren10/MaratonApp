import assert from "node:assert/strict";
import test from "node:test";

import { SCREENS } from "../../src/constants/screens.js";
import { setupStartScreen } from "../../src/domain/onboarding/setupStartScreen.js";

test("hedefini girip uygulamayi kapatan kullanici Seviye'den devam eder", () => {
  assert.equal(setupStartScreen({
    examType: "tyt_ayt",
    dailyGoalSet: true,
    levelTestDone: false,
    setupCompleted: false,
  }), SCREENS.LEVEL_TEST);
});

test("kurulumun diger devam noktalari korunur", () => {
  assert.equal(setupStartScreen({}), SCREENS.EXAM_SETUP);
  assert.equal(setupStartScreen({ fromPreview: true }), SCREENS.GOAL_SETUP);
  assert.equal(setupStartScreen({ examType: "tyt_ayt" }), SCREENS.SETUP_INCOMPLETE);
  assert.equal(setupStartScreen({ examType: "tyt_ayt", dailyGoalSet: true, levelTestDone: true }), SCREENS.ROUTE_READY);
});
