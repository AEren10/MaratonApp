import test from "node:test";
import assert from "node:assert/strict";

import { CHART_H, CHART_W, chartFrame } from "../../src/components/charts/chartStyle.js";

test("telefonda tuval degismez", () => {
  assert.equal(chartFrame(0), null);
  assert.equal(chartFrame(346, 180), null);
  assert.equal(chartFrame(CHART_W), null);
});

test("genis kutuda yazi 1:1, tuval yatayda uzar", () => {
  const f = chartFrame(756, 180);
  assert.equal(f.h, CHART_H);
  assert.equal(f.vbW, Math.round((CHART_H * 756) / CHART_H));
  const own = chartFrame(756);
  assert.equal(own.h, CHART_H);
});

test("orantili buyutulmus grafik (Rota detay) aynen kalir", () => {
  const w = 756;
  const f = chartFrame(w, (CHART_H * w) / CHART_W);
  assert.equal(f.vbW, CHART_W);
});
