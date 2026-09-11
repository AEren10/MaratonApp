import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const routePlan = readFileSync(new URL("../../src/supabase/routePlan.js", import.meta.url), "utf8");
const wrongQuestions = readFileSync(new URL("../../src/supabase/wrongQuestions.js", import.meta.url), "utf8");

test("runtime route reads avoid wildcard selects", () => {
  assert.match(routePlan, /const ROUTE_STOP_COLUMNS = \[/);
  assert.match(routePlan, /const ROUTE_STATE_COLUMNS = /);
  assert.doesNotMatch(routePlan, /from\("route_stops"\)[\s\S]{0,80}\.select\("\*"\)/);
  assert.doesNotMatch(routePlan, /from\(STATE_TABLE\)[\s\S]{0,80}\.select\("\*"\)/);
});

test("wrong question detail uses the shared column list", () => {
  assert.match(wrongQuestions, /getWrongQuestionById/);
  assert.doesNotMatch(wrongQuestions, /getWrongQuestionById[\s\S]*?\.select\("\*"\)/);
});
