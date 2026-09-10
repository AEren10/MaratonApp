import assert from "node:assert/strict";
import test from "node:test";

import { buildDailyAssignmentNarrative } from "../../src/domain/plan/dailyAssignment.js";

test("explains a route-backed daily assignment with impact and confidence", () => {
  const assignment = buildDailyAssignmentNarrative({
    reason: "Son denemelerde zayıf kalan alana denk geliyor.",
    routeReasonCode: "LOW_ACCURACY",
    routeStop: { id: "stop-1", dataConfidence: "medium", cost: { questions: 72, minutes: 120 } },
    routeInsight: { confidence: "medium", expectedNetGain: 1.24 },
    questionCount: 36,
    tier: "high",
  });

  assert.equal(assignment.source, "route");
  assert.equal(assignment.title, "Rota motoru seçti");
  assert.equal(assignment.impact, "~+1.2 net potansiyeli");
  assert.equal(assignment.estimatedMinutes, 60);
  assert.equal(assignment.effort, "36 soru · ~60 dk");
  assert.equal(assignment.confidenceLabel, "orta");
  assert.equal(assignment.bullets.length, 3);
});

test("keeps adaptive fallback effort on the old question-based estimate", () => {
  const assignment = buildDailyAssignmentNarrative({
    questionCount: 10,
  });

  assert.equal(assignment.estimatedMinutes, 12);
  assert.equal(assignment.effort, "10 soru · ~12 dk");
});

test("uses route minutes directly when route question cost is missing", () => {
  const assignment = buildDailyAssignmentNarrative({
    routeStop: { id: "stop-2", cost: { minutes: 25 } },
    questionCount: 12,
  });

  assert.equal(assignment.estimatedMinutes, 25);
  assert.equal(assignment.effort, "12 soru · ~25 dk");
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
