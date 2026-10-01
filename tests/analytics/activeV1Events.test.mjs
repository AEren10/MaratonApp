import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");

test("study.started fires at the first real timer start, not on screen render", () => {
  const source = read("src/screens/study/useStudyTimerController.js");
  assert.match(source, /if \(!studyStartedTrackedRef\.current\)[\s\S]*track\(EVENTS\.STUDY_STARTED/);
  assert.match(source, /studyStartedTrackedRef\.current = true/);
});

test("plan detail view and all task sources emit canonical plan events", () => {
  const viewModel = read("src/screens/plan/usePlanDetailViewModel.js");
  const detail = read("src/screens/plan/usePlanDetailTasks.js");
  const home = read("src/hooks/useTodayStops.js");
  const userTasks = read("src/hooks/useUserTasks.js");
  const contract = read("src/lib/planAnalytics.js");

  assert.match(viewModel, /track\(EVENTS\.PLAN_VIEWED, \{ surface: "plan_detail" \}\)/);
  assert.match(detail, /trackPlanTaskCompleted\(task, "plan_detail"\)/);
  assert.match(home, /trackPlanTaskCompleted\(item, "home"\)/);
  assert.match(userTasks, /trackPlanTaskCompleted\(\{ \.\.\.task, userTask: true \}, "user_task"\)/);
  assert.match(contract, /track\(EVENTS\.PLAN_ALL_COMPLETED/);
  assert.match(contract, /PLAN_ANALYTICS_ALL_COMPLETED_PREFIX/);
});

test("wrong notebook events are after durable save or queue success", () => {
  const addWrong = read("src/hooks/useAddWrong.js");
  const review = read("src/hooks/useWrongReviewSession.js");

  assert.ok(addWrong.indexOf("await saveWrongQuestionOffline") < addWrong.indexOf("track(EVENTS.WRONG_ADDED"));
  assert.match(review, /if \(!r\.saved && !r\.queued\) return;[\s\S]*track\(EVENTS\.WRONG_REVIEWED/);
});

test("trial comparison fires only when comparison data is renderable", () => {
  const source = read("src/screens/analytics/ComparativeScreen.js");
  assert.match(source, /if \(!period \|\| trackedPeriodsRef\.current\.has\(periodDays\)\) return;/);
  assert.match(source, /track\(EVENTS\.TRIAL_COMPARED/);
});

test("analytics call sites do not attach raw URLs or database row IDs", () => {
  const linking = read("src/navigation/linking.js");
  const wrongDetail = read("src/hooks/useWrongDetail.js");
  const wrongList = read("src/screens/wrong-notebook/useWrongNotebookController.js");
  const routeStart = `${read("src/screens/roadmap/useRoadmapNextAction.js")}\n${read("src/screens/roadmap/routeCreatedAlert.js")}`;

  assert.doesNotMatch(linking, /trackNotificationOpened\([^\n]*\{[^}]*url:/);
  assert.doesNotMatch(wrongDetail, /trackButtonTap\([^\n]*wrongQuestionId/);
  assert.doesNotMatch(wrongList, /trackButtonTap\([^\n]*wrongQuestionId/);
  assert.doesNotMatch(routeStart, /track\(EVENTS\.[\s\S]{0,180}stopId:/);
});
