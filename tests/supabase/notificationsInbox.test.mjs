import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const migration = readFileSync(new URL("../../supabase/migrations/20260924155346_cdx_release_data_layer_tables_and_private_grants.sql", import.meta.url), "utf8");
const service = readFileSync(new URL("../../src/supabase/notifications.js", import.meta.url), "utf8");
const hook = readFileSync(new URL("../../src/hooks/useNotifications.js", import.meta.url), "utf8");
const screen = readFileSync(new URL("../../src/screens/notifications/NotificationsScreen.js", import.meta.url), "utf8");

test("notifications inbox has an owned Supabase table with RLS", () => {
  assert.match(migration, /CREATE TABLE IF NOT EXISTS public\.notifications/);
  assert.match(migration, /user_id UUID NOT NULL REFERENCES auth\.users\(id\) ON DELETE CASCADE/);
  assert.match(migration, /ALTER TABLE public\.notifications ENABLE ROW LEVEL SECURITY/);
  assert.match(migration, /USING \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /WITH CHECK \(\(select auth\.uid\(\)\) = user_id\)/);
});

test("notifications service scopes reads and read updates by user id", () => {
  assert.match(service, /export async function listNotifications\(userId/);
  assert.match(service, /\.eq\("user_id", userId\)/);
  assert.match(service, /export async function markNotificationRead\(id, userId\)/);
  assert.match(service, /\.eq\("id", id\)\s+\.eq\("user_id", userId\)/);
});

test("notifications screen reads the hook instead of a mock array", () => {
  assert.doesNotMatch(screen, /EMPTY_NOTIFICATIONS/);
  assert.match(screen, /useNotifications\(\)/);
  assert.match(hook, /listNotifications\(userId\)/);
  assert.match(hook, /markNotificationRead\(item\.id, userId\)/);
});
