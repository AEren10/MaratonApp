import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const migration = readFileSync(
  new URL("../../supabase/migrations/20261001223632_cdx_product_analytics_foundation.sql", import.meta.url),
  "utf8",
);
const reports = readFileSync(
  new URL("../../supabase/reports/product_analytics.sql", import.meta.url),
  "utf8",
);

test("product analytics migration establishes both additive table contracts", () => {
  for (const table of ["analytics_events", "retention_events"]) {
    assert.match(migration, new RegExp(`CREATE TABLE IF NOT EXISTS public\\.${table}`));
    assert.match(migration, new RegExp(`REFERENCES auth\\.users\\(id\\) ON DELETE CASCADE`));
    assert.match(migration, new RegExp(`ALTER TABLE public\\.${table} ENABLE ROW LEVEL SECURITY`));
    assert.match(migration, new RegExp(`REVOKE ALL ON public\\.${table} FROM PUBLIC, anon, authenticated`));
    assert.match(migration, new RegExp(`GRANT SELECT, INSERT ON public\\.${table} TO authenticated`));
  }
  assert.match(migration, /ADD COLUMN IF NOT EXISTS client_event_id TEXT/);
  assert.match(migration, /REFERENCES auth\.users\(id\) ON DELETE CASCADE NOT VALID/);
  assert.match(migration, /VALIDATE CONSTRAINT/);
});

test("product analytics migration makes new event retries idempotent", () => {
  assert.match(
    migration,
    /CREATE UNIQUE INDEX IF NOT EXISTS idx_analytics_events_client_event_id[\s\S]*\(user_id, client_event_id\)[\s\S]*WHERE client_event_id IS NOT NULL/,
  );
  assert.match(
    migration,
    /CREATE UNIQUE INDEX IF NOT EXISTS idx_retention_events_client_event_id[\s\S]*\(user_id, client_event_id\)[\s\S]*WHERE client_event_id IS NOT NULL/,
  );
});

test("product analytics policies expose only the authenticated user's rows", () => {
  assert.match(migration, /CREATE POLICY "analytics select own"[\s\S]*USING \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /CREATE POLICY "analytics insert own"[\s\S]*WITH CHECK \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /CREATE POLICY "retention events select own"[\s\S]*USING \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.match(migration, /CREATE POLICY "retention events insert own"[\s\S]*WITH CHECK \(\(select auth\.uid\(\)\) = user_id\)/);
  assert.doesNotMatch(migration, /CREATE\s+(?:OR REPLACE\s+)?(?:VIEW|FUNCTION).*analytics/i);
});

test("owner report bundle covers health, screens, paths, funnel, and retention", () => {
  for (const marker of [
    "01 — Pipeline health",
    "03 — Screen usage",
    "05 — Screen-to-screen paths",
    "07 — Activation funnel",
    "08 — D1 / D7 / D30 meaningful retention",
  ]) {
    assert.match(reports, new RegExp(marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.doesNotMatch(reports, /CREATE\s+(?:OR REPLACE\s+)?(?:VIEW|FUNCTION)/i);
});
