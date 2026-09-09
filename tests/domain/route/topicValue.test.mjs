import assert from "node:assert/strict";
import test from "node:test";

import { estimateTopicCost, priorityScoreDetails } from "../../../src/domain/route/topicCost.js";

test("topic yield uses per-topic exam share instead of the whole subject weight", () => {
  const topic = { topic: "Temel Kavramlar", q: 0, acc: 0 };
  const broad = estimateTopicCost(topic, { questionCount: 40, topics: Array(40).fill("x") }, "TYT");
  const compact = estimateTopicCost(topic, { questionCount: 6, topics: Array(6).fill("x") }, "TYT");

  assert.equal(broad.yield, compact.yield);
  assert.ok(broad.yield < 2);
});

test("priority output keeps an explainable score breakdown", () => {
  const result = priorityScoreDetails({
    cost: { questions: 20, yield: 0.8, done: false },
    neglectedDays: 30,
    daysLeft: 60,
    isWeakArea: true,
    unpreparedBefore: 1,
  });
  assert.ok(result.score > 0);
  assert.equal(result.components.expectedNetGain, 0.8);
  assert.equal(result.components.effortQuestions, 20);
  assert.ok(result.components.sequenceReadiness < 1);
});
