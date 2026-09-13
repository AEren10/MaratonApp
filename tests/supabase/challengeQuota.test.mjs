import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/supabase/challenges.js", import.meta.url), "utf8");

test("free challenge quota counts pending invites as occupied slots", () => {
  assert.match(source, /export async function getActiveChallengeCount/);
  assert.match(source, /\.in\("status", \["active", "pending"\]\)/);
  assert.doesNotMatch(source, /\.eq\("status", "active"\)/);
});
