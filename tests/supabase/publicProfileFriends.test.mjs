import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20261003180000_cdx_public_profiles_friend_notifications.sql",
  "utf8",
);
const sqlTest = readFileSync("supabase/tests/public_profile_rpc.sql", "utf8");
const friendsApi = readFileSync("src/supabase/friends.js", "utf8");
const publicApi = readFileSync("src/supabase/publicProfiles.js", "utf8");
const edge = readFileSync("supabase/functions/friend-actions/index.ts", "utf8");

test("public profile RPC is fixed-field, access checked, and net-free", () => {
  assert.match(migration, /FUNCTION public\.get_public_profile\(p_user uuid\)/);
  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /SET search_path = ''/);
  assert.match(migration, /show_in_leaderboard IS TRUE/);
  assert.match(migration, /public_profile_visibility = 'friends_only'/);
  assert.match(migration, /FROM public\.group_members mine/);
  assert.match(migration, /f\.status = 'blocked'/);
  assert.doesNotMatch(migration.slice(0, migration.indexOf("send_friend_request_server")), /total_net|target_net|baseline_net|public\.trials/);
  assert.match(publicApi, /rpc\("get_public_profile", \{ p_user: userId \}\)/);
});

test("friend mutations are server authoritative and direct client writes are revoked", () => {
  assert.match(migration, /REVOKE INSERT, UPDATE ON public\.friendships FROM authenticated/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.send_friend_request_server\(uuid, uuid\) TO service_role/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.respond_friend_request_server\(uuid, uuid, boolean\) TO service_role/);
  assert.match(friendsApi, /functions\.invoke\("friend-actions"/);
  assert.doesNotMatch(friendsApi, /\.from\("friendships"\)[\s\S]{0,160}\.(insert|update)\(/);
  assert.match(friendsApi, /rpc\("block_user"/);
});

test("friend notification templates and recipients cannot be supplied by clients", () => {
  assert.match(edge, /auth\.getUser\(token\)/);
  assert.match(edge, /SUPABASE_SERVICE_ROLE_KEY/);
  assert.match(edge, /maraton:\/\/friend/);
  assert.match(edge, /seni arkadaş olarak eklemek istiyor/);
  assert.match(edge, /isteğini kabul etti/);
  assert.doesNotMatch(edge, /payload\.(title|body|recipient|recipient_id|actor_name)/);
  assert.match(migration, />= 20/);
});

test("rollback SQL test covers profile privacy boundaries", () => {
  assert.match(sqlTest, /^BEGIN;/m);
  assert.match(sqlTest, /^ROLLBACK;/m);
  assert.match(sqlTest, /friends_only profile was visible/);
  assert.match(sqlTest, /blocked profile was visible/);
  assert.match(sqlTest, /leaderboard-hidden profile was visible/);
  assert.match(sqlTest, /unrelated profile was visible/);
  assert.match(sqlTest, /anonymous profile access succeeded/);
  assert.match(sqlTest, /public profile leaked private exam data/);
});
