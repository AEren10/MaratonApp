import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const notifications = readFileSync(new URL("../../src/lib/notifications.js", import.meta.url), "utf8");
const templates = readFileSync(new URL("../../src/lib/notificationTemplates.js", import.meta.url), "utf8");
const dataSync = readFileSync(new URL("../../src/hooks/useDataSync.js", import.meta.url), "utf8");
const prefsHook = readFileSync(new URL("../../src/hooks/useNotificationPrefs.js", import.meta.url), "utf8");
const goalSetup = readFileSync(new URL("../../src/screens/onboarding/useGoalSetupForm.js", import.meta.url), "utf8");
const permissionScreen = readFileSync(
  new URL("../../src/screens/onboarding/NotificationPermissionScreen.js", import.meta.url),
  "utf8",
);
const userTasks = readFileSync(new URL("../../src/hooks/useUserTasks.js", import.meta.url), "utf8");
const dailyGoalReward = readFileSync(new URL("../../src/hooks/useDailyGoalReward.js", import.meta.url), "utf8");
const userScopedStorage = readFileSync(new URL("../../src/lib/storage/userScopedStorage.js", import.meta.url), "utf8");

test("notification preference and context storage use active user scoped keys", () => {
  assert.match(notifications, /import \{ STORAGE_KEYS, userScopedKey \} from "\.\.\/constants\/storageKeys"/);
  assert.match(notifications, /function notifPrefsKey\(userId\) \{/);
  assert.match(notifications, /return userScopedKey\(STORAGE_KEY, userId\);/);
  assert.match(notifications, /function notifContextKey\(userId\) \{/);
  assert.match(notifications, /return userScopedKey\(CONTEXT_KEY, userId\);/);
  assert.match(notifications, /getNotifPrefs\(userId = null\)/);
  assert.match(notifications, /getJson\(notifPrefsKey\(userId\), null\)/);
  assert.match(notifications, /setJson\(notifPrefsKey\(userId\), prefs\)/);
  assert.match(notifications, /readNotifContext\(userId = null\)/);
  assert.match(notifications, /saveNotifContext\(context = \{\}, userId = null\)/);
  assert.match(notifications, /applyNotifPrefs\(prefs, context, userId = null\)/);
  assert.match(userScopedStorage, /STORAGE_KEYS\.NOTIF_PREFS,\s+STORAGE_KEYS\.NOTIF_CONTEXT,/);
});

test("notification callers pass user id when reading prefs and scheduling reminders", () => {
  assert.match(dataSync, /getNotifPrefs\(userId\)/);
  assert.match(dataSync, /applyNotifPrefs\(prefs, \{ streak: streakToday, studiedToday \}, userId\)/);
  assert.match(prefsHook, /getNotifPrefs\(user\?\.id\)/);
  assert.match(prefsHook, /applyNotifPrefs\(next, undefined, user\?\.id\)/);
  assert.match(goalSetup, /getNotifPrefs\(user\?\.id\)/);
  assert.match(goalSetup, /applyNotifPrefs\(prefs, undefined, user\?\.id\)/);
  assert.match(permissionScreen, /getNotifPrefs\(user\?\.id\)/);
  assert.match(permissionScreen, /applyNotifPrefs\(prefs, undefined, user\?\.id\)/);
  assert.match(userTasks, /scheduleTaskNotifications\(newTotal, user\?\.id\)/);
});

test("study hour personalization is scoped to the active user", () => {
  assert.match(templates, /import \{ STORAGE_KEYS, userScopedKey \} from "\.\.\/constants\/storageKeys"/);
  assert.match(templates, /trackStudyHour\(userId = null\)/);
  assert.match(templates, /const key = userScopedKey\(STORAGE_KEYS\.STUDY_HOURS, userId\);/);
  assert.match(templates, /getOptimalHour\(userId = null\)/);
  assert.match(templates, /getJson\(userScopedKey\(STORAGE_KEYS\.STUDY_HOURS, userId\), null\)/);
  assert.match(notifications, /getOptimalHour\(userId\)/);
  assert.match(dailyGoalReward, /trackStudyHour\(userId\)/);
});
