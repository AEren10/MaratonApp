import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { SCREENS } from "../../src/constants/screens.js";
import { ANALIZ_STACK, PROFIL_STACK, PROGRAM_STACK, ROTA_STACK } from "../../src/navigation/tabAssignment.js";
import { ROUTE_CONFIGS } from "../../src/navigation/routes.js";

test("public profile is registered in every social entry stack", () => {
  for (const stack of [ROTA_STACK, PROGRAM_STACK, ANALIZ_STACK, PROFIL_STACK]) {
    assert.ok(stack.includes(SCREENS.PUBLIC_PROFILE));
  }
  const registry = readFileSync("src/navigation/screenRegistry.js", "utf8");
  assert.match(registry, /screen\(SCREENS\.PUBLIC_PROFILE, PublicProfileScreen\)/);
  assert.equal(ROUTE_CONFIGS[SCREENS.PUBLIC_PROFILE].deepLink, false);
});

test("profile action is first and public screen never reads trial or net data", () => {
  const actions = readFileSync("src/hooks/useUserActions.js", "utf8");
  const start = actions.indexOf("showAlert(user.name");
  const menu = actions.slice(start, actions.indexOf("]);", start));
  assert.ok(menu.indexOf("Profili gör") < menu.indexOf("Arkadaş ekle"));
  assert.match(actions, /SCREENS\.PUBLIC_PROFILE/);

  const screen = readFileSync("src/screens/profile/PublicProfileScreen.js", "utf8");
  const hook = readFileSync("src/hooks/usePublicProfile.js", "utf8");
  assert.doesNotMatch(`${screen}\n${hook}`, /getTrials|trial_subjects|total_net|target_net|baseline_net/);
  assert.ok(screen.split("\n").length <= 150, "PublicProfileScreen must stay under 150 lines");
});

test("profile visibility uses a dedicated setting, not leaderboard visibility", () => {
  const privacy = readFileSync("src/screens/settings/PrivacyScreen.js", "utf8");
  const api = readFileSync("src/supabase/publicProfiles.js", "utf8");
  assert.match(privacy, /Profilimi kimler görebilir/);
  assert.match(privacy, /Grup üyeleri ve arkadaşlar/);
  assert.match(privacy, /Yalnız arkadaşlar/);
  assert.match(api, /public_profile_visibility/);
});
