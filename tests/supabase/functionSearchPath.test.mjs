import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260911150342_cdx_lock_function_search_path.sql", import.meta.url),
  "utf8",
);

test("CDX security definer RPCs lock search_path", () => {
  const functions = [
    "public.sync_challenge_progress(TEXT, TEXT, INTEGER, INTEGER)",
    "public.persist_route_revision(TEXT, TEXT, TEXT, TEXT, JSONB)",
    "private.has_feature_access(UUID, TEXT, TIMESTAMPTZ)",
    "private.get_product_access_snapshot()",
    "private.get_private_export_data()",
  ];

  for (const fn of functions) {
    assert.match(migration, new RegExp(`ALTER FUNCTION ${fn.replace(/[()]/g, "\\$&")}\\s+SET search_path = ''`, "m"));
  }
});
