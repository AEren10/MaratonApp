import test from "node:test";
import assert from "node:assert/strict";

import { discoveryNudges } from "../../../src/domain/notify/discovery.js";

const t = (trialType, date, totalNet) => ({ trialType, date, totalNet });
const ids = (list) => list.map((n) => n.id);

test("ikinci denemeden sonra karsilastirma, ucuncude tahmin daveti", () => {
  const two = discoveryNudges({ trials: [t("TYT", "2026-09-10", 55), t("TYT", "2026-09-20", 60)], now: new Date(2026, 9, 10) });
  assert.deepEqual(ids(two), ["disc_compare_TYT"]);
  const three = discoveryNudges({ trials: [t("TYT", "2026-09-10", 55), t("TYT", "2026-09-20", 60), t("TYT", "2026-09-28", 62)], now: new Date(2026, 9, 10) });
  assert.ok(ids(three).includes("disc_forecast_TYT_1"));
});

test("hedef gecilince hedef guncelleme, AYT turleri tek aile", () => {
  const out = discoveryNudges({ trials: [t("AYT_SAY", "2026-09-28", 52)], targets: { ayt: 50 }, now: new Date(2026, 9, 10) });
  assert.deepEqual(ids(out), ["disc_target_AYT_50"]);
  assert.match(out[0].message, /52/);
});

test("gorulen davet bir daha cikmaz", () => {
  const trials = [t("TYT", "2026-09-10", 55), t("TYT", "2026-09-20", 60)];
  assert.equal(discoveryNudges({ trials, seen: new Set(["disc_compare_TYT"]), now: new Date(2026, 9, 10) }).length, 0);
});

test("ay donumu: gecen ay 2+ deneme ve ayin ilk 5 gunu", () => {
  const trials = [t("TYT", "2026-09-10", 55), t("BRANCH", "2026-09-20", 10), t("AYT_SAY", "2026-09-25", 40)];
  assert.ok(ids(discoveryNudges({ trials, now: new Date(2026, 9, 2) })).includes("disc_month_2026-09"));
  assert.ok(!ids(discoveryNudges({ trials, now: new Date(2026, 9, 9) })).includes("disc_month_2026-09"));
});

test("rota evresi yalniz TYT+AYT sinavinda", () => {
  assert.deepEqual(ids(discoveryNudges({ aytExam: true, daysLeft: 140 })), ["disc_phase_150"]);
  assert.deepEqual(ids(discoveryNudges({ aytExam: true, daysLeft: 40 })), ["disc_phase_60"]);
  assert.equal(discoveryNudges({ aytExam: false, daysLeft: 40 }).length, 0);
});

test("yil boyunca tekrar: her 3 denemede tahmin, buyuk net degisiminde karsilastirma", () => {
  const six = [55, 57, 58, 60, 61, 66].map((n, i) => t("TYT", `2026-0${3 + i}-10`, n));
  const out = ids(discoveryNudges({ trials: six, now: new Date(2026, 9, 10) }));
  assert.ok(out.includes("disc_forecast_TYT_2"));
  assert.ok(out.includes("disc_compare_TYT_2026-08-10"));
  const calm = [55, 57, 58, 60].map((n, i) => t("TYT", `2026-0${3 + i}-10`, n));
  assert.ok(!ids(discoveryNudges({ trials: calm, now: new Date(2026, 9, 10) })).some((x) => x.startsWith("disc_compare")));
});

test("iki davet arasi en az 3 gun", () => {
  const trials = [t("TYT", "2026-09-10", 55), t("TYT", "2026-09-20", 60)];
  const now = new Date(2026, 9, 10, 12);
  assert.equal(discoveryNudges({ trials, now, lastShownAt: new Date(2026, 9, 8, 12).toISOString() }).length, 0);
  assert.equal(discoveryNudges({ trials, now, lastShownAt: new Date(2026, 9, 6, 12).toISOString() }).length, 1);
});
