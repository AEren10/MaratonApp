import assert from "node:assert/strict";
import test from "node:test";

import {
  LANDING_MAX_AGE_MS,
  consumePostSetupLanding,
  landingDeferredToNewStack,
  setPostSetupLanding,
} from "../../src/lib/postSetupLanding.js";

test("hedef bir kez tuketilir", () => {
  const then = { screen: "StudyTimer", params: { subjectKey: "turkce" } };
  setPostSetupLanding({ tab: "Home", then }, 1000);
  assert.deepEqual(consumePostSetupLanding(1500), { tab: "Home", then });
  assert.equal(consumePostSetupLanding(1600), null);
});

test("bayat hedef uygulanmaz", () => {
  setPostSetupLanding({ tab: "Home", screen: "Roadmap" }, 0);
  assert.equal(consumePostSetupLanding(LANDING_MAX_AGE_MS + 1), null);
});

test("sekmesiz hedef kaydedilmez", () => {
  setPostSetupLanding({ screen: "Roadmap" }, 0);
  assert.equal(consumePostSetupLanding(1), null);
});

test("kurulum yigini kalkacaksa hedef yeni yigina ertelenir", () => {
  assert.equal(landingDeferredToNewStack({ onboardingDone: false }), true);
  // Kurulumu atlamis kullanici uygulama icinden tamamliyor: yigin degismez.
  assert.equal(landingDeferredToNewStack({ onboardingDone: true }), false);
});

test("AppStackInner hedefi uyguluyor, useFinishOnboarding erteliyor", async () => {
  const { readFileSync } = await import("node:fs");
  const nav = readFileSync("src/navigation/AppNavigator.js", "utf8");
  const finish = readFileSync("src/hooks/useFinishOnboarding.js", "utf8");
  assert.match(nav, /function AppStackInner\(\) \{[\s\S]{0,80}usePostSetupLanding\(\)/);
  assert.match(finish, /setPostSetupLanding\(landing\);\s*await completeOnboarding\(\);/);
});
