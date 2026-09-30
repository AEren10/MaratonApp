import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

function src(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("free V1 does not configure or package RevenueCat", () => {
  const packageJson = JSON.parse(src("package.json"));
  const premiumContext = src("src/contexts/PremiumContext.js");
  const envExample = src(".env.example");

  assert.equal(packageJson.dependencies["react-native-purchases"], undefined);
  assert.doesNotMatch(premiumContext, /initPurchases|lib\/purchases/);
  assert.doesNotMatch(envExample, /REVENUECAT/);
});
