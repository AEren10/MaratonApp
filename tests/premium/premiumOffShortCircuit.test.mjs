import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { PREMIUM_ENABLED } from "../../src/constants/premium.js";
import { canAccessProductFeature, trialQuotaDecision } from "../../src/domain/premium/paywallGate.js";

test("premium off: no feature is ever locked, even with unknown or failed access", () => {
  assert.equal(PREMIUM_ENABLED, false);
  for (const accessState of ["loading", "error", "ready"]) {
    assert.equal(canAccessProductFeature({ accessState, features: {}, featureKey: "route" }), true);
  }
  assert.equal(trialQuotaDecision({ accessState: "error", quota: { used: 99, limit: 1 } }).allowed, true);
});

test("premium off: access loading/error never block trial save or feature entry", () => {
  const ctx = readFileSync(new URL("../../src/contexts/PremiumContext.js", import.meta.url), "utf8");
  assert.match(ctx, /accessError: PREMIUM_ENABLED && accessState === "error"/);
  assert.match(ctx, /accessLoading: PREMIUM_ENABLED && accessState === "loading"/);
});
