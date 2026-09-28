import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migration = fs.readFileSync(
  "supabase/migrations/20260928011510_cdx_trial_duration_minutes.sql",
  "utf8",
);
const trials = fs.readFileSync("src/supabase/trials.js", "utf8");
const submit = fs.readFileSync("src/screens/trial/trialEntrySubmit.js", "utf8");
const details = fs.readFileSync("src/screens/trial/components/TrialEntryDetailsCard.js", "utf8");
const types = fs.readFileSync("src/domain/trial/trialTypes.js", "utf8");

test("trial duration migration keeps old create_trial callers compatible", () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS duration_minutes INTEGER/);
  assert.match(migration, /duration_minutes IS NULL OR duration_minutes BETWEEN 1 AND 600/);
  assert.match(migration, /p_duration_minutes INTEGER DEFAULT NULL/);
  assert.match(migration, /private\.create_trial\(/);
  assert.match(migration, /jsonb_set\(result, '\{trial,duration_minutes\}'/);
});

test("trial duration travels through form, rpc payload and official defaults", () => {
  assert.match(types, /TYT[\s\S]*durationMinutes: 165/);
  assert.match(types, /AYT_SAY[\s\S]*durationMinutes: 180/);
  assert.match(types, /YDT[\s\S]*durationMinutes: 180/);
  assert.match(submit, /duration_minutes: durationValue/);
  assert.match(trials, /p_duration_minutes:\s*trial\.duration_minutes \?\? trial\.durationMinutes \?\? null/);
  assert.match(details, /keyboardType="number-pad"/);
  assert.doesNotMatch(details, /135 dk/);
});
