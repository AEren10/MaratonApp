import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const src = readFileSync("src/contexts/ExamContext.js", "utf8");

test("kurulumu acikca bitiren kullanici kurulumda hapsolmaz", () => {
  // Uc bayragin VE'si bir kilit uretiyordu: hedef surgusu cokunce dailyGoalSet
  // hic true olmuyor, kullanici kurulumu bitirse bile her acilista kurulum
  // ekranina dusuyordu. setupCompleted tek basina yeterli olmali.
  assert.match(src, /const onboardingDone = !!examType && \(setupCompleted \|\| dailyGoalSet\)/);
  assert.doesNotMatch(src, /const onboardingDone = !!examType && dailyGoalSet && setupCompleted/);
});

test("examType hala sart: onsuz uygulama calisamaz", () => {
  assert.match(src, /const onboardingDone = !!examType &&/);
});

test("completeOnboarding bayragi kaliciya yazar", () => {
  // Yalniz bellege yazsaydi uygulama kapaninca kilit geri gelirdi.
  assert.match(src, /setSetupCompleted\(true\)[\s\S]{0,220}setupCompleted: true/);
});
