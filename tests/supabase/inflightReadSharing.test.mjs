import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const studyLogs = readFileSync(new URL("../../src/supabase/studyLogs.js", import.meta.url), "utf8");
const topicProgress = readFileSync(new URL("../../src/supabase/topicProgress.js", import.meta.url), "utf8");
const wrongQuestions = readFileSync(new URL("../../src/supabase/wrongQuestions.js", import.meta.url), "utf8");
const plans = readFileSync(new URL("../../src/supabase/plans.js", import.meta.url), "utf8");
const routePlan = readFileSync(new URL("../../src/supabase/routePlan.js", import.meta.url), "utf8");
const routePersistOnce = readFileSync(new URL("../../src/lib/routePersistOnce.js", import.meta.url), "utf8");

test("startup-heavy Supabase readers use shared in-flight requests", () => {
  for (const source of [studyLogs, topicProgress, wrongQuestions, plans, routePlan]) {
    assert.match(source, /makeInFlightKey/);
    assert.match(source, /shareInFlight/);
  }
});

test("read keys preserve user and query-shaping parameters", () => {
  assert.match(studyLogs, /makeInFlightKey\("study_logs", userId, \{ from, to, limit \}\)/);
  assert.match(studyLogs, /\{ subjectKey, topicName, limit \}/);
  assert.match(wrongQuestions, /\{ operation: "list", subject, resolved \}/);
  assert.match(plans, /makeInFlightKey\("daily_plans", userId, \{ date \}\)/);
  assert.match(routePlan, /\{ operation: "latest_stops", examType \}/);
  assert.match(routePlan, /\{ operation: "weeks", sinceWeekStart, examType \}/);
  assert.match(routePlan, /\{ operation: "stops", revisionId \}/);
});

test("route writes invalidate reads before routePersistOnce refetches", () => {
  assert.match(routePlan, /saveRouteWeeks[\s\S]*invalidateRoutePlanReads\(userId\)/);
  assert.match(routePlan, /transitionRouteStop[\s\S]*invalidateRoutePlanReads\(userId\)/);
  assert.match(
    routePersistOnce,
    /invalidateRoutePlanReads\(userId\);\s+return getLatestRouteStops\(userId, examType\)/,
  );
});
