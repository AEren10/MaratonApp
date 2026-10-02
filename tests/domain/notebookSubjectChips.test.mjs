import test from "node:test";
import assert from "node:assert/strict";
import { notebookSubjectChips } from "../../src/domain/wrongNotebook/subjectChips.js";

test("only subjects with wrongs, most first", () => {
  const items = [{ subject: "turkce" }, { subject: "matematik" }, { subject: { key: "matematik" } }, { subject: null }];
  const chips = notebookSubjectChips(items, (k) => ({ turkce: "Türkçe", matematik: "Matematik" })[k]);
  assert.deepEqual(chips.map((c) => [c.key, c.count]), [["matematik", 2], ["turkce", 1]]);
});
