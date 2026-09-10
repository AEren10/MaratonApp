import assert from "node:assert/strict";
import test from "node:test";

import { buildDailyAssignmentNarrative } from "../../src/domain/plan/dailyAssignment.js";

test("explains a route-backed daily assignment with impact and confidence", () => {
  const assignment = buildDailyAssignmentNarrative({
    reason: "Son denemelerde zayıf kalan alana denk geliyor.",
    routeReasonCode: "LOW_ACCURACY",
    routeStop: { id: "stop-1", dataConfidence: "medium" },
    routeInsight: { confidence: "medium", expectedNetGain: 1.24 },
    questionCount: 36,
    tier: "high",
  });

  assert.equal(assignment.source, "route");
  assert.equal(assignment.title, "Rota motoru seçti");
  assert.equal(assignment.impact, "~+1.2 net potansiyeli");
  assert.equal(assignment.effort, "36 soru · ~43 dk");
  assert.equal(assignment.confidenceLabel, "orta");
  assert.equal(assignment.bullets.length, 3);
});

test("explains an adaptive fallback assignment while data is still being collected", () => {
  const assignment = buildDailyAssignmentNarrative({
    reason: "18 gündür çalışmadın",
    questionCount: 24,
    tier: "critical",
    accuracy: 70,
    daysSince: 18,
  });

  assert.equal(assignment.source, "adaptive");
  assert.equal(assignment.title, "Bugünün kritik hamlesi");
  assert.equal(assignment.impact, "Uzun ara riskini azaltma");
  assert.equal(assignment.confidenceLabel, "veri topluyor");
});
