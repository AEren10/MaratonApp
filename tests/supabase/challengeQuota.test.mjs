import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/supabase/challenges.js", import.meta.url), "utf8");
const screen = readFileSync(new URL("../../src/screens/social/ChallengeScreen.js", import.meta.url), "utf8");
const hardeningMigration = readFileSync(
  new URL("../../supabase/migrations/20260908140000_harden_challenges_groups_xp.sql", import.meta.url),
  "utf8",
);
const initialChallengeMigration = readFileSync(
  new URL("../../supabase/migrations/006_friends_challenges.sql", import.meta.url),
  "utf8",
);

test("free challenge quota counts pending invites as occupied slots", () => {
  assert.match(source, /export async function getActiveChallengeCount/);
  assert.match(source, /\.in\("status", \["active", "pending"\]\)/);
  assert.doesNotMatch(source, /\.eq\("status", "active"\)/);
});

test("challenge creation callback tracks current premium gate functions", () => {
  assert.match(screen, /if \(!checkFeature\("unlimited_challenges"\)\) \{/);
  assert.match(screen, /\}, \[pick, checkFeature, showPaywall, bumpUsage, load\]\);/);
});

test("challenge decline writes a status allowed by the challenges check constraint", () => {
  assert.match(
    initialChallengeMigration,
    /status TEXT NOT NULL DEFAULT 'active' CHECK \(status IN \('pending', 'active', 'completed', 'cancelled'\)\)/,
  );
  assert.match(hardeningMigration, /SET status = CASE WHEN p_accept THEN 'active' ELSE 'cancelled' END/);
  assert.doesNotMatch(hardeningMigration, /ELSE 'declined' END[\s\S]*WHERE id = p_id AND opponent_id = uid/);
});

test("challenge action callbacks tolerate an empty auth user during session transitions", () => {
  assert.match(screen, /if \(!user\?\.id\) return;\s+try \{ await cancelChallenge\(id, user\.id\);/);
  assert.match(screen, /if \(!user\?\.id\) return;\s+try \{\s+await respondToChallenge\(id, accept, user\.id\);/);
  assert.match(screen, /\}, \[load, showAlert, user\?\.id\]\);/);
});

test("challenge creation requires an accepted friendship before insert", () => {
  assert.match(source, /\.from\("friendships"\)[\s\S]*?\.select\("id, status"\)/);
  assert.match(source, /if \(friendship\?\.status === "blocked"\) throw new Error\("Bu kullanıcıyla etkileşim kurulamaz"\);/);
  assert.match(source, /if \(friendship\?\.status !== "accepted"\) throw new Error\("Challenge için önce arkadaş olmalısınız"\);/);
  assert.match(source, /\.from\("challenges"\)\s+\.insert\(/);
});
