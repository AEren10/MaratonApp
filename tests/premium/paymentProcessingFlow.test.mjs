import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");

test("payment processing screen uses the purchase flow instead of random mock outcomes", () => {
  const screen = read("../../src/screens/premium/PaymentProcessingScreen.js");

  assert.match(screen, /usePaywallPurchase\(\{ closeOnSuccess: false \}\)/);
  assert.match(screen, /navigation\.replace\(completed \? SCREENS\.PAYMENT_SUCCESS : SCREENS\.PAYMENT_FAILED\)/);
  assert.doesNotMatch(screen, /Math\.random/);
  assert.doesNotMatch(screen, /Mock API|80% success|preview purposes/);
});

test("paywall purchase handler can be reused by controlled processing screens", () => {
  const hook = read("../../src/hooks/usePaywallPurchase.js");

  assert.match(hook, /usePaywallPurchase\(\{ closeOnSuccess = true \} = \{\}\)/);
  assert.match(hook, /import \{ startTrial \} from "\.\.\/supabase\/profiles"/);
  assert.match(hook, /if \(closeOnSuccess\) navigation\.goBack\(\)/);
  assert.match(hook, /return true/);
  assert.match(hook, /return false/);
});

test("premium processing flow imports the back-blocking hook where it is used", () => {
  const processing = read("../../src/screens/premium/PaymentProcessingScreen.js");
  const firstRoute = read("../../src/screens/premium/FirstRouteReadyScreen.js");
  const studyProcessed = read("../../src/screens/premium/StudyProcessedScreen.js");

  for (const source of [processing, firstRoute, studyProcessed]) {
    assert.match(source, /import \{ useBlockBack \} from "\.\.\/\.\.\/hooks\/useBlockBack"/);
    assert.match(source, /useBlockBack\(true\)/);
  }
});
