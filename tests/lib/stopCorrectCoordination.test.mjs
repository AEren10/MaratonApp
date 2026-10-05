import test from "node:test";
import assert from "node:assert/strict";

import { afterStopWrite } from "../../src/lib/stopCorrectCoordination.js";

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((ok, fail) => { resolve = ok; reject = fail; });
  return { promise, resolve, reject };
}

test("dogru sayisi tamamlama yazisi bitmeden kaliciya gitmez", async () => {
  const write = deferred();
  let persisted = false;
  const result = afterStopWrite(write.promise, async () => { persisted = true; return "saved"; });

  await Promise.resolve();
  assert.equal(persisted, false);
  write.resolve();
  assert.equal(await result, "saved");
  assert.equal(persisted, true);
});

test("tamamlama hatalansa da son kalicilastirma denemesi yapilir", async () => {
  const write = deferred();
  const result = afterStopWrite(write.promise, async () => "retried");
  write.reject(new Error("offline"));
  assert.equal(await result, "retried");
});
