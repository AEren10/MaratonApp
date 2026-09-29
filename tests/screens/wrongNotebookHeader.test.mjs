import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const notebookScreenSource = readFileSync(
  new URL("../../src/screens/wrong-notebook/WrongNotebookScreen.js", import.meta.url),
  "utf8"
);
const headerSource = readFileSync(
  new URL("../../src/screens/wrong-notebook/components/WrongScreenHeader.js", import.meta.url),
  "utf8"
);

test("WrongScreenHeader accepts badge and places it alongside title", () => {
  assert.match(headerSource, /badge/);
  assert.match(headerSource, /styles\.titleRow/);
  assert.match(headerSource, /styles\.badge/);
});

test("WrongNotebookScreen displays count badge next to header title without separate tab bar", () => {
  assert.match(notebookScreenSource, /WrongScreenHeader\s+title="Defterim"\s+badge=\{view\.openCount\}/);
  assert.doesNotMatch(notebookScreenSource, /<NotebookHeaderTabs/);
  assert.doesNotMatch(notebookScreenSource, /CommunityTab/);
});
