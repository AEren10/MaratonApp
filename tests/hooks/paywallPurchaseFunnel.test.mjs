import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/hooks/usePaywallPurchase.js", import.meta.url), "utf8");

test("paywall purchase funnel keeps a single source across view, dismiss, trial and purchase", () => {
  assert.match(source, /const paywallSource = route\.params\?\.source \|\| "unknown";/);
  assert.match(source, /track\(EVENTS\.PREMIUM_VIEWED, \{ source: paywallSource \}\)/);
  assert.match(source, /trackPaywallViewed\(paywallSource\)/);
  assert.match(source, /track\(EVENTS\.PREMIUM_DISMISSED, \{\s*source: paywallSource,\s*selectedPlan,/);
  assert.match(source, /track\(EVENTS\.TRIAL_STARTED, \{ source: paywallSource \}\)/);
  assert.match(source, /track\(EVENTS\.PREMIUM_PURCHASED, \{ plan: selectedPlan, source: paywallSource \}\)/);
});

test("successful restore is counted as conversion, not dismissal", () => {
  assert.match(source, /const isPro = await restorePurchases\(\);[\s\S]*?if \(isPro\) \{/);
  assert.match(source, /if \(isPro\) \{\s*convertedRef\.current = true;/);
  assert.match(source, /track\(EVENTS\.PREMIUM_PURCHASED, \{ plan: "restore", source: paywallSource \}\)/);
});

test("late RevenueCat offering responses cannot update a closed paywall", () => {
  assert.match(source, /let alive = true;/);
  assert.match(source, /if \(alive && offering\?\.availablePackages\) setPackages\(offering\.availablePackages\);/);
  assert.match(source, /\.catch\(\(\) => \{\}\);/);
  assert.match(source, /return \(\) => \{ alive = false; \};/);
});

test("purchase cancellation guard tolerates non-error throws", () => {
  assert.match(source, /if \(e\?\.userCancelled\) return;/);
  assert.doesNotMatch(source, /if \(e\.userCancelled\) return;/);
});
