import test from "node:test";
import assert from "node:assert/strict";
import { serverSetupDone } from "../../src/domain/onboarding/serverSetupDone.js";

test("hedef neti yazilmis profil kurulum tamamlanma tarihi yoksa bitmis sayilmaz", () => {
  assert.equal(serverSetupDone({ exam_type: "dil", target_net: "126.00", onboarding_completed_at: null }), false);
});
test("yalniz sinav secilmis (onizlemeden gelen) profil kurulumda kalir", () => {
  assert.equal(serverSetupDone({ exam_type: "tyt_ayt", target_net: null, gamification_stats: {} }), false);
});
test("sinav tipi yoksa asla bitmis degil", () => {
  assert.equal(serverSetupDone({ exam_type: null, target_net: 70 }), false);
  assert.equal(serverSetupDone(null), false);
});
test("yalniz onboarding tamamlanma tarihi sunucu otoritesidir", () => {
  assert.equal(serverSetupDone({ exam_type: "tyt", onboarding_completed_at: "2026-10-06T12:00:00Z" }), true);
  assert.equal(serverSetupDone({ exam_type: "tyt", gamification_stats: { setup_completed: true }, study_session_count: 3 }), false);
});

test("hedefi girip uygulamayi kapatan kullanici yeniden giriste Seviye'den devam eder", () => {
  const afterGoal = {
    exam_type: "tyt_ayt",
    exam_date: "2027-06-15",
    target_net: "90.00",
    baseline_net: null,
    onboarding_completed_at: null,
  };
  assert.equal(serverSetupDone(afterGoal), false);
});
