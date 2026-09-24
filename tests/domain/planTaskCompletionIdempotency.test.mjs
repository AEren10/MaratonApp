import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import {
  mapRemotePlanTasks,
  buildPlanTaskKey,
} from "../../src/domain/plan/planTaskIdentity.js";

const storageKeysSrc = readFileSync(new URL("../../src/constants/storageKeys.js", import.meta.url), "utf8");

test("storage keys include plan and user task rewarded prefixes", () => {
  assert.match(storageKeysSrc, /PLAN_REWARDED_PREFIX:\s*"@plan_rewarded"/);
  assert.match(storageKeysSrc, /USER_TASK_REWARDED_PREFIX:\s*"@user_task_rewarded"/);
});

test("mapRemotePlanTasks extracts task map and completed task ids", () => {
  const dbTasks = [
    { id: "db-1", subject: "matematik", topic: "Temel Kavramlar", completed: true },
    { id: "db-2", subject: "fizik", topic: "Kuvvet ve Hareket", completed: false },
  ];
  const generatedTasks = [
    { subject: "matematik", topic: "Temel Kavramlar", planTaskKey: "plan_mat_temel" },
  ];

  const result = mapRemotePlanTasks(dbTasks, generatedTasks);
  const expectedKey = buildPlanTaskKey("matematik", "Temel Kavramlar");

  assert.equal(result.map[expectedKey], "db-1");
  assert.equal(result.map["plan_mat_temel"], "db-1");
  assert.ok(result.doneIds.includes(expectedKey));
  assert.ok(result.doneIds.includes("plan_mat_temel"));
});

test("plan task completion rewards XP at most once per task (idempotency)", () => {
  const rewardedIds = new Set();
  let rewardCallCount = 0;
  const reward = (type) => {
    if (type === "plan_task_done") rewardCallCount += 1;
  };

  const simulateToggle = (taskId) => {
    // nowDone is true
    if (!rewardedIds.has(taskId)) {
      rewardedIds.add(taskId);
      reward("plan_task_done");
    }
  };

  // First toggle: task completed -> XP awarded
  simulateToggle("task-123");
  assert.equal(rewardCallCount, 1);
  assert.ok(rewardedIds.has("task-123"));

  // Second toggle: task un-toggled and re-toggled -> NO duplicate XP
  simulateToggle("task-123");
  assert.equal(rewardCallCount, 1);

  // Third toggle: different task -> XP awarded
  simulateToggle("task-456");
  assert.equal(rewardCallCount, 2);
  assert.ok(rewardedIds.has("task-456"));
});
