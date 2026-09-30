import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { isUserSwitch, registerSessionReset, runSessionResets } from "../../src/lib/session/sessionReset.js";

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");

test("isUserSwitch: only a previous user leaving counts", () => {
  assert.equal(isUserSwitch(null, "a"), false, "first sign-in is not a switch");
  assert.equal(isUserSwitch("a", "a"), false, "token refresh keeps the same user");
  assert.equal(isUserSwitch("a", null), true, "session dropped");
  assert.equal(isUserSwitch("a", undefined), true);
  assert.equal(isUserSwitch("a", "b"), true, "recovery link for another account");
});

test("runSessionResets runs every reset even if one throws", () => {
  const calls = [];
  const offA = registerSessionReset(() => calls.push("a"));
  const offBad = registerSessionReset(() => { throw new Error("x"); });
  const offB = registerSessionReset(() => calls.push("b"));
  assert.equal(runSessionResets(), 1);
  assert.deepEqual(calls, ["a", "b"]);
  offA(); offBad(); offB();
  calls.length = 0;
  runSessionResets();
  assert.deepEqual(calls, []);
});

test("auth events, logout and deletion all reset local state", () => {
  const auth = read("src/contexts/AuthContext.js");
  assert.equal((auth.match(/tracker\.observe\(s\?\.user\?\.id\);\s+setSession\(s\);/g) || []).length, 2,
    "getSession and every auth event track user switches");
  assert.equal((auth.match(/await resetLocalSession\(\);/g) || []).length, 2, "logout + delete");
  assert.doesNotMatch(auth, /store\.dispatch|clearUserScopedStorage|cancelAllScheduled/, "cleanup lives in lib/session");

  const life = read("src/lib/session/sessionLifecycle.js");
  assert.match(life, /resetLocalSession\(\{ keepUserId: last \}\)/);
  const del = life.slice(life.indexOf("export async function deleteUserAccount"));
  assert.doesNotMatch(del, /cancelAllScheduled|unregisterPushToken/,
    "a failed delete must leave reminders and push token intact");

  assert.match(read("src/supabase/auth.js"), /_removeSession/, "offline sign-out still clears the stored session");
});

test("module stores keyed to the user register a session reset", () => {
  for (const file of [
    "src/hooks/useGamification.js",
    "src/hooks/usePlanContext.js",
    "src/hooks/useStudyRoute.js",
    "src/hooks/useDataSync.js",
    "src/hooks/useStopMoves.js",
    "src/hooks/useRouteHabits.js",
    "src/hooks/useDiscoverTips.js",
    "src/hooks/useDatedUserTasks.js",
    "src/lib/topicCompletion.js",
    "src/lib/weekdayRhythmStore.js",
    "src/lib/depthTone.js",
    "src/supabase/profiles.js",
  ]) {
    assert.match(read(file), /registerSessionReset\(/, file);
  }
  assert.match(read("src/lib/session/resetLocalSession.js"), /clearAllWidgets\(\)/);
  assert.match(read("src/lib/widgetSync.js"), /export function clearAllWidgets/);
  assert.match(read("src/lib/storage/userScopedStorage.js"), /STORAGE_KEYS\.DISCOVER_TIPS,/);
});
