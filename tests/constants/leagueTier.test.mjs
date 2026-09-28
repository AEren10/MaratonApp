import test from "node:test";
import assert from "node:assert/strict";

import { getTier, getNextTier } from "../../src/constants/league.js";

test("getTier at 0 XP returns bronz", () => {
  const tier = getTier(0);
  assert.equal(tier.key, "bronz");
});

test("getNextTier at 0 XP returns gumus instead of null", () => {
  const next = getNextTier(0);
  assert.ok(next, "0 XP'de sonraki lig bulunabilmeli");
  assert.equal(next.key, "gumus");
  assert.equal(next.minXP, 150);
});

test("getNextTier at top tier (obsidyen) returns null", () => {
  const next = getNextTier(2000);
  assert.equal(next, null);
});
