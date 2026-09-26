import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { onRouteUpdated, emitRouteUpdated } from "../../src/lib/routeEvents.js";
import { firstRouteAction } from "../../src/domain/route/routeStartAction.js";

const routePlanSource = readFileSync(new URL("../../src/supabase/routePlan.js", import.meta.url), "utf8");
const useStudyRouteSource = readFileSync(new URL("../../src/hooks/useStudyRoute.js", import.meta.url), "utf8");
const useAddTaskStateSource = readFileSync(new URL("../../src/screens/plan/useAddTaskState.js", import.meta.url), "utf8");

test("routeEvents: onRouteUpdated notifies subscribers and allows unsubscription", () => {
  let calls = 0;
  let receivedPayload = null;
  const unsubscribe = onRouteUpdated((payload) => {
    calls += 1;
    receivedPayload = payload;
  });

  emitRouteUpdated({ action: "test_update" });
  assert.equal(calls, 1);
  assert.deepEqual(receivedPayload, { action: "test_update" });

  unsubscribe();
  emitRouteUpdated({ action: "test_update_2" });
  assert.equal(calls, 1);
});

test("routePlan: getRouteWeeks local fallback normalizes camelCase and snake_case keys", () => {
  assert.match(routePlanSource, /r\.week_start \|\| r\.weekStart/);
  assert.match(routePlanSource, /r\.planned_questions \?\? r\.plannedQuestions/);
  assert.match(routePlanSource, /r\.planned_minutes \?\? r\.plannedMinutes/);
  assert.match(routePlanSource, /r\.exam_type \|\| r\.examType/);
});

test("routePlan: exports addStopToActiveRoute that promotes stop to active and emits update", () => {
  assert.match(routePlanSource, /export async function addStopToActiveRoute/);
  assert.match(routePlanSource, /lifecycle_status: "active"/);
  assert.match(routePlanSource, /emitRouteUpdated\(\{ action: "stop_added"/);
});

test("useAddTaskState: connects 'Rotaya ekle' to createRoute or addStopToActiveRoute", () => {
  assert.match(useAddTaskStateSource, /import \{ addStopToActiveRoute \} from "\.\.\/\.\.\/supabase\/routePlan"/);
  assert.match(useAddTaskStateSource, /import \{ useStudyRoute \} from "\.\.\/\.\.\/hooks\/useStudyRoute"/);
  assert.match(useAddTaskStateSource, /if \(!routeCreated\) \{/);
  assert.match(useAddTaskStateSource, /await createRoute\(\{ initialActiveStop: stopPayload \}\)/);
  assert.match(useAddTaskStateSource, /await addStopToActiveRoute\(stopPayload\)/);
});

test("useStudyRoute: ensures resilient route creation with effectiveUserId and resolvedExamType", () => {
  assert.match(useStudyRouteSource, /const resolvedExamType = examType \|\| "tyt_ayt"/);
  assert.match(useStudyRouteSource, /const effectiveUserId = user\?\.id \|\| "local_user"/);
  assert.match(useStudyRouteSource, /emitRouteUpdated\(\{ action: "created"/);
  assert.match(useStudyRouteSource, /onRouteUpdated\(\(\) => \{/);
});

test("firstRouteAction identifies the first active stop in a generated route", () => {
  const stops = [
    {
      id: "local_stop_mat",
      lifecycle_status: "active",
      subject: "matematik",
      subject_label: "Matematik",
      topic: "Temel Kavramlar",
      week_start: "2026-09-21",
      position: 0,
      version: 1,
    },
    {
      id: "local_stop_turk",
      lifecycle_status: "upcoming",
      subject: "turkce",
      subject_label: "Türkçe",
      topic: "Sözcükte Anlam",
      week_start: "2026-09-21",
      position: 1,
      version: 1,
    },
  ];

  const action = firstRouteAction(stops);
  assert.ok(action);
  assert.equal(action.subjectKey, "matematik");
  assert.equal(action.topicName, "Temel Kavramlar");
  assert.equal(action.actionLabel, "Sıradaki durağa başla");
});
