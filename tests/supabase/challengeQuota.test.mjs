import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/supabase/challenges.js", import.meta.url), "utf8");
const screen = readFileSync(new URL("../../src/screens/social/ChallengeScreen.js", import.meta.url), "utf8");
const hardeningMigration = readFileSync(
  new URL("../../supabase/migrations/20260908140000_harden_challenges_groups_xp.sql", import.meta.url),
  "utf8",
);
const createChallengeMigration = readFileSync(
  new URL("../../supabase/migrations/20260913215823_cdx_create_challenge_rpc.sql", import.meta.url),
  "utf8",
);
const initialChallengeMigration = readFileSync(
  new URL("../../supabase/migrations_archived_not_in_live_ledger/006_friends_challenges.sql", import.meta.url),
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

test("challenge creation goes through the server-authoritative RPC", () => {
  assert.match(source, /supabase\.rpc\("create_challenge"/);
  assert.match(source, /if \(!data\?\.ok\) throw new Error\(data\?\.reason \|\| "Challenge oluşturulamadı"\)/);
  assert.doesNotMatch(source, /\.from\("challenges"\)\s+\.insert\(/);
  assert.match(createChallengeMigration, /CREATE OR REPLACE FUNCTION private\.create_challenge/);
  assert.match(createChallengeMigration, /SECURITY DEFINER\s+SET search_path = ''/);
  assert.match(createChallengeMigration, /ALTER FUNCTION private\.create_challenge\(UUID, TEXT, INTEGER, INTEGER\)\s+SET search_path = ''/);
  assert.match(createChallengeMigration, /f\.status = 'accepted'/);
  assert.match(createChallengeMigration, /status IN \('pending', 'active'\)/);
  assert.match(createChallengeMigration, /REVOKE INSERT, DELETE ON public\.challenges FROM authenticated/);
  assert.match(createChallengeMigration, /DROP POLICY IF EXISTS "Users create challenges" ON public\.challenges/);
});
