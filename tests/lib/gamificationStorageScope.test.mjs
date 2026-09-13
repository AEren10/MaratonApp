import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const gamificationSlice = readFileSync(
  new URL("../../src/store/slices/gamificationSlice.js", import.meta.url),
  "utf8",
);
const hydrator = readFileSync(new URL("../../src/store/hydrate.js", import.meta.url), "utf8");
const dataSync = readFileSync(new URL("../../src/hooks/useDataSync.js", import.meta.url), "utf8");
const useGamification = readFileSync(new URL("../../src/hooks/useGamification.js", import.meta.url), "utf8");
const streakMilestones = readFileSync(new URL("../../src/lib/streakMilestones.js", import.meta.url), "utf8");

test("gamification local cache is scoped to the active user", () => {
  assert.match(gamificationSlice, /import \{ STORAGE_KEYS, userScopedKey \} from "\.\.\/\.\.\/constants\/storageKeys"/);
  assert.match(gamificationSlice, /saveGamificationToStorage\(state, userId = null\)/);
  assert.match(gamificationSlice, /setJson\(userScopedKey\(STORAGE_KEY, userId\)/);
  assert.match(gamificationSlice, /loadGamificationFromStorage\(dispatch, userId = null\)/);
  assert.match(gamificationSlice, /getJson\(userScopedKey\(STORAGE_KEY, userId\), \{\}\)/);
  assert.match(hydrator, /loadGamificationFromStorage\(guard, userId\)/);
  assert.match(dataSync, /loadGamificationFromStorage\(dispatch, userId\)/);
  assert.match(useGamification, /saveGamificationToStorage\(state, user\?\.id\)/);
});

test("streak milestone local claims are scoped before premium-day rewards are requested", () => {
  assert.match(streakMilestones, /import \{ STORAGE_KEYS, userScopedKey \} from "\.\.\/constants\/storageKeys"/);
  assert.match(streakMilestones, /getClaimedMilestones\(userId = null\)/);
  assert.match(streakMilestones, /getJson\(userScopedKey\(STORAGE_KEYS\.CLAIMED_MILESTONES, userId\), \[\]\)/);
  assert.match(streakMilestones, /claimMilestone\(day, userId = null\)/);
  assert.match(streakMilestones, /setJson\(userScopedKey\(STORAGE_KEYS\.CLAIMED_MILESTONES, userId\), claimed\)/);
  assert.match(useGamification, /claimMilestone\(milestone\.day, user\?\.id\)/);
});
