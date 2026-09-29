import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

function src(path) {
  return readFileSync(new URL(`../../${path}`, import.meta.url), "utf8");
}

test("wrong detail ignores legacy community parameters in V1", () => {
  const screen = src("src/screens/wrong-notebook/WrongDetailScreen.js");

  assert.match(screen, /return <OwnWrongDetail \/>;/);
  assert.doesNotMatch(screen, /CommunityQuestionDetail/);
  assert.doesNotMatch(screen, /params\??\.community/);
});
