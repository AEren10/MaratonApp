import test from "node:test";
import assert from "node:assert/strict";

import { knownTopicsReminderDue } from "../../src/domain/program/knownTopicsReminder.js";

const DAY = 86400000;
const now = Date.parse("2026-10-01T12:00:00Z");

test("ilk iki hafta sorulmaz", () => {
  assert.equal(knownTopicsReminderDue({ now, accountCreatedAt: new Date(now - 5 * DAY).toISOString() }), false);
});

test("iki haftadan sonra ilk kez sorulur", () => {
  assert.equal(knownTopicsReminderDue({ now, accountCreatedAt: new Date(now - 20 * DAY).toISOString() }), true);
});

test("kapatildiktan sonra 30 gun sorulmaz, sonra yine sorulur", () => {
  const accountCreatedAt = new Date(now - 90 * DAY).toISOString();
  assert.equal(knownTopicsReminderDue({ now, accountCreatedAt, lastAt: now - 10 * DAY }), false);
  assert.equal(knownTopicsReminderDue({ now, accountCreatedAt, lastAt: now - 31 * DAY }), true);
});
