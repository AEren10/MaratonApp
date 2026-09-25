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
  assert.match(src, /setSetupCompleted\(true\)[\s\S]{0,320}setupCompleted: true/);
});

test("setupCompleted hedef net veya soru sayisindan tetiklenmez (premature stack unmount engeli)", () => {
  // Adim 2'de (Hedef Net) kaydedilen target_net veya daily_question_goal
  // kurulumu bitmis saymamalidir. Aksi halde Seviye Testi ve Rota Hazir
  // adimlari atlanir ve LevelTest navigator hatasi verir.
  assert.doesNotMatch(src, /setupCompleted:\s*![^,\n]*\(\s*!*p\.exam_type\s*&&[^,\n]*p\.target_net/);
  assert.doesNotMatch(src, /setupCompleted:\s*![^,\n]*\(\s*!*p\.exam_type\s*&&[^,\n]*p\.daily_question_goal/);
});

test("tum kurulum ekranlari APP_STACK_SCREENS ve ROOT_ONLY icinde tanimlidir", () => {
  const regSrc = readFileSync("src/navigation/screenRegistry.js", "utf8");
  const tabSrc = readFileSync("src/navigation/tabAssignment.js", "utf8");

  assert.match(regSrc, /screen\(SCREENS\.LEVEL_TEST,\s*LevelTestScreen\)/);
  assert.match(regSrc, /screen\(SCREENS\.ROUTE_READY,\s*RouteReadyScreen\)/);
  assert.match(regSrc, /screen\(SCREENS\.NOTIFICATION_PERMISSION,\s*NotificationPermissionScreen\)/);
  assert.match(regSrc, /screen\(SCREENS\.SETUP_INCOMPLETE,\s*SetupIncompleteScreen\)/);

  assert.match(tabSrc, /SCREENS\.LEVEL_TEST/);
  assert.match(tabSrc, /SCREENS\.ROUTE_READY/);
  assert.match(tabSrc, /SCREENS\.NOTIFICATION_PERMISSION/);
  assert.match(tabSrc, /SCREENS\.SETUP_INCOMPLETE/);
});

