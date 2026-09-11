import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/supabase/dataExport.js", import.meta.url), "utf8");

test("export catalog includes durable route lifecycle tables", () => {
  assert.match(source, /table: "route_revisions"/);
  assert.match(source, /table: "route_stops"/);
  assert.match(source, /table: "route_stop_events"/);
  assert.match(source, /label: "Rota revizyonları"/);
  assert.match(source, /label: "Rota durakları"/);
  assert.match(source, /label: "Rota durak geçmişi"/);
});

test("export catalog includes private product and companionship data through RPC", () => {
  assert.match(source, /table: "user_entitlements"/);
  assert.match(source, /table: "feature_usage_events"/);
  assert.match(source, /table: "route_companionships"/);
  assert.match(source, /get_private_export_data/);
});

test("social export queries are paginated", () => {
  assert.match(source, /async function fetchOrAll/);
  assert.match(source, /\.or\(orFilter\)/);
  assert.match(source, /\.range\(from, from \+ PAGE - 1\)/);
});

test("trial subject export chunks and paginates in-filters", () => {
  assert.match(source, /const IN_FILTER_CHUNK = 200/);
  assert.match(source, /async function fetchInAll/);
  assert.match(source, /values\.slice\(i, i \+ IN_FILTER_CHUNK\)/);
  assert.match(source, /\.in\(column, chunk\)/);
  assert.match(source, /\.range\(from, from \+ PAGE - 1\)/);
  assert.match(source, /fetchInAll\("trial_subjects", "trial_id", trialIds\)/);
});

test("export summary includes the profile row collected outside the table catalog", () => {
  assert.match(source, /PROFILE_EXPORT_SPEC = \{ table: "profiles", label: "Profil" \}/);
  assert.match(source, /\[PROFILE_EXPORT_SPEC, \.\.\.EXPORT_TABLES\]\.map/);
});
