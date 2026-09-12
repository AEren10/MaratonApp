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

