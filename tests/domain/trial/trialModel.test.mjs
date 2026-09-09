import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizeTrial, toTrialRow, TRIAL_DIFFICULTY,
} from "../../../src/domain/trial/trialModel.js";

test("normalizes publisher difficulty snapshot without changing raw totalNet", () => {
  const trial = normalizeTrial({
    exam_type: "tyt", total_net: 70.5, publisher_id: "pub-1",
    publisher_name_snapshot: "Karekök", difficulty_level: "hard",
    difficulty_multiplier: 1.12, normalization_version: 2,
    normalization_confidence: "catalog",
  });
  assert.equal(trial.totalNet, 70.5);
  assert.equal(trial.rawTotalNet, 70.5);
  assert.equal(trial.normalizedTotalNet, 78.96);
  assert.equal(trial.publisherId, "pub-1");
  assert.equal(trial.publisherNameSnapshot, "Karekök");
  assert.equal(trial.normalizationVersion, 2);
});

test("stored normalized net wins and all snapshot fields serialize", () => {
  const row = toTrialRow({
    totalNet: 50, normalizedTotalNet: 57.25,
    publisherId: "pub-2", publisherNameSnapshot: "Örnek",
    difficultyLevel: "very_hard", difficultyMultiplier: 1.22,
    normalizationVersion: 3, normalizationConfidence: "verified",
  });
  assert.equal(row.total_net, 50);
  assert.equal(row.raw_total_net, 50);
  assert.equal(row.normalized_total_net, 57.25);
  assert.equal(row.publisher_name_snapshot, "Örnek");
  assert.equal(row.normalization_confidence, "verified");
  assert.equal(TRIAL_DIFFICULTY.EASY.multiplier, 0.94);
});
