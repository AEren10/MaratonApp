import test from "node:test";
import assert from "node:assert/strict";

import { groupStreakLine } from "../../src/domain/streak/groupStreakLine.js";

test("grup serisi cumlesi eksigi soyler", () => {
  assert.match(groupStreakLine({ streak: 4, today_done: 2, members: 3 }), /2\/3 çalıştı.*seri 5 olur/);
  assert.match(groupStreakLine({ streak: 5, today_done: 3, members: 3 }), /herkes çalıştı\. Seri 5/);
  assert.match(groupStreakLine({ streak: 0, today_done: 0, members: 1 }), /davet et/);
});
