import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const storageScope = readFileSync(
  new URL("../../src/lib/storage/userScopedStorage.js", import.meta.url),
  "utf8",
);

test("durable retry and analytics buffers survive auth cleanup", () => {
  const listStart = storageScope.indexOf("export const USER_SCOPED_KEYS = [");
  const listEnd = storageScope.indexOf("];", listStart);
  const userScopedKeys = storageScope.slice(listStart, listEnd);

  assert.doesNotMatch(userScopedKeys, /STORAGE_KEYS\.PENDING_STREAK/);
  assert.doesNotMatch(userScopedKeys, /STORAGE_KEYS\.ANALYTICS_BUFFER/);
  assert.match(storageScope, /PENDING_STREAK ve ANALYTICS_BUFFER zaten/);
});
