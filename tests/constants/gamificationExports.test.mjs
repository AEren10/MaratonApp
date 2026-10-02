import test from "node:test";
import assert from "node:assert/strict";
import { LEVELS, XP_REWARDS, XP_VISIBLE } from "../../src/constants/gamification.js";

test("gamification constants keep XP tables next to the visibility flag", () => {
  assert.ok(Array.isArray(LEVELS) && LEVELS.length >= 20);
  assert.equal(typeof XP_REWARDS.study_15min, "number");
  assert.equal(XP_VISIBLE, false);
});
