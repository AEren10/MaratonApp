import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/supabase/routePlan.js", import.meta.url), "utf8");
const examScopeMigration = readFileSync(
  new URL("../../supabase/migrations/20260911232414_cdx_scope_route_weeks_by_exam.sql", import.meta.url),
  "utf8",
);

test("route weeks are persisted through the revision RPC transaction", () => {
  assert.match(source, /rpc\("persist_route_revision"/);
  assert.doesNotMatch(source, /\.from\(TABLE\)\s*[\s\S]{0,120}\.upsert/);
});

test("route week snapshots are scoped by exam type", () => {
  assert.match(examScopeMigration, /idx_route_weeks_user_exam_week/);
  assert.match(examScopeMigration, /ON public\.route_weeks \(user_id, exam_type, week_start\) NULLS NOT DISTINCT/);
  assert.match(examScopeMigration, /DROP INDEX IF EXISTS public\.idx_route_weeks_user_week/);
  assert.match(examScopeMigration, /ON CONFLICT \(user_id, exam_type, week_start\) DO UPDATE/);
});
