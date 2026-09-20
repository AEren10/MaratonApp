import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync("supabase/migrations/20260919120000_cdx_group_data_layer.sql", "utf8");
const previewMigration = readFileSync("supabase/migrations/20260920002000_cdx_group_preview_by_code.sql", "utf8");
const previewCreatorMigration = readFileSync("supabase/migrations/20260920002201_cdx_group_preview_creator_name.sql", "utf8");
const userRankMigration = readFileSync("supabase/migrations/20260920010000_clde_my_groups_user_rank.sql", "utf8");
const groupsApi = readFileSync("src/supabase/groups.js", "utf8");
const groupsTab = readFileSync("src/screens/league/GroupsTab.js", "utf8");
const groupsHook = readFileSync("src/hooks/useGroups.js", "utf8");
const groupDetailHook = readFileSync("src/hooks/useGroupDetail.js", "utf8");
const groupActionsHook = readFileSync("src/hooks/useGroupActions.js", "utf8");

test("group migration adds UI contract fields without dropping legacy owner_id", () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS description TEXT/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS weekly_target INTEGER/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS created_by UUID/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS role TEXT/);
  assert.match(migration, /owner_id/);
});

test("group RLS is membership scoped and update is admin-only", () => {
  assert.match(migration, /CREATE POLICY "groups select member"[\s\S]*?USING \(private\.is_group_member\(id\)\)/);
  assert.match(migration, /CREATE POLICY "groups update admin"[\s\S]*?USING \(private\.is_group_admin\(id\)\)/);
  assert.match(migration, /GRANT UPDATE \(name, description, weekly_target\) ON public\.groups TO authenticated/);
  assert.doesNotMatch(migration, /GRANT SELECT, INSERT, UPDATE, DELETE ON public\.groups TO authenticated/);
  assert.match(migration, /REVOKE ALL ON public\.group_members FROM PUBLIC, anon, authenticated/);
  assert.match(migration, /GRANT SELECT, DELETE ON public\.group_members TO authenticated/);
});

test("private group security definer functions are not executable by PUBLIC or anon", () => {
  for (const fn of [
    "create_group\\(TEXT, TEXT, INTEGER\\)",
    "join_group_by_code\\(TEXT\\)",
    "leave_group\\(UUID\\)",
    "remove_group_member\\(UUID, UUID\\)",
    "regenerate_group_code\\(UUID\\)",
    "update_group_settings\\(UUID, TEXT, TEXT, INTEGER\\)",
    "is_group_member\\(UUID\\)",
    "is_group_admin\\(UUID\\)",
  ]) {
    assert.match(migration, new RegExp(`REVOKE ALL ON FUNCTION private\\.${fn} FROM PUBLIC, anon, authenticated`));
  }
  assert.match(
    previewMigration,
    /REVOKE ALL ON FUNCTION private\.preview_group_by_code\(TEXT\) FROM PUBLIC, anon, authenticated/,
  );
  assert.match(
    previewMigration,
    /REVOKE ALL ON FUNCTION public\.preview_group_by_code\(TEXT\) FROM PUBLIC, anon/,
  );
});

