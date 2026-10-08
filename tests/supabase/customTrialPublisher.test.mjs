import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const migration = fs.readFileSync(
  "supabase/migrations/20261008033000_cdx_custom_trial_publisher.sql",
  "utf8",
);
const trials = fs.readFileSync("src/supabase/trials.js", "utf8");
const submit = fs.readFileSync("src/screens/trial/trialEntrySubmit.js", "utf8");
const form = fs.readFileSync("src/screens/trial/useTrialEntryForm.js", "utf8");

test("özel yayın adı form, offline kayıt ve RPC boyunca taşınır", () => {
  assert.match(form, /publisherName/);
  assert.match(submit, /publisher_name_snapshot:\s*cleanedPublisherName/);
  assert.match(trials, /p_publisher_name:\s*trial\.publisher_name_snapshot/);
});

test("RPC özel yayın adını doğrular ve snapshot alanına yazar", () => {
  assert.match(migration, /p_publisher_name TEXT DEFAULT NULL/);
  assert.match(migration, /char_length\(custom_publisher_name\) > 60/);
  assert.match(migration, /p_publisher_id IS NOT NULL AND custom_publisher_name IS NOT NULL/);
  assert.match(migration, /publisher_name_snapshot = COALESCE\(custom_publisher_name, publisher_name_snapshot\)/);
  assert.match(migration, /GRANT EXECUTE[\s\S]*TO authenticated/);
});

test("idempotent RPC tekrarı var olan yayın kimliğini değiştirmez", () => {
  assert.match(
    migration,
    /AND NOT COALESCE\(\(result->>'idempotent'\)::BOOLEAN, false\)[\s\S]*UPDATE public\.trials/,
  );
});
