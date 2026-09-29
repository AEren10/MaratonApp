import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync("supabase/migrations/20260929005329_cdx_group_admin_transfer.sql", "utf8");
const api = readFileSync("src/supabase/groups.js", "utf8");
const hook = readFileSync("src/hooks/useGroupActions.js", "utf8");

test("group admin transfer is guarded by server-side membership and admin checks", () => {
  assert.match(migration, /CREATE OR REPLACE FUNCTION private\.transfer_group_admin/);
  assert.match(migration, /SECURITY DEFINER/);
  assert.match(migration, /auth\.uid\(\)/);
  assert.match(migration, /v_current_role <> 'admin'/);
  assert.match(migration, /v_new_role IS NULL/);
  assert.match(migration, /SET role = 'member'/);
  assert.match(migration, /SET role = 'admin'/);
});

test("only authenticated clients can execute public transfer_group_admin", () => {
  assert.match(migration, /REVOKE ALL ON FUNCTION public\.transfer_group_admin\(UUID, UUID\) FROM PUBLIC, anon/);
  assert.match(migration, /GRANT EXECUTE ON FUNCTION public\.transfer_group_admin\(UUID, UUID\) TO authenticated/);
  assert.match(migration, /REVOKE ALL ON FUNCTION private\.transfer_group_admin\(UUID, UUID\) FROM PUBLIC, anon, authenticated/);
});

test("client exposes transferGroupAdmin through supabase module and hook", () => {
  assert.match(api, /export async function transferGroupAdmin/);
  assert.match(api, /rpc\("transfer_group_admin"/);
  assert.match(hook, /transferGroupAdmin/);
  assert.match(hook, /transferAdmin/);
});
