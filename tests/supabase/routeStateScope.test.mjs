import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routePlan = readFileSync(new URL("../../src/supabase/routePlan.js", import.meta.url), "utf8");
const useStudyRoute = readFileSync(new URL("../../src/hooks/useStudyRoute.js", import.meta.url), "utf8");
const migration = readFileSync(
  new URL("../../supabase/migrations/20260911233239_cdx_scope_route_state_by_exam.sql", import.meta.url),
  "utf8",
);

test("route state storage is scoped by user and exam type", () => {
  assert.match(migration, /DROP CONSTRAINT IF EXISTS route_state_pkey/);
  assert.match(migration, /idx_route_state_user_exam/);
  assert.match(migration, /ON public\.route_state \(user_id, exam_type\) NULLS NOT DISTINCT/);
  assert.match(routePlan, /onConflict: "user_id,exam_type"/);
});

test("route state reads prefer the current exam state with legacy fallback", () => {
  assert.match(routePlan, /export async function getRouteState\(userId, examType = null\)/);
  assert.match(routePlan, /query\.or\(`exam_type\.eq\.\$\{examType\},exam_type\.is\.null`\)\.limit\(2\)/);
  assert.match(routePlan, /rows\.find\(\(row\) => row\.exam_type === examType\) \|\| rows\[0\] \|\| null/);
  assert.match(useStudyRoute, /getRouteState\(user\.id, examType\)/);
});
