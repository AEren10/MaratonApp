import test from "node:test";
import assert from "node:assert/strict";
import { discoverTipEligible, shareReady } from "../../src/domain/home/discoverTiming.js";

const now = Date.parse("2026-10-20T10:00:00Z");

test("share needs at least three study days in a row", () => {
  assert.equal(shareReady({ streak: 1, longestStreak: 2 }), false);
  assert.equal(shareReady({ streak: 0, longestStreak: 3 }), true);
});

test("widget/story tip waits for day 7 and real progress", () => {
  assert.equal(discoverTipEligible({ longestStreak: 5, createdAt: "2026-10-18T10:00:00Z", now }), false);
  assert.equal(discoverTipEligible({ longestStreak: 2, createdAt: "2026-10-01T10:00:00Z", now }), false);
  assert.equal(discoverTipEligible({ longestStreak: 3, createdAt: "2026-10-01T10:00:00Z", now }), true);
  assert.equal(discoverTipEligible({ longestStreak: 9, createdAt: null, now }), false);
});
