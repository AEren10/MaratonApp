import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const plans = readFileSync(new URL("../../src/supabase/plans.js", import.meta.url), "utf8");
const migration = readFileSync(
  new URL("../../supabase/migrations/20260911142337_cdx_data_integrity_fixes.sql", import.meta.url),
  "utf8",
);

test("plan task writes include and check user ownership", () => {
  assert.match(plans, /user_id: plan\.user_id/);
  assert.match(plans, /togglePlanTask = async \(taskId, completed, userId = null\)/);
  assert.match(plans, /\.eq\("user_id", userId\)/);
});

test("plan task migration backfills owner and enforces RLS by user_id", () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS user_id UUID/);
  assert.match(migration, /SET user_id = dp\.user_id/);
  assert.match(migration, /WITH CHECK \(\(select auth\.uid\(\)\) = user_id\)/);
});
