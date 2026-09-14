import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const summaryScreen = readFileSync(
  new URL("../../src/screens/study/SummaryScreen.js", import.meta.url),
  "utf8",
);

test("monthly summary unlock uses the central premium paywall gate", () => {
  assert.match(summaryScreen, /import \{ usePremium \} from "\.\.\/\.\.\/contexts\/PremiumContext";/);
  assert.match(summaryScreen, /const \{ showPaywall \} = usePremium\(\);/);
  assert.match(summaryScreen, /showPaywall\("monthly_report"\)/);
  assert.doesNotMatch(summaryScreen, /navigate\(SCREENS\.PAYWALL/);
});
