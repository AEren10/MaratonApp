import test from "node:test";
import assert from "node:assert/strict";

import { paywallContextFor, PAYWALL_CONTEXTS } from "../../src/constants/paywallContexts.js";
import { PREVIEW_HISTORY } from "../../src/constants/proPreviewVariants.js";

test("trial history unlock shows 'Paywall · Geçmiş' (topic_progress)", () => {
  assert.equal(paywallContextFor("trial_history"), PAYWALL_CONTEXTS.topic_progress);
  assert.equal(paywallContextFor("trial_entry_limit"), PAYWALL_CONTEXTS.topic_progress);
});

test("locked route screen has no context and renders 'Paywall Anı'", () => {
  assert.equal(paywallContextFor("route_gate"), null);
  assert.equal(paywallContextFor("pro_preview"), null);
});

test("open count carries the Turkish possessive suffix", () => {
  assert.match(PREVIEW_HISTORY.countMeta(2), /2'si açık$/);
  assert.match(PREVIEW_HISTORY.countMeta(3), /3'ü açık$/);
  assert.match(PREVIEW_HISTORY.countMeta(10), /10'u açık$/);
  assert.match(PREVIEW_HISTORY.countMeta(6), /6'sı açık$/);
});
