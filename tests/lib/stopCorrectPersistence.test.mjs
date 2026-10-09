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

const bottomSheet = readFileSync(new URL("../../src/components/design/BottomSheet.js", import.meta.url), "utf8");

// KeyboardAvoidingView statusBarTranslucent Modal icinde paneli ekranin
// tepesine itiyordu; panel klavye yuksekligini kendisi olcer.
test("dogru paneli klavyeden BottomSheet'in kendi olcumuyle kacinir", () => {
  assert.match(sheet, /<BottomSheet[^>]*\bkeyboard\b/);
  assert.doesNotMatch(bottomSheet, /<KeyboardAvoidingView|import \{[^}]*KeyboardAvoidingView/);
  assert.match(bottomSheet, /keyboardWillShow/);
});
