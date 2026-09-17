import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const summaryScreen = readFileSync(
  new URL("../../src/screens/study/SummaryScreen.js", import.meta.url),
  "utf8",
);

test("monthly summary unlock uses the central locked feature gate", () => {
  assert.match(summaryScreen, /import \{ useLockedFeatureEntry \} from "\.\.\/\.\.\/hooks\/useLockedFeatureEntry";/);
  assert.match(summaryScreen, /const enterLocked = useLockedFeatureEntry\(\);/);
  assert.match(summaryScreen, /enterLocked\("monthly_report"\)/);
  assert.doesNotMatch(summaryScreen, /navigate\(SCREENS\.PAYWALL/);
});
