import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260911231806_cdx_harden_storage_policies.sql", import.meta.url),
  "utf8",
);

test("storage mutating policies are scoped to authenticated users", () => {
  for (const bucket of ["avatars", "wrong-questions", "community-answers"]) {
    assert.match(migration, new RegExp(`bucket_id = '${bucket}'`));
  }
  assert.doesNotMatch(migration, /FOR (INSERT|UPDATE|DELETE)(?! TO authenticated)/);
});

test("avatar update policy has both USING and WITH CHECK ownership predicates", () => {
  const updatePolicy = migration.slice(
    migration.indexOf('CREATE POLICY "Users can update own avatars"'),
    migration.indexOf('CREATE POLICY "Users can delete own avatars"'),
  );
  assert.match(updatePolicy, /FOR UPDATE TO authenticated/);
  assert.match(updatePolicy, /USING \(/);
  assert.match(updatePolicy, /WITH CHECK \(/);
  assert.match(updatePolicy, /\(select auth\.uid\(\)\)::text = \(storage\.foldername\(name\)\)\[1\]/);
});
