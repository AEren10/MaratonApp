import test from "node:test";
import assert from "node:assert/strict";

import { effectiveStreak, streakStatus } from "../../src/domain/streak/effectiveStreak.js";

const today = "2026-10-01";

test("bugun ya da dun calistiysa seri surer", () => {
  assert.deepEqual(streakStatus({ current: 5, lastStudyDate: "2026-10-01" }, today), { value: 5, state: "done_today" });
  assert.deepEqual(streakStatus({ current: 5, lastStudyDate: "2026-09-30" }, today), { value: 5, state: "at_risk" });
});

test("bir gun atlandiysa joker varken kurtarilabilir, yoksa biter", () => {
  assert.equal(streakStatus({ current: 5, lastStudyDate: "2026-09-29", freezeCount: 1 }, today).state, "freeze_saves");
  assert.equal(effectiveStreak({ current: 5, lastStudyDate: "2026-09-29", freezeCount: 0 }, today), 0);
});

test("eski seri sifir gosterilir (sunucudaki bayat sayi degil)", () => {
  assert.equal(effectiveStreak({ current: 12, lastStudyDate: "2026-09-20", freezeCount: 1 }, today), 0);
  assert.equal(effectiveStreak({ current: 0, lastStudyDate: null }, today), 0);
});
