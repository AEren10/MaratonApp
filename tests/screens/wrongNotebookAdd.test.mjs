import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const addWrongSource = readFileSync(new URL("../../src/screens/wrong-notebook/AddWrongScreen.js", import.meta.url), "utf8");
const emptySource = readFileSync(new URL("../../src/screens/wrong-notebook/components/NotebookEmpty.js", import.meta.url), "utf8");

test("NotebookEmpty is centered vertically with flex and justifyContent", () => {
  assert.match(emptySource, /flex:\s*1/);
  assert.match(emptySource, /justifyContent:\s*["']center["']/);
});

test("AddWrongScreen does not use undefined topics.slice and uses suggestions", () => {
  assert.doesNotMatch(addWrongSource, /form\.topics\.slice/);
  assert.match(addWrongSource, /form\.suggestions/);
  assert.match(addWrongSource, /form\.selectedTopic/);
  assert.match(addWrongSource, /form\.setTopic/);
});

test("AddWrongScreen wires AddWrongFooter and XPBoostToast cleanly", () => {
  assert.match(addWrongSource, /AddWrongFooter/);
  assert.match(addWrongSource, /onSave=\{form\.save\}/);
  assert.match(addWrongSource, /onSaveAndNew=\{form\.saveAndNew\}/);
  assert.match(addWrongSource, /XPBoostToast/);
  assert.match(addWrongSource, /visible=\{form\.xpToast\.visible\}/);
});
