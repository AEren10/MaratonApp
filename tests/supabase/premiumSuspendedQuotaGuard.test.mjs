import test from "node:test";
import assert from "node:assert/strict";
import { readdirSync, readFileSync } from "node:fs";

const migration = readFileSync(
  new URL("../../supabase/migrations/20260929022720_clde_premium_suspended_quotas_off.sql", import.meta.url),
  "utf8",
);

test("trial and challenge quota rewrites preserve the premium suspension bypass", () => {
  assert.match(migration, /ARRAY\['create_trial', 'create_challenge'\]/);
  assert.match(
    migration,
    /unlimited := private\.premium_suspended\(\) OR private\.is_first_week/,
  );
});

test("later trial or challenge rewrites cannot silently remove the bypass", () => {
  const directory = new URL("../../supabase/migrations/", import.meta.url);
  const files = readdirSync(directory)
    .filter((file) => file.endsWith(".sql"))
    .sort();
  const guardFile = "20260929022720_clde_premium_suspended_quotas_off.sql";
  const laterFiles = files.slice(files.indexOf(guardFile) + 1);

  for (const file of laterFiles) {
    const sql = readFileSync(new URL(file, directory), "utf8");
    const rewritesQuotaFunction = /CREATE OR REPLACE FUNCTION private\.(create_trial|create_challenge)/i.test(sql);
    if (!rewritesQuotaFunction) continue;
    assert.match(
      sql,
      /private\.premium_suspended\(\)\s+OR/i,
      `${file} rewrites a quota function without the premium suspension bypass`,
    );
  }
});
