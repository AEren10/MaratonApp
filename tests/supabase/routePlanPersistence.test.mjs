import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/supabase/routePlan.js", import.meta.url), "utf8");
const routeWeeksMigration = readFileSync(
  new URL("../../supabase/migrations/20260913222410_cdx_scope_route_weeks_and_carryover.sql", import.meta.url),
  "utf8",
);

test("route weeks are persisted through the revision RPC transaction", () => {
  assert.match(source, /rpc\("persist_route_revision"/);
  assert.doesNotMatch(source, /\.from\(TABLE\)\s*[\s\S]{0,120}\.upsert/);
});

test("route week snapshots are scoped by exam type", () => {
  assert.match(routeWeeksMigration, /idx_route_weeks_user_exam_week/);
  assert.match(routeWeeksMigration, /ON public\.route_weeks \(user_id, exam_type, week_start\) NULLS NOT DISTINCT/);
  assert.match(routeWeeksMigration, /DROP INDEX IF EXISTS public\.idx_route_weeks_user_week/);
  assert.match(routeWeeksMigration, /ON CONFLICT \(user_id, exam_type, week_start\) DO UPDATE/);
});

test("route week cleanup removes legacy unscoped rows when preserving current exam", () => {
  assert.match(source, /q\.or\(`exam_type\.is\.null,exam_type\.neq\.\$\{exceptExamType\}`\)/);
  assert.doesNotMatch(source, /q = q\.neq\("exam_type", exceptExamType\)/);
});

test("route stop lifecycle carryover is scoped by revision exam type", () => {
  assert.match(routeWeeksMigration, /JOIN public\.route_revisions rr ON rr\.id = rs\.revision_id/);
  assert.match(routeWeeksMigration, /rr\.exam_type = p_exam_type/);
  assert.match(routeWeeksMigration, /rr\.exam_type IS NULL AND p_exam_type IS NULL/);
});

test("route persistence includes offline local storage durability and fallback", () => {
  assert.match(source, /STORAGE_KEYS\.ROUTE_WEEKS/);
  assert.match(source, /STORAGE_KEYS\.ROUTE_STOPS/);
  assert.match(source, /userId === "dev"/);
  assert.match(source, /42501/);
});

