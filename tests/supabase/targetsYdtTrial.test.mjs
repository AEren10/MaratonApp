import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync("supabase/migrations/20260928105453_cdx_targets_ydt_trial.sql", "utf8");

test("profile split targets are stored server-side with column grants", () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS target_net_tyt numeric\(5,2\)/);
  assert.match(migration, /ADD COLUMN IF NOT EXISTS target_net_second numeric\(5,2\)/);
  assert.match(migration, /GRANT UPDATE \(target_net_tyt, target_net_second\) ON public\.profiles TO authenticated/);
});

test("YDT is accepted by trial constraints and create_trial", () => {
  assert.match(migration, /trials_exam_type_check[\s\S]*'YDT'/);
  assert.match(migration, /trial_subjects_subject_check[\s\S]*'ydt_ingilizce'/);
  assert.match(migration, /upper\(p_exam_type\) NOT IN \('TYT','AYT','AYT_SAY','AYT_EA','AYT_SOZ','YDT','BRANCH','LGS'\)/);
  assert.match(migration, /WHEN 'ydt_ingilizce' THEN 80/);
  assert.match(migration, /upper\(p_exam_type\) = 'YDT' AND subject_key NOT LIKE 'ydt_%'/);
});
