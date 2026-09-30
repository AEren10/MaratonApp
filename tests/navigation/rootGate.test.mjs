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
  // Yerel ayardan kurulum zaten bitmis gorunuyorsa beklenmez.
  assert.equal(resolveRootGate({ ...signedIn, onboardingDone: true, profileSettling: true }), ROOT_GATE.APP);
});

test("profil kapisi: yalniz yerel sinav ayari yokken ve sure dolmadan bekler", () => {
  const base = { userId: "u1", profileReadyFor: null, examType: null, expiredFor: null };
  assert.equal(isProfileSettling(base), true);
  assert.equal(isProfileSettling({ ...base, examType: "tyt" }), false);
  assert.equal(isProfileSettling({ ...base, profileReadyFor: "u1" }), false);
  assert.equal(isProfileSettling({ ...base, expiredFor: "u1" }), false);
  // Onceki kullanicinin okumasi/suresi yeni kullaniciyi gecirmez.
  assert.equal(isProfileSettling({ ...base, profileReadyFor: "u0", expiredFor: "u0" }), true);
  assert.equal(isProfileSettling({ ...base, userId: null }), false);
});

test("cikista atlama bayragi sifirlanir, navigator ayrica setupSkipped'e bakmaz", () => {
  const exam = readFileSync("src/contexts/ExamContext.js", "utf8");
  const nav = readFileSync("src/navigation/AppNavigator.js", "utf8");
  assert.match(exam, /setSetupCompleted\(false\);[\s\S]{0,200}setSetupSkipped\(false\);/);
  assert.doesNotMatch(nav, /!onboardingDone && !setupSkipped/);
  assert.match(nav, /resolveRootGate\(/);
});
