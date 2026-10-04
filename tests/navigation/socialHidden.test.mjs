import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

import { SOCIAL_ENABLED } from "../../src/constants/social.js";

const read = (p) => readFileSync(new URL(`../../${p}`, import.meta.url), "utf8");

test("social surfaces are behind SOCIAL_ENABLED (on by user decision)", () => {
  assert.equal(SOCIAL_ENABLED, true);
  assert.match(read("src/screens/home/components/HomeTopBar.js"), /SOCIAL_ENABLED \? \(\s*<Pressable onPress=\{\(\) => \{ H\.tap\(\); onSocial/);
  const profile = read("src/screens/profile/ProfileScreen.js");
  assert.match(profile, /SOCIAL_ENABLED \? \(\s*<Animated\.View[^>]*>\s*<LeagueMiniCard/);
  // "Gruplarim" satiri kalkti (4 Ekim): lig karti ayni yere gidiyor.
  assert.match(profile, /SOCIAL_ENABLED \? \(\s*<>\s*<ProfileLinkRow\s*label="Meydan okumalar"/);
  assert.match(read("src/screens/settings/SettingsScreen.js"), /SOCIAL_ENABLED \? \(\s*<SettingsGroup title="ARKADAŞLAR">/);
  assert.match(read("src/hooks/useDeepLink.js"), /SOCIAL_ENABLED && friendCode/);
});
