import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260924155346_cdx_release_data_layer_tables_and_private_grants.sql", import.meta.url),
  "utf8",
);

test("release data-layer migration creates client-used owned tables with RLS", () => {
  for (const table of ["exam_results", "weekly_class_schedule", "notifications"]) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}`));
    assert.match(migration, new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`));
    assert.match(migration, new RegExp(`REVOKE ALL ON public\\.${table} FROM PUBLIC, anon, authenticated`));
    assert.match(migration, new RegExp(`GRANT SELECT, INSERT, UPDATE, DELETE ON public\\.${table} TO authenticated`));
  }
});

test("release data-layer migration scopes new table policies by auth uid", () => {
  assert.match(migration, /CREATE POLICY "exam_results select own"[\s\S]*USING \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /CREATE POLICY "weekly_class_schedule update own"[\s\S]*WITH CHECK \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /CREATE POLICY "notifications update own"[\s\S]*WITH CHECK \(\(select auth\.uid\(\)\) = user_id\)/);
});

test("release data-layer migration removes public execute from private helpers", () => {
  assert.match(migration, /REVOKE ALL ON FUNCTION private\.award_xp\(text, integer\) FROM PUBLIC, anon/);
  assert.match(migration, /SECURITY INVOKER wrappers that call the private helpers/);
  assert.match(migration, /private schema is not an exposed Data\s+-- API schema/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION private\.award_xp\(text, integer\) TO authenticated/);
  assert.match(migration, /REVOKE ALL ON FUNCTION private\.touch_streak\(date\) FROM PUBLIC, anon/);
  assert.match(migration, /REVOKE ALL ON FUNCTION private\.find_user_by_friend_code\(text\) FROM PUBLIC, anon/);
});
