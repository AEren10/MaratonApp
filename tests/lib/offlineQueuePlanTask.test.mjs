import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../src/lib/offlineQueue.js", import.meta.url), "utf8");

test("queued plan task toggles carry user ownership", () => {
  assert.match(source, /togglePlanTask\(item\.payload\.taskId, item\.payload\.completed, item\.payload\.user_id\)/);
  assert.match(source, /payload: \{ taskId, completed, user_id: userId \}/);
});
