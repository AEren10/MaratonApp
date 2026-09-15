import assert from "node:assert/strict";
import test from "node:test";

import { buildComebackRecommendation } from "../../src/domain/route/comebackRecommendation.js";

test("comeback recommendation uses the real next task effort", () => {
  const rec = buildComebackRecommendation({
    subjectLabel: "Matematik",
    topicLabel: "Problemler",
    questionCount: 18,
    estimatedMinutes: 27,
  });

  assert.equal(rec.value, 27);
  assert.equal(rec.unit, "dk");
  assert.equal(rec.kicker, "Matematik");
  assert.equal(rec.title, "Problemler");
  assert.equal(rec.effort, "18 soru · ~27 dk");
  assert.equal(rec.primaryLabel, "27 dakikayla başla");
});

test("comeback recommendation does not invent effort without task data", () => {
  const rec = buildComebackRecommendation(null);

  assert.equal(rec.value, null);
  assert.equal(rec.unit, null);
  assert.equal(rec.title, "Bugünkü plana yumuşak dönüş");
  assert.equal(rec.effort, "Bugünkü plandan küçük bir adım");
  assert.equal(rec.primaryLabel, "Küçük adımla başla");
});

test("comeback recommendation can fall back to route stop cost", () => {
  const rec = buildComebackRecommendation({
    label: "Paragraf tekrar",
    routeStop: {
      subjectLabel: "Türkçe",
      cost: { questions: 12, minutes: 16 },
    },
  });

  assert.equal(rec.value, 16);
  assert.equal(rec.unit, "dk");
  assert.equal(rec.kicker, "Türkçe");
  assert.equal(rec.title, "Paragraf tekrar");
  assert.equal(rec.effort, "12 soru · ~16 dk");
});
