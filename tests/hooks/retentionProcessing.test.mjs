import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(new URL("../../src/hooks/useRetention.js", import.meta.url), "utf8");

test("retention processing key changes when fresh retention data arrives", () => {
  assert.match(source, /const processKey = \[/);
  assert.match(source, /retentionData\.lastActive \|\| ""/);
  assert.match(source, /retentionData\.loginRewardedDate \|\| ""/);
  assert.doesNotMatch(source, /processedFor\.current === activeUserId/);
});

test("daily login is marked on the server only after the local reward fires", () => {
  const rewardIndex = source.indexOf('reward("daily_login")');
  const markIndex = source.indexOf("markLoginRewarded(user.id)");
  assert.notEqual(rewardIndex, -1);
  assert.notEqual(markIndex, -1);
  assert.ok(markIndex > rewardIndex);
});
