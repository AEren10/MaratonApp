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
  const trials = Array.from({ length: 7 }, (_, index) => (
    trial(`2026-01-${String(1 + index * 3).padStart(2, "0")}`, 110 + index * 3)
  ));
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
