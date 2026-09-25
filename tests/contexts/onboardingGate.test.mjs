import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync("src/contexts/ExamContext.js", "utf8");

test("kurulumu acikca bitiren kullanici kurulumda hapsolmaz", () => {
  // setupCompleted tek basina yeterli olmali: dailyGoalSet adim 2'de true
  // oldugu icin onboardingDone'a dahil edilirse adim 3 ve 4 (Seviye Testi,
  // Rota Hazir) calismadan kullaniciyi prematurely MainTabs'e atar.
  assert.match(src, /const onboardingDone = !!examType && \(setupCompleted \|\| setupSkipped\)/);
  assert.doesNotMatch(src, /const onboardingDone = !!examType && dailyGoalSet && setupCompleted/);
});

test("examType hala sart: onsuz uygulama calisamaz", () => {
  assert.match(src, /const onboardingDone = !!examType &&/);
});

test("completeOnboarding bayragi kaliciya yazar", () => {
  // Yalniz bellege yazsaydi uygulama kapaninca kilit geri gelirdi.
  assert.match(src, /setSetupCompleted\(true\)[\s\S]{0,220}setupCompleted: true/);
});
