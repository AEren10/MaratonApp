import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const trialTypes = fs.readFileSync("src/domain/trial/trialTypes.js", "utf8");
const trialModel = fs.readFileSync("src/domain/trial/trialModel.js", "utf8");
const labels = fs.readFileSync("src/screens/trial/trialLabels.js", "utf8");
const validation = fs.readFileSync("src/validations/auth.js", "utf8");
const migration = fs.readFileSync(
  "supabase/migrations/20260928105453_cdx_targets_ydt_trial.sql",
  "utf8",
);

test("dil öğrencisi TYT, YDT ve branş denemesi girebilir", () => {
  assert.match(trialTypes, /YDT:\s*\{\s*code:\s*"YDT"/);
  assert.match(
    trialTypes,
    /examType === "dil" \|\| field === "dil"[\s\S]*\["TYT", "YDT", "BRANCH"\]/,
  );
  assert.match(trialTypes, /getSubjectsForBranch[\s\S]*examType === "dil"[\s\S]*getYDTSubjects/);
});

test("YDT denemesi İngilizce dersini, resmi süreyi ve 80 soru sınırını kullanır", () => {
  assert.match(trialTypes, /key:\s*"ydt_ingilizce"[\s\S]*max:\s*80[\s\S]*parent:\s*"YDT"/);
  assert.match(trialTypes, /YDT:[\s\S]*totalQuestions:\s*80[\s\S]*durationMinutes:\s*180/);
  assert.match(migration, /exam_type IN \([\s\S]*'YDT'[\s\S]*\)/);
  assert.match(migration, /subject IN \([\s\S]*'ydt_ingilizce'[\s\S]*\)/);
  assert.match(migration, /WHEN 'ydt_ingilizce' THEN 80/);
  assert.match(migration, /upper\(p_exam_type\) = 'YDT' AND subject_key NOT LIKE 'ydt_%'/);
});

test("YDT değerleri model, etiket ve form validasyonundan geçer", () => {
  assert.match(trialModel, /ydt:\s*"YDT"/);
  assert.match(labels, /YDT:\s*"YDT"/);
  assert.match(validation, /z\.enum\(\[[\s\S]*"YDT"[\s\S]*\]\)/);
});
