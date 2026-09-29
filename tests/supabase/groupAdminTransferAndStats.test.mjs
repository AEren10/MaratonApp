import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260929005620_cdx_group_admin_transfer_and_stats_totals.sql",
  "utf8",
);
const groupsApi = readFileSync("src/supabase/groups.js", "utf8");
const groupActions = readFileSync("src/hooks/useGroupActions.js", "utf8");
const statsApi = readFileSync("src/supabase/stats.js", "utf8");
const statsHook = readFileSync("src/hooks/useStatsOverview.js", "utf8");

test("group admin transfer is a locked authenticated RPC", () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.transfer_group_admin/);
  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /SET search_path TO 'public', 'pg_temp'/);
  assert.match(migration, /uid UUID := \(SELECT auth\.uid\(\)\)/);
  assert.match(migration, /caller_role <> 'admin'/);
  assert.match(migration, /new_admin_not_member/);
  assert.match(migration, /SET role = CASE[\s\S]*WHEN user_id = uid THEN 'member'[\s\S]*WHEN user_id = p_new_admin THEN 'admin'/);
  assert.match(migration, /SET created_by = p_new_admin,\s*owner_id = p_new_admin/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.transfer_group_admin\(UUID, UUID\) FROM PUBLIC, anon/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.transfer_group_admin\(UUID, UUID\) TO authenticated/);
});

test("client exposes group admin transfer without direct table writes", () => {
  assert.match(groupsApi, /export async function transferGroupAdmin\(groupId, newAdminId\)/);
  assert.match(groupsApi, /rpc\("transfer_group_admin"/);
  assert.match(groupActions, /transferAdmin/);
  assert.doesNotMatch(groupsApi, /from\("group_members"\)\.update/);
});

test("study totals RPC returns real aggregates and active-exam scoped trials", () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION public\.get_study_totals/);
  assert.match(migration, /FROM public\.study_logs/);
  assert.match(migration, /count\(DISTINCT study_date\)::BIGINT AS active_days/);
  assert.match(migration, /generate_series\(/);
  assert.match(migration, /normalized_exam = 'dil'[\s\S]*upper\(t\.exam_type\) IN \('TYT', 'YDT'\)/);
  assert.match(migration, /normalized_exam = 'tyt_ayt'[\s\S]*normalized_field = 'sayisal' AND upper\(t\.exam_type\) = 'AYT_SAY'/);
  assert.match(migration, /'bestNetByType'/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.get_study_totals\(TEXT, TEXT\) FROM PUBLIC, anon/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.get_study_totals\(TEXT, TEXT\) TO authenticated/);
});

test("stats hook uses the server totals RPC and pure domain overview", () => {
  assert.match(statsApi, /rpc\("get_study_totals"/);
  assert.match(statsHook, /getStudyTotals/);
  assert.match(statsHook, /statsOverview/);
});
