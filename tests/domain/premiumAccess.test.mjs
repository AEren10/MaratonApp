import test from "node:test";
import assert from "node:assert/strict";

import {
  PRODUCT_FEATURES,
  PREMIUM_TO_PRODUCT_FEATURE,
} from "../../src/constants/premium.js";

import {
  canAccessProductFeature,
  canShowPaywall,
  EXAM_PHASE,
  firstWeekStatus,
  trialQuotaDecision,
} from "../../src/domain/premium/paywallGate.js";

test("first week includes days one through seven and closes at the boundary", () => {
  const createdAt = new Date("2026-09-01T09:00:00.000Z");
  assert.equal(firstWeekStatus(createdAt, new Date("2026-09-08T08:59:59.999Z")).inFirstWeek, true);
  assert.equal(firstWeekStatus(createdAt, new Date("2026-09-08T09:00:00.000Z")).inFirstWeek, false);
});

test("paywall stays suppressed during the first week", () => {
  const result = canShowPaywall({
    isPremium: false,
    createdAt: "2026-09-01T09:00:00.000Z",
    now: new Date("2026-09-07T09:00:00.000Z"),
  });
  assert.deepEqual(result, { allowed: false, reason: "first_week", dayNumber: 7, daysLeft: 1 });
});

test("paywall stays suppressed during exam eve, exam day and aftermath", () => {
  for (const phase of [EXAM_PHASE.EXAM_EVE, EXAM_PHASE.EXAM_DAY, EXAM_PHASE.AFTERMATH]) {
    assert.deepEqual(canShowPaywall({
      isPremium: false,
      createdAt: "2026-08-01T09:00:00.000Z",
      examPhase: phase,
      now: new Date("2026-09-12T09:00:00.000Z"),
    }), { allowed: false, reason: `exam_phase_${phase}` });
  }
});

test("paywall is allowed outside grace and protected exam phases", () => {
  assert.deepEqual(canShowPaywall({
    isPremium: false,
    createdAt: "2026-08-01T09:00:00.000Z",
    examPhase: EXAM_PHASE.APPROACHING,
    now: new Date("2026-09-12T09:00:00.000Z"),
  }), { allowed: true, reason: null });
});

test("product features fail closed until the server snapshot is ready", () => {
  assert.equal(canAccessProductFeature({
    accessState: "loading", features: { route: true }, featureKey: "route",
  }), false);
  assert.equal(canAccessProductFeature({
    accessState: "error", features: { route: true }, featureKey: "route",
  }), false);
  assert.equal(canAccessProductFeature({
    accessState: "ready", features: { route: true }, featureKey: "route",
  }), true);
});

test("trial quota permits four, then blocks the fifth", () => {
  assert.deepEqual(trialQuotaDecision({
    accessState: "ready", quota: { remaining: 1, unlimited: false },
  }), { allowed: true, reason: null, remaining: 1 });
  assert.deepEqual(trialQuotaDecision({
    accessState: "ready", quota: { remaining: 0, unlimited: false },
  }), { allowed: false, reason: "quota_exhausted", remaining: 0 });
});

test("grace or premium quota is unlimited", () => {
  assert.deepEqual(trialQuotaDecision({
    accessState: "ready", quota: { remaining: null, unlimited: true },
  }), { allowed: true, reason: null, remaining: Infinity });
});

test("unknown quota never fails open", () => {
  assert.deepEqual(trialQuotaDecision({ accessState: "ready", quota: null }), {
    allowed: false,
    reason: "access_unknown",
    remaining: null,
  });
});

test("premium feature catalog uses dedicated product access keys", () => {
  assert.equal(PRODUCT_FEATURES.topic_progress, "topicProgress");
  assert.equal(PRODUCT_FEATURES.department_threshold, "departmentThreshold");
  assert.notEqual(PRODUCT_FEATURES.topic_progress, PRODUCT_FEATURES.route_priorities);
  assert.equal(PREMIUM_TO_PRODUCT_FEATURE.rank_simulator, PRODUCT_FEATURES.route_forecast);
});
