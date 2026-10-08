import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const context = readFileSync("src/contexts/ExamContext.js", "utf8");
const navigator = readFileSync("src/navigation/AppNavigator.js", "utf8");
const failureScreen = readFileSync("src/components/common/ProfileLoadFailure.js", "utf8");

test("failed profile reads do not mark the profile ready", () => {
  assert.match(context, /let succeeded = false/);
  assert.match(context, /if \(succeeded\) \{[\s\S]{0,160}setProfileReadyFor\(userId\)/);
  assert.match(context, /setProfileLoadErrorFor\(userId\)/);
});

test("profile error offers an explicit retry instead of opening setup", () => {
  assert.match(context, /const retryProfileLoad = useCallback/);
  assert.match(context, /setProfileRetryNonce\(\(value\) => value \+ 1\)/);
  assert.match(navigator, /ROOT_GATE\.PROFILE_ERROR/);
  assert.match(navigator, /ProfileLoadFailure onRetry=\{retryProfileLoad\}/);
  assert.match(failureScreen, /<ScreenErrorBoundary>/);
});

test("automatic retry keeps the explicit error state until the server succeeds", () => {
  assert.match(context, /const backgroundProfileRetry = useRef\(false\)/);
  assert.match(context, /if \(!isBackgroundRetry\) setProfileLoadErrorFor\(null\)/);
  assert.match(context, /setTimeout\(retryProfileLoadInBackground, 30_000\)/);
  assert.match(context, /\[profileLoadErrorFor, profileRetryNonce, retryProfileLoadInBackground, userId\]/);
  assert.match(context, /if \(succeeded\) \{[\s\S]{0,120}setProfileLoadErrorFor\(null\)/);
});
