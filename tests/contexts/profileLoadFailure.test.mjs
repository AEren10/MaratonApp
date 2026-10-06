import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const context = readFileSync("src/contexts/ExamContext.js", "utf8");
const navigator = readFileSync("src/navigation/AppNavigator.js", "utf8");

test("failed profile reads do not mark the profile ready", () => {
  assert.match(context, /let succeeded = false/);
  assert.match(context, /if \(succeeded\) setProfileReadyFor\(userId\)/);
  assert.match(context, /setProfileLoadErrorFor\(userId\)/);
});

test("profile error offers an explicit retry instead of opening setup", () => {
  assert.match(context, /const retryProfileLoad = useCallback/);
  assert.match(context, /setProfileRetryNonce\(\(value\) => value \+ 1\)/);
  assert.match(navigator, /ROOT_GATE\.PROFILE_ERROR/);
  assert.match(navigator, /ProfileLoadFailure onRetry=\{retryProfileLoad\}/);
});
