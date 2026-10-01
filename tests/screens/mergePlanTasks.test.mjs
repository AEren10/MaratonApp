import test from "node:test";
import assert from "node:assert/strict";

import { mergePlanTasks } from "../../src/screens/plan/mergePlanTasks.js";

test("rota duragi bugun tamamlandiysa tik kaydi olmasa da bitti (ana sayfa 8/8, plan 1/8 hatasi)", () => {
  const out = mergePlanTasks([{ id: "a", done: true }, { id: "b", done: false }], [], new Map(), () => false);
  assert.deepEqual(out.map((t) => t.done), [true, false]);
});

test("cihazdaki tik kaydi da bitti sayar", () => {
  const out = mergePlanTasks([{ id: "a", done: false }], [], new Map(), (id) => id === "a");
  assert.equal(out[0].done, true);
});

test("bu ekranda az once isaretlenen korunur", () => {
  const out = mergePlanTasks([{ id: "a", done: false }], [{ id: "a", done: true }], new Map(), () => false);
  assert.equal(out[0].done, true);
});
