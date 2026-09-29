import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

function src(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("wrong detail ignores legacy community parameters in V1", () => {
  const screen = src("src/screens/wrong-notebook/WrongDetailScreen.js");

  assert.match(screen, /return <OwnWrongDetail \/>;/);
  assert.doesNotMatch(screen, /CommunityQuestionDetail/);
  assert.doesNotMatch(screen, /params\??\.community/);
});

test("production navigation keeps legacy premium names as Home redirects", () => {
  const registry = src("src/navigation/screenRegistry.js");
  const assignment = src("src/navigation/tabAssignment.js");
  const navigator = src("src/navigation/AppNavigator.js");

  assert.doesNotMatch(registry, /screens\/premium\//);
  assert.match(registry, /SCREENS\.PAYWALL, LegacyHomeRedirectScreen/);
  assert.match(registry, /SCREENS\.PAYMENT_CARD, LegacyHomeRedirectScreen/);
  assert.match(registry, /SCREENS\.PREMIUM, LegacyHomeRedirectScreen/);
  assert.match(assignment, /ROOT_ONLY = \[[\s\S]*SCREENS\.SUBSCRIPTION/);
  assert.doesNotMatch(navigator, /useAccessEndedMoment/);
});

test("free V1 has no visible subscription or premium Home branch", () => {
  const settings = src("src/screens/settings/SettingsScreen.js");
  const home = src("src/screens/home/HomeScreen.js");
  const actions = src("src/screens/home/useHomeActions.js");

  assert.doesNotMatch(settings, /Abonelik ve hesap|hasSubscription/);
  assert.doesNotMatch(home, /HomeFreeBody|hasRouteAccess/);
  assert.doesNotMatch(actions, /PRO_PREVIEW|FIRST_WEEK/);
});
