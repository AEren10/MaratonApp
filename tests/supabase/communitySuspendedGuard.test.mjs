import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260930115421_suspend_legacy_community_ugc_v1.sql", import.meta.url),
  "utf8",
);

test("legacy community writes and public media access are suspended without deleting data", () => {
  assert.match(migration, /REVOKE INSERT ON TABLE public\.shared_questions/);
  assert.match(migration, /REVOKE INSERT ON TABLE public\.question_answers/);
  assert.match(migration, /SET public = false[\s\S]*id = 'community-answers'/);
  assert.match(migration, /DROP POLICY IF EXISTS "Users can upload answer images"/);
  assert.match(migration, /DROP POLICY IF EXISTS "Shared wrong question images are viewable"/);
  assert.doesNotMatch(migration, /DELETE FROM public\.(shared_questions|question_answers)/);
  assert.doesNotMatch(migration, /^\s*DROP TABLE public\.(shared_questions|question_answers)/m);
  assert.doesNotMatch(migration, /DELETE FROM storage\.(buckets|objects)/);
});

test("account deletion can still list and remove owner community media", () => {
  const storage = readFileSync(new URL("../../src/supabase/storage.js", import.meta.url), "utf8");

  assert.match(migration, /Users can view own community answer images/);
  assert.match(migration, /\(SELECT auth\.uid\(\)\)::text = \(storage\.foldername\(name\)\)\[1\]/);
  assert.doesNotMatch(migration, /DROP POLICY IF EXISTS "Users can delete own answer images"/);
  assert.match(storage, /"community-answers"/);
});

test("legacy answer realtime publication is removed idempotently", () => {
  assert.match(migration, /pg_publication_tables/);
  assert.match(migration, /ALTER PUBLICATION supabase_realtime DROP TABLE public\.question_answers/);
});
