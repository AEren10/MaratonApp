import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const auth = readFileSync(new URL("../../src/supabase/auth.js", import.meta.url), "utf8");
const settingsActions = readFileSync(new URL("../../src/screens/settings/useSettingsActions.js", import.meta.url), "utf8");

test("deleteAccount aborts before deleting auth user when storage cleanup fails", () => {
  assert.match(auth, /class StorageCleanupFailedError extends Error/);
  assert.match(auth, /if \(storageFailures\.length\) \{\s*throw new StorageCleanupFailedError\(storageFailures\);/);

  const failureIndex = auth.indexOf("throw new StorageCleanupFailedError(storageFailures)");
  const rpcIndex = auth.indexOf('supabase.rpc("delete_own_account")');
  assert.ok(failureIndex > -1, "storage cleanup failure guard should exist");
  assert.ok(rpcIndex > failureIndex, "delete_own_account should run only after storage cleanup succeeds");
});

test("settings account deletion shows safe storage cleanup failures", () => {
  assert.match(settingsActions, /error\?\._safeMessage/);
});
