import assert from "node:assert/strict";
import test from "node:test";

import { resolveRouteReadyCurrentNet } from "../../src/domain/route/routeReadySummary.js";

test("route ready current net prefers normalized latest trial over baseline", () => {
  const latestTrial = { totalNet: 58.25, normalizedTotalNet: 61.5 };

  assert.equal(resolveRouteReadyCurrentNet(latestTrial, 45), 61.5);
});

test("route ready current net uses raw latest trial when normalized net is missing", () => {
  const latestTrial = { totalNet: "58.25" };

  assert.equal(resolveRouteReadyCurrentNet(latestTrial, 45), 58.25);
});

test("route ready current net falls back to onboarding baseline net", () => {
  assert.equal(resolveRouteReadyCurrentNet(null, "47.75"), 47.75);
});

test("route ready current net fails closed when both sources are empty", () => {
  assert.equal(resolveRouteReadyCurrentNet({ totalNet: "net yok" }, "baslangic yok"), null);
});
