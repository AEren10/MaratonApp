import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const purchases = readFileSync(new URL("../../src/lib/purchases.js", import.meta.url), "utf8");
// Satin alma mantigi PaywallScreen'den usePaywallPurchase'a tasindi
// (AGENTS.md: is mantigi ekran dosyasinda durmaz). Degismez olan kural
// ayni: uretimde ucretsiz denemeye DUSULMEZ.
const paywall = readFileSync(new URL("../../src/hooks/usePaywallPurchase.js", import.meta.url), "utf8");

test("RevenueCat keys come from Expo public env instead of placeholders", () => {
  assert.match(purchases, /EXPO_PUBLIC_REVENUECAT_IOS_API_KEY/);
  assert.match(purchases, /EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY/);
  assert.doesNotMatch(purchases, /YOUR_REVENUECAT_IOS_API_KEY/);
  assert.doesNotMatch(purchases, /YOUR_REVENUECAT_ANDROID_API_KEY/);
});

test("RevenueCat app user is switched when the signed-in user changes", () => {
  assert.match(purchases, /let configuredAppUserId = null;/);
  assert.match(purchases, /const requestedUserId = userId \|\| null;/);
  assert.match(purchases, /if \(requestedUserId && configuredAppUserId !== requestedUserId\) \{\s*await Purchases\.logIn\(requestedUserId\);/);
  assert.match(purchases, /configuredAppUserId = requestedUserId;/);
  assert.match(purchases, /unavailableReason = initialized \? "login_failed" : "configure_failed";/);
});

test("paywall trial fallback is limited to dev when RevenueCat is not configured", () => {
  assert.match(paywall, /if \(__DEV__ && user\?\.id && !purchasesStatus\.configured\)/);
  assert.match(paywall, /Satın alma hazır değil/);
});
