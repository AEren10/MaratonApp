import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

import { ROOT_GATE, resolveRootGate } from "../../src/navigation/rootGate.js";
import { isProfileSettling } from "../../src/lib/profileSettleGate.js";

const signedIn = { hasSeenSlides: true, hasSession: true };

test("yeni kullanici: karsilama -> giris -> kurulum", () => {
  assert.equal(resolveRootGate({}), ROOT_GATE.SLIDES);
  assert.equal(resolveRootGate({ hasSeenSlides: true }), ROOT_GATE.AUTH);
  assert.equal(resolveRootGate(signedIn), ROOT_GATE.SETUP);
});

test("kurtarma modu her seyin onunde", () => {
  assert.equal(resolveRootGate({ recoveryMode: true }), ROOT_GATE.RECOVERY);
  assert.equal(resolveRootGate({ ...signedIn, onboardingDone: true, recoveryMode: true }), ROOT_GATE.RECOVERY);
});

test("kurulumu biten (ya da sinavi secip atlayan) uygulamaya girer", () => {
  assert.equal(resolveRootGate({ ...signedIn, onboardingDone: true }), ROOT_GATE.APP);
});

test("profil okunurken kurulum yigini acilmaz", () => {
  assert.equal(resolveRootGate({ ...signedIn, profileSettling: true }), ROOT_GATE.PROFILE_LOADING);
  // Yerel ayar dolu olsa bile sunucu istegi bitmeden kok yigin secilmez.
  assert.equal(resolveRootGate({ ...signedIn, onboardingDone: true, profileSettling: true }), ROOT_GATE.PROFILE_LOADING);
});

test("profil okuma hatasi yerel onboarding durumundan once ele alinir", () => {
  assert.equal(resolveRootGate({ ...signedIn, profileLoadFailed: true }), ROOT_GATE.PROFILE_ERROR);
  // Sunucuya ulasilamiyorsa tamamlanmis yerel kopya cevrimdisi erisim saglar.
  assert.equal(resolveRootGate({ ...signedIn, onboardingDone: true, profileLoadFailed: true }), ROOT_GATE.APP);
});

test("profil kapisi: basarili okuma ya da acik hata durumuna kadar bekler", () => {
  const base = { userId: "u1", profileReadyFor: null, profileLoadErrorFor: null };
  assert.equal(isProfileSettling(base), true);
  assert.equal(isProfileSettling({ ...base, profileReadyFor: "u1" }), false);
  assert.equal(isProfileSettling({ ...base, profileLoadErrorFor: "u1" }), false);
  // Onceki kullanicinin okumasi/hatasi yeni kullaniciyi gecirmez.
  assert.equal(isProfileSettling({ ...base, profileReadyFor: "u0", profileLoadErrorFor: "u0" }), true);
  assert.equal(isProfileSettling({ ...base, userId: null }), false);
});

test("cikista atlama bayragi sifirlanir, navigator ayrica setupSkipped'e bakmaz", () => {
  const exam = readFileSync("src/contexts/ExamContext.js", "utf8");
  const nav = readFileSync("src/navigation/AppNavigator.js", "utf8");
  assert.match(exam, /setSetupCompleted\(false\);[\s\S]{0,200}setSetupSkipped\(false\);/);
  assert.doesNotMatch(nav, /!onboardingDone && !setupSkipped/);
  assert.match(nav, /resolveRootGate\(/);
});
