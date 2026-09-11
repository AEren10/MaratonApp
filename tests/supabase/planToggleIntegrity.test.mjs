import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const plansSource = readFileSync(new URL("../../src/supabase/plans.js", import.meta.url), "utf8");
const offlineQueueSource = readFileSync(new URL("../../src/lib/offlineQueue.js", import.meta.url), "utf8");
const planCompletionSource = readFileSync(new URL("../../src/hooks/usePlanCompletion.js", import.meta.url), "utf8");
const studyCompletionSource = readFileSync(new URL("../../src/lib/studyPlanCompletion.js", import.meta.url), "utf8");

test("plan task toggle is user scoped and fails when no row is updated", () => {
  assert.match(plansSource, /togglePlanTask = async \(taskId, completed, userId = null\)/);
  assert.match(plansSource, /if \(userId\) query = query\.eq\("user_id", userId\)/);
  assert.match(plansSource, /\.select\("id"\)\.maybeSingle\(\)/);
  assert.match(plansSource, /if \(!data\) throw new Error\("plan_task_not_found"\)/);
});

test("offline plan task toggles carry user id through enqueue and replay", () => {
  assert.match(offlineQueueSource, /togglePlanTask\(item\.payload\.taskId, item\.payload\.completed, item\.payload\.user_id\)/);
  assert.match(offlineQueueSource, /savePlanTaskToggleOffline\(taskId, completed, userId = null\)/);
  assert.match(offlineQueueSource, /payload: \{ taskId, completed, user_id: userId \}/);
  assert.match(planCompletionSource, /savePlanTaskToggleOffline\(dbId, nowDone, userId\)/);
  assert.match(studyCompletionSource, /savePlanTaskToggleOffline\(dbTask\.id, true, userId\)/);
});
