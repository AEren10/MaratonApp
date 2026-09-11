import assert from "node:assert/strict";
import test from "node:test";

import {
  scalePoints,
  buildLinePath,
  buildAreaPath,
  buildBandPath,
  estimatePathLength,
  splitPastFuture,
  buildMiniChart,
  makeScale,
  buildChartSummary,
} from "../../src/lib/routeChartPath.js";

test("scalePoints maps values into viewBox height range", () => {
  const points = scalePoints([0, 5, 10], { width: 100, height: 50, padTop: 0, padBottom: 0 });
  assert.equal(points.length, 3);
  assert.equal(points[0].y, 50); // min value -> bottom
  assert.equal(points[2].y, 0); // max value -> top
  assert.equal(points[0].x, 0);
  assert.equal(points[2].x, 100);
});

test("scalePoints handles a single value without dividing by zero", () => {
  const points = scalePoints([7], { width: 100, height: 50, padTop: 0, padBottom: 0 });
  assert.equal(points.length, 1);
  assert.equal(points[0].x, 50);
});

test("buildLinePath produces M/L command sequence", () => {
  const path = buildLinePath([{ x: 0, y: 0 }, { x: 10, y: 5 }, { x: 20, y: 0 }]);
  assert.equal(path, "M0,0 L10,5 L20,0");
});

test("buildLinePath handles a single point", () => {
  assert.equal(buildLinePath([{ x: 3, y: 4 }]), "M3,4");
});

test("buildAreaPath closes the path down to the baseline", () => {
  const path = buildAreaPath([{ x: 0, y: 10 }, { x: 10, y: 0 }], 20);
  assert.equal(path, "M0,10 L10,0 L10,20 L0,20 Z");
});

test("buildBandPath closes upper and reversed lower boundary", () => {
  const upper = [{ x: 0, y: 0 }, { x: 10, y: 0 }];
  const lower = [{ x: 0, y: 10 }, { x: 10, y: 10 }];
  const path = buildBandPath(upper, lower);
  assert.equal(path, "M0,0 L10,0 L10,10 L0,10 Z");
});

test("estimatePathLength sums straight segment distances", () => {
  const len = estimatePathLength([{ x: 0, y: 0 }, { x: 3, y: 4 }, { x: 3, y: 8 }]);
  assert.equal(len, 9);
});

test("splitPastFuture divides at todayIndex inclusive", () => {
  const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }, { x: 3, y: 3 }];
  const { past, future } = splitPastFuture(points, 1);
  assert.equal(past.length, 2);
  assert.equal(future.length, 3); // future includes the boundary point (joins visually)
});

test("splitPastFuture treats missing todayIndex as fully past", () => {
  const points = [{ x: 0, y: 0 }, { x: 1, y: 1 }];
  const { past, future } = splitPastFuture(points, null);
  assert.equal(past.length, 2);
  assert.equal(future.length, 0);
});

test("buildMiniChart returns area/body/tail paths and last point", () => {
  const result = buildMiniChart([1, 2, 3, 4, 5], { width: 132, height: 40, tailCount: 2 });
  assert.ok(result.area.startsWith("M"));
  assert.ok(result.full.startsWith("M"));
  assert.equal(result.points.length, 5);
  assert.equal(result.last.x, 132);
});

// ORTAK OLCEK — gecmis ve projeksiyon ayri olceklenirse cizgi kopuk baslar.
test("makeScale tum degerleri ayni alandan olcekler", () => {
  const sc = makeScale([10, 20, 30, 90], { width: 300, height: 100, padTop: 10, padBottom: 10 });
  // en kucuk deger tabanda, en buyuk tepede
  assert.equal(Math.round(sc.toY(10)), 90);
  assert.equal(Math.round(sc.toY(90)), 10);
  // ayni alandan olcekleyen iki dizi ucnoktada ORTUSUR
  const past = sc.toPoints([10, 20, 30], { count: 4, offset: 0 });
  const future = sc.toPoints([30, 90], { count: 4, offset: 2 });
  assert.equal(past[2].x, future[0].x);
  assert.equal(past[2].y, future[0].y);
});

test("makeScale hedef degerini de ayni alanda konumlandirir", () => {
  // hedef veri araliginin USTUNDE: alana dahil edilmezse tuvalin disina duser
  const sc = makeScale([40, 50, 72], { width: 300, height: 100, padTop: 10, padBottom: 10 });
  const y = sc.toY(72);
  assert.ok(y >= 10 && y <= 90, `hedef tuval icinde olmali, y=${y}`);
});

test("makeScale bozuk degerleri yok sayar, cokmez", () => {
  const sc = makeScale([null, undefined, NaN, 5, 15], { width: 100, height: 50 });
  assert.equal(sc.min, 5);
  assert.equal(sc.max, 15);
  assert.equal(sc.toY("abc"), null);
});

// Grafik bir NET grafigi; ozet egilimi anlatmali, dugumleri degil.
test("buildChartSummary egilimi ve tahmini anlatir", () => {
  const s = buildChartSummary({ values: [50, 55, 58.25], projection: [71], target: 72 });
  assert.match(s, /3 ölçüm/);
  assert.match(s, /8.3 net artış/);
  assert.match(s, /Tahmin 71 net/);
  assert.match(s, /Hedef 72 net/);
});

test("buildChartSummary veri yoksa sakin bir cumle doner", () => {
  assert.equal(buildChartSummary({ values: [] }), "Net grafiği: henüz veri yok.");
  assert.equal(buildChartSummary({}), "Net grafiği: henüz veri yok.");
});
