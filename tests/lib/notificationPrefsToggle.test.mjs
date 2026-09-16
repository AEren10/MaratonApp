import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const hook = readFileSync(new URL("../../src/hooks/useNotificationPrefs.js", import.meta.url), "utf8");

test("notification toggles request permission for every visible reminder type", () => {
  assert.match(hook, /next\.dailyReminderEnabled/);
  assert.match(hook, /next\.streakRiskEnabled/);
  assert.match(hook, /next\.trialReminderEnabled/);
  assert.match(hook, /next\.taskReminderEnabled/);
  assert.match(hook, /next\.weeklySummaryEnabled/);
});

test("notification denial disables every visible reminder switch", () => {
  for (const key of [
    "dailyReminderEnabled",
    "streakRiskEnabled",
    "trialReminderEnabled",
    "taskReminderEnabled",
    "weeklySummaryEnabled",
  ]) {
    assert.match(hook, new RegExp(`next\\.${key} = false`));
  }
});

test("turning off task reminders cancels already scheduled task notifications", () => {
  assert.match(hook, /cancelTaskReminders/);
  assert.match(hook, /if \(next\.taskReminderEnabled === false\)/);
});
