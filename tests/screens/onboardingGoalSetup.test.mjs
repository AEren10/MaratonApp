import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const formSrc = readFileSync("src/screens/onboarding/useGoalSetupForm.js", "utf8");
const editorSrc = readFileSync("src/hooks/useGoalNetEditor.js", "utf8");
const screenSrc = readFileSync("src/screens/onboarding/GoalSetupScreen.js", "utf8");
const examContextSrc = readFileSync("src/contexts/ExamContext.js", "utf8");

test("hedef soru sayisi ust limiti 500'e yukseltilmistir", () => {
  assert.match(formSrc, /DAILY_Q_MAX\s*=\s*500/);
  assert.match(editorSrc, /DAILY_MAX\s*=\s*500/);
});

test("tyt_ayt ve dil sinavlari coklu net (TYT + AYT/YDT) olarak taninir", () => {
  assert.match(formSrc, /isMultiNetExam\(examType\)/);
  assert.match(formSrc, /examType === "tyt_ayt" \|\| examType === "dil"/);
});

test("net sinirlari TYT icin 120, AYT icin 80'dir", () => {
  assert.match(formSrc, /TYT_NET_MAX\s*=\s*120/);
  assert.match(formSrc, /AYT_NET_MAX\s*=\s*80/);
  assert.match(formSrc, /YDT_NET_MAX\s*=\s*80/);
});

test("ExamContext updateTargetNet TYT ve AYT degerlerini kabul eder", () => {
  assert.match(examContextSrc, /updateTargetNet\s*=\s*useCallback\(async\s*\(net,\s*extra/);
  assert.match(examContextSrc, /targetNetTYT/);
  assert.match(examContextSrc, /targetNetAYT/);
});

test("GoalSetupScreen coklu net bolumu ve kaydirmali gorunumu icerir", () => {
  assert.match(screenSrc, /MultiNetSection/);
  assert.match(screenSrc, /ScrollView/);
  assert.match(screenSrc, /ScreenErrorBoundary/);
});

test("dosya satir sayilari 150 kuralina uygundur", () => {
  const goalScreenLines = screenSrc.split("\n").length;
  const settingsGoalsLines = readFileSync("src/screens/settings/GoalsScreen.js", "utf8").split("\n").length;
  const formLines = formSrc.split("\n").length;
  const editorLines = editorSrc.split("\n").length;

  assert.ok(goalScreenLines <= 150, `GoalSetupScreen.js ${goalScreenLines} satır, <= 150 olmalı`);
  assert.ok(settingsGoalsLines <= 150, `GoalsScreen.js ${settingsGoalsLines} satır, <= 150 olmalı`);
  assert.ok(formLines <= 150, `useGoalSetupForm.js ${formLines} satır, <= 150 olmalı`);
  assert.ok(editorLines <= 150, `useGoalNetEditor.js ${editorLines} satır, <= 150 olmalı`);
});
