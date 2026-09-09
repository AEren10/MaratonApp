import test from "node:test";
import assert from "node:assert/strict";
import {
  buildTempoScenarios, simulateTempoScenario,
} from "../../../src/domain/forecast/tempoScenario.js";

const now = new Date("2026-01-01T12:00:00Z");
const examDate = new Date("2026-03-12T12:00:00Z");
const forecast = {
  projected: 60, current: 50, trialType: "TYT", valueBasis: "normalized",
  predictionInterval: { margin: 3 },
};
const trials = [0, 1, 2, 3, 4].map((index) => ({
  date: new Date(now.getTime() + index * 7 * 86400000).toISOString(),
  trialType: "TYT", normalizedTotalNet: 40 + index * (index + 1) / 2,
}));
const studyLogs = [100, 200, 300, 400].map((questions, index) => ({
  study_date: new Date(now.getTime() + (index * 7 + 3) * 86400000).toISOString(),
  question_count: questions, duration_minutes: questions,
}));

test("builds ordered 0.9/1/1.1 scenarios with a shared band thickness", () => {
  const scenarios = buildTempoScenarios({
    forecast, trials, studyLogs, questionsPerWeek: 250,
    stopsPerWeek: 5, examDate, maxNet: 120, now,
  });
  assert.deepEqual(scenarios.map((item) => item.multiplier), [0.9, 1, 1.1]);
  assert.equal(scenarios[1].projectedNet, 60);
  assert.equal(scenarios[2].projectedNet, 62.5);
  assert.equal(scenarios[2].deltaNet, 2.5);
  assert.deepEqual(scenarios.map((item) => item.range.high - item.range.low), [6, 6, 6]);
  assert.equal(scenarios[2].model, "observed_question_response");
});

test("fallback remains data-driven instead of returning a fixed net delta", () => {
  const first = simulateTempoScenario({
    forecast, multiplier: 1.1, questionsPerWeek: 200,
    examDate, maxNet: 120, now,
  });
  const second = simulateTempoScenario({
    forecast: { ...forecast, projected: 54 },
    multiplier: 1.1, questionsPerWeek: 200,
    examDate, maxNet: 120, now,
  });
  assert.equal(first.deltaNet, 1);
  assert.equal(second.deltaNet, 0.4);
  assert.notEqual(first.deltaNet, second.deltaNet);
});

test("invalid forecast or multiplier fails closed", () => {
  assert.deepEqual(buildTempoScenarios({}), []);
  assert.equal(simulateTempoScenario({ forecast, multiplier: 1.2 }), null);
});
