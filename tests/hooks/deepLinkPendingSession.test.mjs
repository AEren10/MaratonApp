import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync("src/hooks/useDeepLink.js", "utf8");

test("pending deep links are consumed per signed-in user, not once per app lifetime", () => {
  assert.match(source, /const pendingConsumedFor = useRef\(null\);/);
  assert.match(source, /const sessionUserId = session\?\.user\?\.id \|\| null;/);
  assert.match(source, /pendingConsumedFor\.current = null;/);
  assert.match(source, /if \(pendingConsumedFor\.current === sessionUserId\) return;/);
  assert.match(source, /pendingConsumedFor\.current = sessionUserId;/);
});

test("referral pending code is preserved until ReferralScreen applies it", () => {
  assert.match(source, /getString\(PENDING_KEY\)\.catch\(\(\) => null\)/);
  assert.match(source, /remove\(\) ETMİYORUZ/);
  assert.doesNotMatch(source, /else if \(referralCode\) \{[\s\S]*remove\(PENDING_KEY\)/);
});

test("pending referral navigation records link open, not reward conversion", () => {
  assert.match(source, /track\(EVENTS\.DEEP_LINK_OPENED, \{ type: "referral", source: "deep_link_pending" \}\)/);
  assert.doesNotMatch(source, /deep_link_pending" \}\);\s*navigation\.navigate[\s\S]*REFERRAL_LINK_APPLIED/);
});
