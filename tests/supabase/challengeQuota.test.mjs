import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/supabase/challenges.js", import.meta.url), "utf8");
const screen = readFileSync(new URL("../../src/screens/social/ChallengeScreen.js", import.meta.url), "utf8");

test("free challenge quota counts pending invites as occupied slots", () => {
  assert.match(source, /export async function getActiveChallengeCount/);
  assert.match(source, /\.in\("status", \["active", "pending"\]\)/);
  assert.doesNotMatch(source, /\.eq\("status", "active"\)/);
});

test("challenge creation callback tracks current premium gate functions", () => {
  assert.match(screen, /if \(!checkFeature\("unlimited_challenges"\)\) \{/);
  assert.match(screen, /\}, \[pick, checkFeature, showPaywall, bumpUsage, load\]\);/);
});
