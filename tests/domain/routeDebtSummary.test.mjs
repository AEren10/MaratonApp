import assert from "node:assert/strict";
import test from "node:test";

import { buildRouteDebtSummary } from "../../src/domain/route/routeDebtSummary.js";

test("returns null when there is no route debt", () => {
  assert.equal(buildRouteDebtSummary({ debt: { hasDebt: false, totalMinutes: 0 } }), null);
});

test("summarizes capped debt without shaming the user", () => {
  const summary = buildRouteDebtSummary({
    debt: {
      capped: true,
      hasDebt: true,
      totalMinutes: 600,
      totalQuestions: 300,
    },
    debtPlan: { assigned: 180, uncovered: 120 },
    debtWeeks: 3,
  });

  assert.equal(summary.capped, true);
  assert.equal(summary.uncovered, 120);
  assert.equal(summary.stats[0].value, "~10 sa");
  assert.match(summary.body, /ceza gibi büyütmez/);
  assert.match(summary.body, /haftalık kapasiteye/);
});

test("uses stop-based overdue debt shape from useStudyRoute", () => {
  const summary = buildRouteDebtSummary({
    debt: {
      capped: false,
      hasDebt: true,
      items: [{ key: "mat|fonksiyon" }],
      totalMinutes: 90,
      totalQuestions: 60,
      weeks: 0.5,
    },
    debtWeeks: 0.5,
  });

  assert.equal(summary.stats[0].value, "~2 sa");
  assert.equal(summary.stats[1].value, "0.5 hafta");
  assert.equal(summary.stats[2].value, "bekliyor");
});
