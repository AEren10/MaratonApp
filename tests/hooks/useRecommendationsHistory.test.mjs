import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const hook = readFileSync(new URL("../../src/hooks/useRecommendations.js", import.meta.url), "utf8");
const homeController = readFileSync(new URL("../../src/screens/home/useHomeController.js", import.meta.url), "utf8");

test("recommendations use a 45-day study history for retention nudges", () => {
  assert.match(hook, /const LOG_WINDOW_DAYS = 45/);
  assert.match(hook, /import \{ getStudyLogs \} from "\.\.\/supabase\/studyLogs"/);
  assert.match(hook, /import \{ buildRecentStudy \} from "\.\.\/lib\/buildPlanContext"/);
  assert.match(hook, /getStudyLogs\(user\.id, \{ from, to \}\)/);
  assert.match(hook, /buildRecentStudy\(sourceLogs\?\.length \? \[\.\.\.sourceLogs, \.\.\.todayLogs\] : todayLogs\)/);
});

test("home recommendations reuse the plan-context logs instead of duplicating the query", () => {
  assert.match(homeController, /const planCtx = usePlanContext\(\);/);
  assert.match(homeController, /const nudges = useRecommendations\(planCtx\.weekLogs\);/);
});
