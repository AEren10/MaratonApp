import assert from "node:assert/strict";
import test from "node:test";

import { buildRouteActionInsightChips } from "../../src/domain/route/routeActionInsightChips.js";

test("builds visible route action decision chips from metadata", () => {
  const chips = buildRouteActionInsightChips({
    reasonCode: "LOW_ACCURACY",
    confidenceLabel: "orta",
    effort: "40 soru · ~60 dk",
    impact: "~+1.2 net potansiyeli",
  });

  assert.deepEqual(chips.map((item) => item.label), [
    "Zayıf alan",
    "Güven orta",
    "40 soru · ~60 dk",
    "~+1.2 net potansiyeli",
  ]);
});

test("does not show unknown or empty action signals", () => {
  const chips = buildRouteActionInsightChips({ reasonCode: "UNKNOWN", confidenceLabel: null });

  assert.deepEqual(chips, []);
});

test("limits chips so the route card stays compact", () => {
  const chips = buildRouteActionInsightChips({
    reasonCode: "REVIEW_DUE",
    confidenceLabel: "yüksek",
    effort: "30 soru",
    impact: "~+0.8 net potansiyeli",
    isReview: true,
  });

  assert.equal(chips.length, 4);
  assert.equal(chips.at(-1).key, "impact");
});
