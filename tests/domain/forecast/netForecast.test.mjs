import test from "node:test";
import assert from "node:assert/strict";
import { forecastNet } from "../../../src/lib/netForecast.js";

const trial = (date, raw, normalized = null, type = "TYT") => ({
  date, totalNet: raw, normalizedTotalNet: normalized, trialType: type,
});

test("requires at least three valid trials of one exam type", () => {
  const result = forecastNet([
    trial("2026-01-01", 40, null, "TYT"),
    trial("2026-01-08", 42, null, "TYT"),
    trial("2026-01-15", 60, null, "AYT"),
  ], "2026-02-01", 120);
  assert.equal(result, null);
});

test("prefers normalized net and returns OLS prediction interval metadata", () => {
  const result = forecastNet([
    trial("2026-01-01", 40, 44),
    trial("2026-01-08", 50, 49),
    trial("2026-01-15", 45, 51),
    trial("2026-01-22", 60, 58),
  ], "2026-02-05", 120);
  assert.equal(result.valueBasis, "normalized");
  assert.equal(result.current, 58);
  assert.equal(result.sampleSize, 4);
  assert.equal(result.predictionInterval.method, "ols_prediction");
  assert.equal(result.predictionInterval.level, 0.95);
  assert.ok(result.predictionInterval.margin > 0);
  assert.equal(result.range.low < result.projected, true);
  assert.equal(result.range.high > result.projected, true);
});

test("uses only the most recent five trials and respects the exam ceiling", () => {
  const dates = [
    "2026-01-01", "2026-01-08", "2026-01-15", "2026-01-22",
    "2026-01-29", "2026-02-05", "2026-02-12",
  ];
  const trials = dates.map((date, index) => trial(date, 110 + index * 3));
  const result = forecastNet(trials, "2026-06-20", 120);
  assert.equal(result.sampleSize, 5);
  assert.equal(result.projected, 120);
});

test("does not claim zero uncertainty for a tiny perfectly linear sample", () => {
  const result = forecastNet([
    trial("2026-01-01", 40), trial("2026-01-08", 42), trial("2026-01-15", 44),
  ], "2026-02-01", 120);
  assert.equal(result.predictionInterval.floorApplied, true);
  assert.ok(result.predictionInterval.margin >= 2.4);
});

test("can forecast compatible legacy and field-specific trial types together", () => {
  const result = forecastNet([
    trial("2026-01-01", 30, null, "AYT"),
    trial("2026-01-08", 34, null, "AYT_SAY"),
    trial("2026-01-15", 38, null, "AYT"),
  ], "2026-02-01", 80, ["AYT_SAY", "AYT"]);
  assert.equal(result.sampleSize, 3);
  assert.equal(result.current, 38);
});

test("uzaga uzatilan tahminin payi yakina uzatilandan genistir", () => {
  const trials = [
    trial("2026-01-01", 40), trial("2026-01-08", 42), trial("2026-01-15", 44),
  ];
  const near = forecastNet(trials, "2026-02-01", 120);
  const far = forecastNet(trials, "2027-09-20", 120);
  assert.ok(far.predictionInterval.margin > near.predictionInterval.margin);
  assert.equal(far.predictionInterval.floorApplied, true);
});

test("pay ust sinira takilir, aralik okunamaz hale gelmez", () => {
  const result = forecastNet([
    trial("2026-01-01", 40), trial("2026-01-15", 42), trial("2026-01-29", 44),
  ], "2030-01-01", 120);
  assert.ok(result.predictionInterval.margin <= 120 * 0.18 + 0.001);
});

test("14 gunden kisa ornekte sinav gunune uzatma yapmaz", () => {
  const result = forecastNet([
    trial("2026-01-01", 40), trial("2026-01-05", 42), trial("2026-01-10", 41),
  ], "2026-06-20", 120);
  assert.equal(result, null);
});

test("dususteki kisa seri sinav gununde sifira cokmez", () => {
  const result = forecastNet([
    trial("2026-09-01", 44.5),
    trial("2026-09-15", 46.05),
    trial("2026-09-28", 42.75),
  ], "2027-06-20", 120);
  assert.ok(result.projected >= 42.75 * 0.5);
  assert.ok(result.range.low >= 42.75 * 0.5);
  assert.equal(result.predictionInterval.projectionMethod, "damped_mean_reversion");
});

test("cok deneme ve kisa uzatma dar pay verir", () => {
  const result = forecastNet([
    trial("2026-01-01", 40), trial("2026-02-01", 46), trial("2026-03-01", 49),
    trial("2026-04-01", 55), trial("2026-05-01", 58), trial("2026-06-01", 63),
  ], "2026-09-01", 120);
  assert.ok(result.predictionInterval.margin < 6);
  assert.equal(result.confidence, "high");
});
