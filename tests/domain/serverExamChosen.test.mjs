import test from "node:test";
import assert from "node:assert/strict";
import { serverExamChosen, serverGoalDone } from "../../src/domain/onboarding/serverSetupDone.js";

// Veritabani varsayilani: exam_type 'tyt', daily_question_goal 100.
const FRESH = { exam_type: "tyt", exam_date: null, daily_question_goal: 100, target_net: null, target_net_tyt: null };

test("yeni profil (yalniz varsayilanlar) sinav secilmis sayilmaz", () => {
  assert.equal(serverExamChosen(FRESH), false);
  assert.equal(serverGoalDone(FRESH), false);
});

test("sinav tarihi yazildiysa sinav secilmistir", () => {
  assert.equal(serverExamChosen({ ...FRESH, exam_type: "tyt_ayt", exam_date: "2027-06-15" }), true);
});

test("bitmis kurulum tarihsiz de olsa secilmis sayilir", () => {
  assert.equal(serverExamChosen({ ...FRESH, target_net: "80.00" }), true);
  assert.equal(serverExamChosen({ ...FRESH, gamification_stats: { setup_completed: true } }), true);
  assert.equal(serverExamChosen({ ...FRESH, study_session_count: 3 }), true);
});

test("hedef: net ya da siralama yazildiysa", () => {
  assert.equal(serverGoalDone({ ...FRESH, target_net_tyt: "75.00" }), true);
  assert.equal(serverGoalDone({ ...FRESH, target_ranking: 5000 }), true);
});

test("profil yoksa ikisi de false", () => {
  assert.equal(serverExamChosen(null), false);
  assert.equal(serverGoalDone(undefined), false);
});

import { serverSetupDone } from "../../src/domain/onboarding/serverSetupDone.js";

// Canli veritabanindan gercek satirlar (6 Ekim): sistemin durum tablosu.
const MERVE = { exam_type: "tyt_ayt", exam_date: "2027-06-15", field: "sayisal", daily_question_goal: 100, target_net: null, target_net_tyt: null, baseline_net: "60.00", gamification_stats: null, study_session_count: 1 };
const DEMO = { exam_type: "tyt_ayt", exam_date: "2027-06-15", daily_question_goal: 80, target_net: "120.00", target_net_tyt: "75.00", baseline_net: "63.00", gamification_stats: { setup_completed: true }, study_session_count: 0 };

test("durum tablosu: yeni / yarim / bitmis", () => {
  // yeni: sinav yok -> sinav (onizlemeden geldiyse hedef) ekrani
  assert.deepEqual([serverExamChosen(FRESH), serverGoalDone(FRESH), serverSetupDone(FRESH)], [false, false, false]);
  // Merve: sinav secili, hedef YOK ama 1 calisma oturumu var -> kurulum bitmis sayilir
  // (study_session_count calisma ozetinde artar; aktif kullaniciya kurulum tekrar sorulmaz)
  assert.deepEqual([serverExamChosen(MERVE), serverGoalDone(MERVE), serverSetupDone(MERVE)], [true, false, true]);
  // Demo: hepsi tamam -> dogrudan uygulama
  assert.deepEqual([serverExamChosen(DEMO), serverGoalDone(DEMO), serverSetupDone(DEMO)], [true, true, true]);
});
