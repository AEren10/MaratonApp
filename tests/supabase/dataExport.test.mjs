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
