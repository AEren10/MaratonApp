import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  "supabase/migrations/20260925090000_cdx_xp_award_idempotency.sql",
  "utf8",
);
const xpApi = readFileSync("src/supabase/xp.js", "utf8");
const gamificationHook = readFileSync("src/hooks/useGamification.js", "utf8");

test("XP awards can carry a stable client operation id", () => {
  assert.match(migration, /ADD COLUMN IF NOT EXISTS client_operation_id TEXT/);
  assert.match(migration, /CREATE UNIQUE INDEX IF NOT EXISTS xp_events_user_client_operation_id_key/);
  assert.match(migration, /ON public\.xp_events \(user_id, client_operation_id\)/);
  assert.match(migration, /WHERE client_operation_id IS NOT NULL/);
});

test("award_xp remains backward compatible while deduping idempotent calls", () => {
  assert.match(migration, /p_client_operation_id TEXT DEFAULT NULL/);
  assert.match(migration, /WHERE user_id = uid AND client_operation_id = op_id/);
  assert.match(migration, /'idempotent', true/);
  assert.match(migration, /INSERT INTO public\.xp_events \(user_id, amount, action, client_operation_id\)/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.award_xp\(TEXT, INTEGER, TEXT\) TO authenticated/);
  assert.match(migration, /DROP FUNCTION IF EXISTS public\.award_xp\(TEXT, INTEGER\)/);
  assert.match(migration, /DROP FUNCTION IF EXISTS private\.award_xp\(TEXT, INTEGER\)/);
});

test("client passes operation id through the XP RPC when available", () => {
  assert.match(xpApi, /p_client_operation_id: clientOperationId/);
  assert.match(gamificationHook, /function xpOperationId\(action, data = \{\}\)/);
  assert.match(gamificationHook, /sourceOperationId/);
  assert.match(gamificationHook, /streak_milestone/);
});
