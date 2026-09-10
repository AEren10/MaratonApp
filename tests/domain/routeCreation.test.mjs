import assert from "node:assert/strict";
import test from "node:test";

import { routeCreationSummary } from "../../src/domain/route/routeCreation.js";

test("summarizes a route creation preview before persistence", () => {
  const summary = routeCreationSummary({
    weeks: [{ stops: [{}, {}, {}] }],
    daysLeft: 94,
    intelligence: {
      confidence: "medium",
      confidenceScore: 68,
      risks: [{ code: "capacity_low_confidence" }],
      nextBestAction: "İlk hafta aktif durağı tamamla.",
    },
    routeCreated: false,
  });

  assert.equal(summary.title, "Rotanı oluşturalım");
  assert.equal(summary.actionLabel, "Rotayı oluştur");
  assert.equal(summary.confidenceLabel, "orta");
  assert.equal(summary.riskLabel, "Tempo verisi az");
  assert.equal(summary.firstWeekStops, 3);
  assert.equal(summary.daysLeftLabel, "94 gün");
  assert.equal(summary.hasPreview, true);
});

test("summarizes an existing route as re-analysis", () => {
  const summary = routeCreationSummary({ routeCreated: true });

  assert.equal(summary.title, "Rotan canlı ve takipte");
  assert.equal(summary.actionLabel, "Yeniden analiz et");
  assert.equal(summary.daysLeftLabel, "Tarih eksik");
  assert.equal(summary.hasPreview, false);
});
