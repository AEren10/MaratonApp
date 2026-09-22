import assert from "node:assert/strict";
import test from "node:test";

import { makeTopicKey, isTopicDone } from "../../src/domain/curriculum/topicCompletion.js";

test("makeTopicKey formats subjectKey and topicName", () => {
  assert.equal(makeTopicKey("matematik", "Doğal Sayılar"), "matematik:Doğal Sayılar");
  assert.equal(makeTopicKey("", ""), ":");
});

test("isTopicDone respects manual overrides and falls back to autoPct", () => {
  const map = {
    "matematik:Doğal Sayılar": true,
    "matematik:Fonksiyonlar": false,
  };

  // Manually completed even if autoPct is 0
  assert.equal(isTopicDone(map, "matematik", "Doğal Sayılar", 0), true);

  // Manually uncompleted even if autoPct is 100
  assert.equal(isTopicDone(map, "matematik", "Fonksiyonlar", 100), false);

  // Fallback to autoPct >= 100 when not in map
  assert.equal(isTopicDone(map, "fizik", "Kuvvet", 100), true);
  assert.equal(isTopicDone(map, "fizik", "Kuvvet", 85), false);
  assert.equal(isTopicDone(null, "fizik", "Kuvvet", 100), true);
  assert.equal(isTopicDone(null, "fizik", "Kuvvet", 0), false);
});
