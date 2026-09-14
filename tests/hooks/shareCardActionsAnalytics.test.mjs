import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const actions = readFileSync(
  new URL("../../src/hooks/useShareCardActions.js", import.meta.url),
  "utf8",
);
const screen = readFileSync(
  new URL("../../src/screens/social/ShareCardScreen.js", import.meta.url),
  "utf8",
);

test("story share success records card metadata", () => {
  assert.match(actions, /import \{ EVENTS \} from "\.\.\/constants\/analytics"/);
  assert.match(actions, /track\(EVENTS\.WRAPPED_SHARED, \{ source: "share_card", \.\.\.\(getShareMeta\?\.\(\) \|\| \{\}\) \}\)/);
  assert.match(screen, /cardId: activeCard\?\.id \|\| null, mode/);
  assert.match(screen, /useShareCardActions\(cardRef, shareMeta\)/);
});
