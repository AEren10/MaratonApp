import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const source = readFileSync(
  new URL("../../src/hooks/useLockedFeatureEntry.js", import.meta.url),
  "utf8",
);

test("pro preview storage failures do not block locked feature entry", () => {
  assert.match(source, /isProPreviewSeen\(source, requestedUserId\)\.catch\(\(\) => false\)/);
  assert.match(source, /markProPreviewSeen\(source, requestedUserId\)\.catch\(\(\) => \{\}\)/);
});

test("pro preview entry is cancelled if auth changes while local state loads", () => {
  assert.match(source, /const activeUserRef = useRef\(user\?\.id \|\| null\);/);
  assert.match(source, /activeUserRef\.current = user\?\.id \|\| null;/);
  assert.match(source, /const requestedUserId = user\?\.id \|\| null;/);
  assert.match(source, /if \(activeUserRef\.current !== requestedUserId\) return false;/);
});
