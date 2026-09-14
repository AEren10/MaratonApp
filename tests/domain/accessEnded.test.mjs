import test from "node:test";
import assert from "node:assert/strict";

import { accessEndedDecision } from "../../src/domain/premium/accessEnded.js";

const grace = { accessMode: "onboarding_grace", isPremium: false, isFirstWeek: true };
const free = { accessMode: "free", isPremium: false, isFirstWeek: false };
const pro = { accessMode: "premium", isPremium: true, isFirstWeek: true };

test("first week is recorded, then free shows once", () => {
  const a = accessEndedDecision({ snapshot: grace, state: {} });
  assert.deepEqual(a, { show: false, next: { sawGrace: true } });
  const b = accessEndedDecision({ snapshot: free, state: a.next });
  assert.equal(b.show, true);
  assert.deepEqual(accessEndedDecision({ snapshot: free, state: b.next }), { show: false, next: null });
});

test("free user never observed in first week does not see it", () => {
  assert.deepEqual(accessEndedDecision({ snapshot: free, state: {} }), { show: false, next: null });
});

test("premium closes the moment so a later lapse is not called '7 gün doldu'", () => {
  const a = accessEndedDecision({ snapshot: pro, state: { sawGrace: true } });
  assert.equal(a.show, false);
  assert.equal(a.next.shown, true);
  assert.equal(accessEndedDecision({ snapshot: free, state: a.next }).show, false);
});