test("group leaderboard ranks by weekly questions instead of xp", () => {
  assert.match(migration, /row_number\(\) OVER \(ORDER BY weekly_questions DESC/);
  assert.doesNotMatch(migration, /get_group_leaderboard[\s\S]*?ORDER BY lw\.weekly_xp DESC/);
});

test("group API surfaces errors instead of silent empty states", () => {
  assert.match(groupsApi, /throw error/);
  assert.match(groupsApi, /ensureOk/);
  assert.doesNotMatch(groupsApi, /catch\s*\(\s*\)\s*=>\s*\{\s*\}/);
  assert.match(groupsTab, /setBoardError/);
  assert.match(groupsTab, /Sıralama yüklenemedi/);
  assert.doesNotMatch(groupsTab, /catch\s*\(\s*\)\s*=>\s*setBoard\(\{ list: \[\] \}\)/);
});

test("group code preview is limited and does not bypass member-scoped group reads", () => {
  assert.match(previewMigration, /CREATE OR REPLACE FUNCTION private\.preview_group_by_code\(group_code TEXT\)/);
  assert.match(previewMigration, /IF \(SELECT auth\.uid\(\)\) IS NULL/);
  assert.match(previewMigration, /SELECT id, name, code, weekly_target/);
  assert.match(previewMigration, /'member_count', member_total/);
  assert.doesNotMatch(previewMigration, /description|created_by|owner_id|avatar_url|joined_at|role/);
  assert.match(previewCreatorMigration, /'creator_name', COALESCE\(creator_name, 'Öğrenci'\)/);
  assert.doesNotMatch(previewCreatorMigration, /'created_by'|'owner_id'|'description'|'avatar_url'|'joined_at'|'role'/);
  assert.match(groupsApi, /export async function previewGroupByCode\(code\)/);
  assert.match(groupsApi, /creatorName/);
  assert.match(groupsApi, /preview_group_by_code/);
  assert.match(groupsApi, /JOIN_THROTTLE\.check\(\)/);
});

test("group hooks keep the Antigravity UI contract while using Supabase data", () => {
  assert.match(groupsHook, /refresh: \(\) => load\(\{ refresh: true \}\)/);
  assert.match(groupDetailHook, /leaderboard: members/);
  assert.match(groupDetailHook, /setLeaderboard: setMembers/);
  for (const name of [
    "createGroup",
    "previewGroupByCode",
    "joinGroupByCode",
    "leaveGroup",
    "regenerateGroupCode",
    "updateGroupName",
    "deleteGroup",
  ]) {
    assert.match(groupActionsHook, new RegExp(`${name}(:|,)`));
  }
});

test("get_my_groups produces user_rank with the leaderboard's own ordering", () => {
  // Kart "3. siradasin" derken tablo 4. gosterirse hangisinin dogru oldugunu
  // kimse bilemez. Iki siralama kurali ayni kalmali.
  assert.match(userRankMigration, /user_rank BIGINT/);
  assert.match(userRankMigration, /PARTITION BY group_id[\s\S]*?ORDER BY weekly_questions DESC, trials DESC, user_id/);
  assert.match(migration, /ORDER BY weekly_questions DESC, trials DESC, user_id/);
});

test("recreating get_my_groups restores the grants the drop removed", () => {
  // DROP FUNCTION yetkileri de dusurur; verilmezse authenticated cagiramaz.
  assert.match(userRankMigration, /DROP FUNCTION IF EXISTS public\.get_my_groups\(\)/);
  assert.match(userRankMigration, /REVOKE ALL ON FUNCTION public\.get_my_groups\(\) FROM PUBLIC, anon/);
  assert.match(userRankMigration, /GRANT EXECUTE ON FUNCTION public\.get_my_groups\(\) TO authenticated/);
});

test("the groups client carries user_rank through to the card", () => {
  assert.match(groupsApi, /user_rank: Number\(row\.user_rank \?\? row\.userRank\) \|\| null/);
  assert.match(groupsApi, /userRank: Number\(row\.user_rank \?\? row\.userRank\) \|\| null/);
});

test("generate_group_code uses built-in random without pgcrypto dependency", () => {
  const fixMigration = readFileSync("supabase/migrations/20260920050000_fix_generate_group_code_builtin_random.sql", "utf8");
  assert.doesNotMatch(fixMigration, /gen_random_bytes\(\d+\)/);
  assert.match(fixMigration, /floor\(random\(\) \* length\(alphabet\) \+ 1\)::INTEGER/);
  assert.match(fixMigration, /REVOKE ALL ON FUNCTION private\.generate_group_code\(\) FROM PUBLIC, anon, authenticated;/);
  assert.doesNotMatch(migration, /gen_random_bytes\(\d+\)/);
  assert.match(migration, /floor\(random\(\) \* length\(alphabet\) \+ 1\)::INTEGER/);
});
