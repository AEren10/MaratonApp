import assert from "node:assert/strict";
import test from "node:test";

import {
  routeCreationSummary,
  routeReadinessSummary,
} from "../../src/domain/route/routeCreation.js";

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

test("summarizes route readiness with actionable warnings", () => {
  const readiness = routeReadinessSummary({
    weeks: [{ stops: [{}, {}] }],
    daysLeft: 82,
    intelligence: {
      confidenceScore: 72,
      risks: [{ code: "capacity_low_confidence" }],
    },
    forecast: { sampleSize: 3 },
    tempoScenarios: [{}, {}, {}],
  });

  assert.equal(readiness.status, "partial");
  assert.equal(readiness.warnings, 1);
  assert.equal(readiness.blockers, 0);
  assert.ok(readiness.score < 80);
  assert.equal(readiness.checks.find((check) => check.key === "tempo").status, "warn");
});

test("blocks route readiness when no first-week preview exists", () => {
  const readiness = routeReadinessSummary({
    weeks: [],
    intelligence: { confidenceScore: 40, risks: [] },
  });

  assert.equal(readiness.status, "blocked");
  assert.equal(readiness.blockers, 1);
  assert.equal(readiness.checks.find((check) => check.key === "first_week").status, "block");
});
