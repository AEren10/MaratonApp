import test from "node:test";
import assert from "node:assert/strict";

import { buildNetChart, netChartSeries, routeXs } from "../../src/domain/route/netChartData.js";

const tyt = (date, net, extra = {}) => ({ date, trialType: "TYT", totalNet: net, ...extra });

test("6 gunde 4 TYT: tahmin yokken de noktalar cizilir, uc HEDEF'e gider", () => {
  const trials = [tyt("2026-09-22", 52), tyt("2026-09-24", 55), tyt("2026-09-26", 54), tyt("2026-09-28", 58)];
  const chart = buildNetChart({ trials, types: ["TYT"], forecast: null, target: 78 });
  assert.deepEqual(chart.stops.map((s) => s.y), [52, 55, 54, 58]);
  assert.equal(chart.mode, "target");
  assert.deepEqual(chart.projection, [78]);
  assert.equal(chart.endLabel, "HEDEF 78");
  assert.equal(chart.todayIndex, 3);
});

test("tahmin makulse uc TAHMIN olur", () => {
  const trials = [tyt("2026-09-01", 50), tyt("2026-09-20", 60)];
  const chart = buildNetChart({ trials, types: ["TYT"], forecast: { projected: 71.4, range: { low: 65, high: 77 } }, target: 78 });
  assert.equal(chart.mode, "forecast");
  assert.equal(chart.endLabel, "TAHMİN 71");
  assert.deepEqual(chart.band, { upper: [77], lower: [65] });
});

test("baska sinav turu karismaz; tek deneme grafik acmaz", () => {
  const trials = [tyt("2026-09-22", 52), { date: "2026-09-29", trialType: "YDT", totalNet: 40 }];
  assert.equal(buildNetChart({ trials, types: ["TYT"], forecast: null, target: 78 }), null);
  assert.equal(netChartSeries(trials, ["YDT"]).length, 1);
});

test("ayni gunun denemeleri giris sirasiyla, son 8 tane", () => {
  const trials = Array.from({ length: 10 }, (_, i) => tyt("2026-09-29", i, { created_at: `2026-09-29T0${i}:00:00Z` }));
  const series = netChartSeries(trials, ["TYT"]);
  assert.equal(series.length, 8);
  assert.deepEqual(series.map((p) => p.net), [2, 3, 4, 5, 6, 7, 8, 9]);
});

test("eksen: gecmis %60, gelecek kalan pay; gelecek yoksa tum genislik", () => {
  assert.deepEqual(routeXs(4, 1), [0, 0.2, 0.4, 0.6, 1]);
  assert.deepEqual(routeXs(3, 0), [0, 0.5, 1]);
  assert.deepEqual(routeXs(1, 1), [0, 1]);
});

test("Rota ekrani 12 denemeye kadar gosterir, ana sayfa 8", () => {
  const trials = Array.from({ length: 14 }, (_, i) => tyt(`2026-08-${String(i + 1).padStart(2, "0")}`, 40 + i));
  assert.equal(buildNetChart({ trials, types: ["TYT"], target: 78 }).stops.length, 8);
  assert.equal(buildNetChart({ trials, types: ["TYT"], target: 78, limit: 12 }).stops.length, 12);
});
