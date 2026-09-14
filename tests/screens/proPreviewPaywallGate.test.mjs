import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../src/screens/premium/ProPreviewScreen.js", import.meta.url),
  "utf8",
);

test("pro preview CTA uses the central premium paywall gate", () => {
  assert.match(source, /import \{ usePremium \} from "\.\.\/\.\.\/contexts\/PremiumContext";/);
  assert.match(source, /const \{ showPaywall \} = usePremium\(\);/);
  assert.match(source, /showPaywall\(source \|\| "pro_preview"\)/);
  assert.doesNotMatch(source, /SCREENS\.PAYWALL/);
  assert.doesNotMatch(source, /navigation\.replace\(SCREENS\.PAYWALL/);
});
