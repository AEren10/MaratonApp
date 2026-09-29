import test from "node:test";
import assert from "node:assert/strict";

import { weekdayRhythm } from "../../src/domain/program/weekdayRhythm.js";

test("hafta sonu calisan ogrencinin ritmi; bu haftanin kayitlari sayilmaz; az veride null", () => {
  const logs = [];
  for (const monday of ["2026-09-07", "2026-09-14", "2026-09-21"]) {
    const sat = new Date(`${monday}T12:00:00`); sat.setDate(sat.getDate() + 5);
    logs.push({ study_date: monday, duration_minutes: 30 });
    logs.push({ study_date: sat.toISOString().slice(0, 10), duration_minutes: 150 });
  }
  logs.push({ study_date: "2026-09-29", duration_minutes: 999 });
  const r = weekdayRhythm(logs, "2026-09-28");
  assert.equal(r.length, 7);
  assert.ok(r[5] > r[0]);
  assert.equal(weekdayRhythm(logs.slice(0, 2), "2026-09-28"), null);
});
