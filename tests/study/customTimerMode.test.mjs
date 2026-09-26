import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";
import {
  STUDY_TIMER_PHASE,
  getPhaseTargetSeconds,
  formatTimerDuration,
  getFocusSecondsForSave,
} from "../../src/domain/study/studyTimerModel.js";

const storageKeysSrc = readFileSync(new URL("../../src/constants/storageKeys.js", import.meta.url), "utf8");

test("STORAGE_KEYS contains CUSTOM_TIMER_CONFIG", () => {
  assert.match(storageKeysSrc, /CUSTOM_TIMER_CONFIG:\s*"@maraton:custom_timer_config"/);
});

test("Custom timer mode computes phase target seconds accurately", () => {
  const customMode = {
    key: "CUSTOM",
    focus: 35,
    break: 7,
    longBreak: 14,
    cycles: 4,
  };

  const focusSec = getPhaseTargetSeconds({ mode: customMode, modeKey: "CUSTOM", phase: STUDY_TIMER_PHASE.FOCUS });
  assert.equal(focusSec, 35 * 60);

  const breakSec = getPhaseTargetSeconds({ mode: customMode, modeKey: "CUSTOM", phase: STUDY_TIMER_PHASE.BREAK });
  assert.equal(breakSec, 7 * 60);

  const longBreakSec = getPhaseTargetSeconds({ mode: customMode, modeKey: "CUSTOM", phase: STUDY_TIMER_PHASE.LONG_BREAK });
  assert.equal(longBreakSec, 14 * 60);
});

test("Custom timer duration formats cleanly", () => {
  assert.equal(formatTimerDuration(35 * 60), "35:00");
  assert.equal(formatTimerDuration(7 * 60), "07:00");
  assert.equal(formatTimerDuration(90 * 60), "1:30:00");
});

test("Custom timer save payload calculates total focus seconds", () => {
  const savedSec = getFocusSecondsForSave({
    elapsed: 2100,
    isPomodoro: true,
    phase: STUDY_TIMER_PHASE.FOCUS,
    totalFocusSeconds: 0,
  });
  assert.equal(savedSec, 2100);
});
