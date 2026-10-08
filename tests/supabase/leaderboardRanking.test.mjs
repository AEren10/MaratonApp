import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migrationPath = "supabase/migrations/20261008213000_cdx_consistent_leaderboard_ranking.sql";

test("all leaderboard surfaces rank effort by questions, minutes, trials, then stable id", () => {
  const sql = readFileSync(migrationPath, "utf8").replace(/\s+/g, " ");

  assert.match(sql, /ADD COLUMN IF NOT EXISTS weekly_minutes BIGINT NOT NULL DEFAULT 0/i);
  assert.match(sql, /CREATE OR REPLACE FUNCTION private\.rebuild_leaderboard_weekly_entry/i);
  assert.match(sql, /COALESCE\(SUM\(s\.duration_minutes\), 0\)::BIGINT/i);

  const canonicalOrders = sql.match(
    /ORDER BY (?:lw\.)?questions DESC, (?:lw\.)?weekly_minutes DESC, (?:lw\.)?trials DESC, (?:lw\.)?user_id/g,
  ) || [];
  const groupOrders = sql.match(
    /ORDER BY weekly_questions DESC, weekly_minutes DESC, trials DESC, user_id/g,
  ) || [];

  assert.equal(canonicalOrders.length, 2, "global and friends RPCs must share the canonical order");
  assert.ok(groupOrders.length >= 3, "group detail, leaderboard and summaries must share the canonical order");
  assert.doesNotMatch(sql, /ORDER BY (?:lw\.)?weekly_xp DESC/i);
});

test("weekly ranking uses the Istanbul week only and keeps private rebuild locked", () => {
  const sql = readFileSync(migrationPath, "utf8").replace(/\s+/g, " ");

  assert.match(sql, /s\.study_date >= v_week_start AND s\.study_date < v_week_start \+ 7/i);
  assert.match(sql, /t\.trial_date >= v_week_start AND t\.trial_date < v_week_start \+ 7/i);
  assert.match(sql, /x\.created_at >= v_week_start_at AND x\.created_at < v_week_start_at \+ interval '7 days'/i);
  assert.match(
    sql,
    /REVOKE ALL ON FUNCTION private\.rebuild_leaderboard_weekly_entry\(UUID\) FROM PUBLIC, anon, authenticated/i,
  );
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.get_global_leaderboard\(INTEGER\) TO authenticated/i);
  assert.match(sql, /GRANT EXECUTE ON FUNCTION public\.get_friends_leaderboard\(\) TO authenticated/i);
});

test("group RPCs use the safe leaderboard projection instead of viewer-scoped study-log reads", () => {
  const sql = readFileSync(migrationPath, "utf8").replace(/\s+/g, " ");
  const groupFunctions = sql.slice(sql.indexOf("DROP FUNCTION IF EXISTS public.get_group_detail"));

  assert.doesNotMatch(groupFunctions, /FOR profile_row|PERFORM private\.rebuild_leaderboard_weekly_entry/i);
  assert.doesNotMatch(groupFunctions, /JOIN public\.study_logs|LEFT JOIN public\.study_logs/i);
  assert.ok(
    (groupFunctions.match(/JOIN public\.leaderboard_weekly lw ON lw\.user_id = gm\.user_id/g) || []).length >= 3,
    "all group ranking surfaces must read the same safe weekly projection",
  );
  assert.match(sql, /WHERE COALESCE\(p\.show_in_leaderboard, true\) = true/i);
});
