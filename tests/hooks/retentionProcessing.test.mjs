import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/hooks/useRetention.js", import.meta.url), "utf8");

test("retention processing key changes when fresh retention data arrives", () => {
  assert.match(source, /const processKey = \[/);
  assert.match(source, /retentionData\.lastActive \|\| ""/);
  assert.match(source, /retentionData\.loginRewardedDate \|\| ""/);
  assert.match(source, /localLoginRewarded \|\| ""/);
  assert.doesNotMatch(source, /processedFor\.current === activeUserId/);
});

test("daily login is marked on the server only after the local reward fires", () => {
  const rewardIndex = source.indexOf('reward("daily_login")');
  const markIndex = source.indexOf("markLoginRewarded(user.id)");
  assert.notEqual(rewardIndex, -1);
  assert.notEqual(markIndex, -1);
  assert.ok(markIndex > rewardIndex);
});

test("comeback and daily reward processing are deduped separately", () => {
  assert.match(source, /const comebackShownFor = useRef\(null\);/);
  assert.match(source, /const dailyRewardScheduledFor = useRef\(null\);/);
  assert.match(source, /const dailyRewardCompletedFor = useRef\(null\);/);
  assert.match(source, /const comebackKey = \[activeUserId, today, lastDate\]\.join\("\|"\);/);
  assert.match(source, /dailyRewardScheduledFor\.current === dailyKey/);
  assert.match(source, /dailyRewardCompletedFor\.current === dailyKey/);
});

test("daily login reward has a user-scoped local fallback before server mark", () => {
  assert.match(source, /getString\(userScopedKey\(STORAGE_KEYS\.LOGIN_REWARDED, user\.id\)\)/);
  assert.match(source, /const loginRewarded = localLoginRewarded === today \? today : retentionData\.loginRewardedDate/);
  assert.match(source, /setString\(userScopedKey\(STORAGE_KEYS\.LOGIN_REWARDED, user\.id\), today\)/);
});

test("retention UI state is reset when the signed-in user changes", () => {
  assert.match(source, /useEffect\(\(\) => \{\s+setComeback\(null\);/);
  assert.match(source, /processedFor\.current = null;/);
  assert.match(source, /comebackShownFor\.current = null;/);
  assert.match(source, /dailyRewardScheduledFor\.current = null;/);
  assert.match(source, /dailyRewardCompletedFor\.current = null;\s+\}, \[user\?\.id\]\);/);
});
