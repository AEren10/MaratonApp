import assert from "node:assert/strict";
import test from "node:test";

import { dailyPlanRiskCopy } from "../../src/domain/plan/dailyPlanRiskCopy.js";

test("returns null when daily plan has no known risk", () => {
  assert.equal(dailyPlanRiskCopy([]), null);
  assert.equal(dailyPlanRiskCopy([{ code: "unknown", level: "high" }]), null);
});

test("selects the highest priority known daily plan risk", () => {
  const copy = dailyPlanRiskCopy([
    { code: "route_not_attached", level: "low" },
    { code: "plan_data_missing", level: "medium" },
  ]);

  assert.equal(copy.code, "plan_data_missing");
  assert.equal(copy.title, "Veri bekleniyor");
  assert.match(copy.body, /program netleşir/);
});

test("explains sparse route signals without blocking the plan", () => {
  const copy = dailyPlanRiskCopy([{ code: "route_signal_sparse", level: "medium" }]);

  assert.equal(copy.title, "Güven başlangıçta");
  assert.match(copy.body, /Rota kullanılabilir/);
});

test("explains an underfilled daily plan as a safe route limitation", () => {
  const copy = dailyPlanRiskCopy([{ code: "plan_underfilled", level: "medium" }]);

  assert.equal(copy.title, "Hedef tam dolmadı");
  assert.match(copy.body, /güvenli görev havuzu/);
});
