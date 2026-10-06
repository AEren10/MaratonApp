import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20261006120000_cdx_onboarding_completion_authority.sql",
  "utf8",
);
const sqlTest = readFileSync("supabase/tests/onboarding_completion_rpc.sql", "utf8");

test("onboarding completion has a server-owned timestamp and safe backfill", () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS onboarding_completed_at timestamptz/i);
  assert.match(migration, /gamification_stats ->> 'setup_completed'/);
  assert.match(migration, /p\.target_net IS NOT NULL/);
  assert.match(migration, /p\.study_session_count/);
  assert.match(migration, /FROM public\.study_logs/);
});

test("complete_onboarding is authenticated, idempotent, and search-path locked", () => {
  assert.match(migration, /FUNCTION public\.complete_onboarding\(\)/);
  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /SET search_path = ''/);
  assert.match(migration, /uid uuid := auth\.uid\(\)/);
  assert.match(migration, /COALESCE\(onboarding_completed_at, now\(\)\)/);
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.complete_onboarding\(\) FROM public, anon/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.complete_onboarding\(\) TO authenticated/);
});

test("rollback SQL covers repeat calls and anonymous access", () => {
  assert.match(sqlTest, /^BEGIN;/m);
  assert.match(sqlTest, /first_value := public\.complete_onboarding\(\)/);
  assert.match(sqlTest, /second_value := public\.complete_onboarding\(\)/);
  assert.match(sqlTest, /anonymous onboarding completion succeeded/);
  assert.match(sqlTest, /^ROLLBACK;/m);
});
