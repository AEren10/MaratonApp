import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const purchases = readFileSync(new URL("../../src/lib/purchases.js", import.meta.url), "utf8");
const paywall = readFileSync(new URL("../../src/screens/premium/PaywallScreen.js", import.meta.url), "utf8");

test("RevenueCat keys come from Expo public env instead of placeholders", () => {
  assert.match(purchases, /EXPO_PUBLIC_REVENUECAT_IOS_API_KEY/);
  assert.match(purchases, /EXPO_PUBLIC_REVENUECAT_ANDROID_API_KEY/);
  assert.doesNotMatch(purchases, /YOUR_REVENUECAT_IOS_API_KEY/);
  assert.doesNotMatch(purchases, /YOUR_REVENUECAT_ANDROID_API_KEY/);
});

test("paywall trial fallback is limited to dev when RevenueCat is not configured", () => {
  assert.match(paywall, /if \(__DEV__ && user\?\.id && !purchasesStatus\.configured\)/);
  assert.match(paywall, /Satın alma hazır değil/);
});
