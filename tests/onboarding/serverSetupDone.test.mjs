import test from "node:test";
import assert from "node:assert/strict";
import { serverSetupDone } from "../../src/domain/onboarding/serverSetupDone.js";

test("hedef neti yazilmis profil kurulumu bitmis sayilir (bayrak silinmis olsa da)", () => {
  assert.equal(serverSetupDone({ exam_type: "dil", target_net: "126.00", gamification_stats: { xp: 10 }, study_session_count: 0 }), true);
});
test("yalniz sinav secilmis (onizlemeden gelen) profil kurulumda kalir", () => {
  assert.equal(serverSetupDone({ exam_type: "tyt_ayt", target_net: null, gamification_stats: {} }), false);
});
test("sinav tipi yoksa asla bitmis degil", () => {
  assert.equal(serverSetupDone({ exam_type: null, target_net: 70 }), false);
  assert.equal(serverSetupDone(null), false);
});
test("eski isaretler hala gecerli", () => {
  assert.equal(serverSetupDone({ exam_type: "tyt", gamification_stats: { setup_completed: true } }), true);
  assert.equal(serverSetupDone({ exam_type: "tyt", study_session_count: 3 }), true);
});
