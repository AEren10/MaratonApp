import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { buildNetChart } from "../../src/domain/route/netChartData.js";

const introSource = readFileSync(
  new URL("../../src/screens/roadmap/components/RouteNetIntro.js", import.meta.url),
  "utf8",
);
const chartSource = readFileSync(
  new URL("../../src/screens/roadmap/components/RouteDetailChart.js", import.meta.url),
  "utf8",
);
const modalSource = readFileSync(
  new URL("../../src/screens/roadmap/components/RouteTrialModal.js", import.meta.url),
  "utf8",
);

test("buildNetChart preserves trial object on each stop for interactive inspection", () => {
  const trialA = { id: "t1", date: "2026-06-17", trialType: "TYT", totalNet: 52, publisherNameSnapshot: "3D" };
  const trialB = { id: "t2", date: "2026-10-06", trialType: "TYT", totalNet: 64, publisherNameSnapshot: "Bilgi Sarmal" };
  const chart = buildNetChart({ trials: [trialA, trialB], types: ["TYT"], target: 80 });

  assert.equal(chart.stops.length, 2);
  assert.equal(chart.stops[0].trial.id, "t1");
  assert.equal(chart.stops[0].trial.publisherNameSnapshot, "3D");
  assert.equal(chart.stops[1].trial.id, "t2");
  assert.equal(chart.stops[1].trial.publisherNameSnapshot, "Bilgi Sarmal");
});

test("RouteDetailChart renders interactive node pressables and selection ring", () => {
  assert.match(chartSource, /onSelectStop/);
  assert.match(chartSource, /selectedIndex/);
  assert.match(chartSource, /s\.touchNode/);
  assert.match(chartSource, /s\.selectRing/);
  assert.match(chartSource, /s\.datePress/);
});

test("RouteNetIntro displays hint text and handles trial modal state", () => {
  assert.match(introSource, /Detay için noktalara dokun/);
  assert.match(introSource, /selectedStop/);
  assert.match(introSource, /RouteTrialModal/);
  assert.match(introSource, /onOpenTrialDetail/);
});

test("RouteTrialModal renders publisher, formatted net, and navigation to trial detail", () => {
  assert.match(modalSource, /CenterCard/);
  assert.match(modalSource, /getTrialPublisher/);
  assert.match(modalSource, /RouteTrialSubjects/);
  assert.match(modalSource, /Deneme Detayına Git/);
});
