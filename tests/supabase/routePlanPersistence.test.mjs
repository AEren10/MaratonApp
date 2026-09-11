import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/supabase/routePlan.js", import.meta.url), "utf8");

test("route weeks are persisted through the revision RPC transaction", () => {
  assert.match(source, /rpc\("persist_route_revision"/);
  assert.doesNotMatch(source, /\.from\(TABLE\)\s*[\s\S]{0,120}\.upsert/);
});
