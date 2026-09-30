import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");

test("app start does not schedule reminders without a user", () => {
  const app = read("App.js");
  assert.doesNotMatch(app, /applyNotifPrefs\(/, "no user-less apply on app start");
  assert.match(app, /import "\.\/src\/lib\/notifications";/, "handler still registered at load");
});

test("every schedule/cancel path runs in the single notification queue", () => {
  const notif = read("src/lib/notifications.js");
  assert.match(notif, /export async function cancelAllScheduled\(\) \{\s+return serial\(/);
  assert.match(notif, /return serial\(\(\) => applyNotifPrefsNow/);
  assert.match(notif, /return serial\(\(\) => scheduleTaskNotificationsNow/);
  assert.match(notif, /return serial\(\(\) => updateReminderContentNow/);
  assert.match(notif, /return serial\(\(\) => onStudiedTodayNow/);
});

test("late calls for a signed-out user do not reschedule", () => {
  const notif = read("src/lib/notifications.js");
  for (const fn of ["applyNotifPrefsNow", "onStudiedTodayNow", "updateReminderContentNow", "scheduleTaskNotificationsNow"]) {
    const body = notif.slice(notif.indexOf(`async function ${fn}`));
    const head = body.slice(0, 200);
    assert.match(head, /if \(!\(await isActiveOwner\(userId\)\)\) return;/, fn);
  }
  assert.match(notif, /registerSessionReset\(\(\) => \{ lastReminderKey = null; \}\)/);
});

test("cold-start notification response is consumed once", () => {
  assert.match(read("src/navigation/linking.js"), /clearLastNotificationResponse/);
});
