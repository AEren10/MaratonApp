import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");
const home = read("src/hooks/useTodayStops.js");
const plan = read("src/screens/plan/usePlanTaskUndo.js");
const mig = read("supabase/migrations/20261002024055_clde_route_stop_reopen.sql");

test("undo reopens the route stop before deleting its study log", () => {
  for (const src of [home, plan]) {
    const reopen = src.indexOf('"upcoming"');
    const del = src.indexOf("stopLog.undo(");
    assert.ok(reopen > 0 && del > reopen, "route reopen must come first");
    assert.match(src, /lifecycle_status !== "upcoming"/);
  }
});

test("completed stops ask before undo instead of silently ignoring the tap", () => {
  assert.match(home, /record\.confirmUndo\(item, \(\) => reopen\(item\)\)/);
  assert.match(read("src/screens/plan/usePlanDetailTasks.js"), /undo\.confirmReopen\(task\)/);
});

test("server only reopens stops completed today and revisions keep the reopen", () => {
  assert.match(mig, /completed_at AT TIME ZONE 'Europe\/Istanbul'\)::date\s*= \(now\(\) AT TIME ZONE 'Europe\/Istanbul'\)::date/);
  assert.match(mig, /v_prev_status NOT IN \('completed', 'rescheduled', 'skipped'\)/);
});
