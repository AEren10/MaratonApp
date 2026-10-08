import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { buildRoutePreview, PREVIEW_DAILY_OPTIONS, previewExamDate } from "../../src/domain/onboarding/routePreview.js";

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");
const NOW = new Date("2026-10-02T09:00:00+03:00");

test("preview draws a real route for every exam without user data", () => {
  for (const [examType, field] of [["tyt", null], ["tyt_ayt", "sayisal"], ["tyt_ayt", "ea"], ["tyt_ayt", "sozel"], ["dil", "dil"], ["lgs", null]]) {
    const p = buildRoutePreview({ examType, field, dailyQuestions: 100, examYear: 2027, now: NOW });
    assert.ok(p.weeksLeft > 30, examType);
    assert.ok(p.topics > 0, examType);
    assert.ok(p.firstStops.length >= 3, examType);
    assert.equal(new Set(p.firstStops.map((s) => `${s.subject}|${s.topic}`)).size, p.firstStops.length);
    assert.ok(p.firstStops.every((s) => s.topic && s.subjectLabel));
  }
});

test("preview needs all three answers", () => {
  assert.equal(buildRoutePreview({ examType: "tyt", dailyQuestions: 100 }), null);
  assert.equal(buildRoutePreview({ examType: null, dailyQuestions: 100, examYear: 2027 }), null);
});

test("daily options use the goal screen scale (50 questions = 1 hour)", () => {
  for (const o of PREVIEW_DAILY_OPTIONS) assert.equal(o.questions, o.hours * 50);
  assert.equal(previewExamDate(2027).getMonth(), 5);
});

test("register says 'rotan hazir' only after a real preview; setup skips exam choice", () => {
  assert.doesNotMatch(read("src/screens/auth/RegisterScreen.js"), /Rotan hazır/);
  assert.match(read("src/lib/routePreviewStore.js"), /return memory\s*\? "Rotan hazır/);
  assert.match(read("src/navigation/AppNavigator.js"), /intent === "register" \? SCREENS\.ROUTE_PREVIEW/);
  assert.match(read("src/navigation/AppNavigator.js"), /setupStartScreen\(\{ fromPreview,/);
  assert.match(read("src/domain/onboarding/setupStartScreen.js"), /fromPreview \? SCREENS\.GOAL_SETUP/);
  assert.match(read("src/hooks/useFinishOnboarding.js"), /clearPendingPreview\(\)/);
});
