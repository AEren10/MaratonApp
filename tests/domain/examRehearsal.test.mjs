import { test } from "node:test";
import assert from "node:assert/strict";

import {
  rehearsalSessions, sessionLabel, formatRehearsalDate, rehearsalDateOptions,
  rehearsalReminderAt, reminderLine, isRehearsalDay,
} from "../../src/domain/exam/examRehearsal.js";
import { timeLocative } from "../../src/lib/trNumberSuffix.js";

test("oturumlar sinav turune gore", () => {
  assert.deepEqual(rehearsalSessions("tyt_ayt").map((s) => s.key), ["TYT", "AYT"]);
  assert.equal(sessionLabel(rehearsalSessions("tyt")[0]), "TYT · 165 dk");
  assert.equal(rehearsalSessions("lgs")[0].key, "LGS");
});

test("tarih ve hatirlatma satiri tasarim bicimiyle", () => {
  assert.equal(formatRehearsalDate("2026-06-14"), "Pazar, 14 Haz");
  assert.equal(reminderLine("10:15"), "Sabah 09:45'te tek hatırlatma");
  assert.equal(reminderLine("14:30"), "14:00'te tek hatırlatma");
  assert.equal(timeLocative("09:30"), "da");
  assert.equal(timeLocative("10:00"), "da");
  assert.equal(timeLocative("20:00"), "de");
});

test("secilebilir gunler sinav gununden once biter", () => {
  const now = new Date("2026-06-15T09:00:00");
  const days = rehearsalDateOptions(new Date("2026-06-20T00:00:00"), now);
  assert.deepEqual(days, ["2026-06-15", "2026-06-16", "2026-06-17", "2026-06-18", "2026-06-19"]);
});

test("hatirlatma 30 dk once, gecmisse kurulmaz", () => {
  const r = { dateKey: "2026-06-14", start: "10:15" };
  const at = rehearsalReminderAt(r, new Date("2026-06-01T00:00:00"));
  assert.equal(at.getHours(), 9);
  assert.equal(at.getMinutes(), 45);
  assert.equal(rehearsalReminderAt(r, new Date("2026-06-14T10:00:00")), null);
  assert.equal(isRehearsalDay(r, new Date("2026-06-14T15:00:00")), true);
});
