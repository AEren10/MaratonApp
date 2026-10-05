import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const completion = readFileSync(new URL("../../src/lib/stopCompletionLog.js", import.meta.url), "utf8");
const sheet = readFileSync(new URL("../../src/screens/home/components/StopCorrectSheet.js", import.meta.url), "utf8");

test("dogru sayisi bekleyen calisma kaydinin insert yukune eklenir", () => {
  assert.match(completion, /patchQueuedPayload\(operationId, \{ correct_count: value \}\)/);
  assert.match(completion, /value == null/);
  assert.doesNotMatch(completion, /value <= 0/);
});

test("dogru paneli iOS klavyesinden tek height davranisiyla kacinir", () => {
  assert.match(sheet, /keyboard keyboardBehavior="height"/);
});
