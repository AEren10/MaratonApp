import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../src/hooks/usePaywallTrigger.js", import.meta.url),
  "utf8",
);

test("study session paywall trigger opens through the central premium gate", () => {
  assert.match(source, /const \{ showPaywall \} = usePremium\(\);/);
  assert.match(source, /const opened = showPaywall\(source\);/);
  assert.doesNotMatch(source, /useNavigation/);
  assert.doesNotMatch(source, /SCREENS\.PAYWALL/);
  assert.doesNotMatch(source, /navigation\.navigate/);
});

test("study session paywall is marked shown only after the central gate opens it", () => {
  assert.match(source, /if \(opened\) \{\s*setString\(userScopedKey\(STORAGE_KEYS\.PAYWALL_SHOWN_SESSION/);
  assert.doesNotMatch(source, /effectiveCount >= SESSION_THRESHOLD[\s\S]*?setString\(shownKey, "true"\)/);
});

test("delayed study paywall is cancelled across auth changes", () => {
  assert.match(source, /const timerUserRef = useRef\(null\);/);
  assert.match(source, /const scheduledUserId = user\?\.id \|\| null;/);
  assert.match(source, /if \(timerUserRef\.current !== scheduledUserId\) return;/);
  assert.match(source, /useEffect\(\(\) => clearPaywallTimer, \[clearPaywallTimer, user\?\.id\]\)/);
});

test("delayed study paywall storage mark is best-effort", () => {
  assert.match(source, /setString\(userScopedKey\(STORAGE_KEYS\.PAYWALL_SHOWN_SESSION, scheduledUserId\), "true"\)\s*\.catch\(\(\) => \{\}\)/);
});
