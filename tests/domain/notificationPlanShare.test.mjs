import test from "node:test";
import assert from "node:assert/strict";
import { buildNotificationPlan } from "../../src/domain/notify/notificationPlan.js";

const now = new Date(2026, 9, 2, 10, 0); // Cuma
const prefs = { dailyReminderEnabled: true, weeklySummaryEnabled: true };

test("good week: Sunday notification invites to share and opens the story card", () => {
  const items = buildNotificationPlan({ now, prefs, context: { weeklyVars: { minutes: 600, questions: 340 } } });
  const w = items.find((i) => i.type === "weekly_share");
  assert.ok(w);
  assert.equal(w.screen, "share");
  assert.match(w.title, /Bu hafta 10 sa, 340 soru/);
  assert.ok(!items.some((i) => i.type === "weekly_summary"));
});

test("thin week keeps the plain summary", () => {
  const items = buildNotificationPlan({ now, prefs, context: { weeklyVars: { minutes: 40, questions: 10 } } });
  assert.ok(items.some((i) => i.type === "weekly_summary"));
});

test("widget tip goes out on its fixed day and never breaks the two-per-day cap", () => {
  const at = new Date(2026, 9, 5, 13, 0).toISOString(); // Pazartesi
  const items = buildNotificationPlan({ now, prefs, context: { widgetTipAt: at } });
  const tip = items.find((i) => i.type === "widget_tip");
  assert.ok(tip);
  assert.equal(tip.screen, "widget");
  const perDay = {};
  for (const i of items) { const k = i.date.toDateString(); perDay[k] = (perDay[k] || 0) + 1; }
  assert.ok(Object.values(perDay).every((n) => n <= 2));
});
