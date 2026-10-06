import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const preview = readFileSync("src/lib/routePreviewStore.js", "utf8");
const lifecycle = readFileSync("src/lib/session/sessionLifecycle.js", "utf8");

test("pending route preview is cleared before explicit sign out", () => {
  assert.match(lifecycle, /import \{ clearPendingPreview \} from "\.\.\/routePreviewStore"/);
  assert.match(lifecycle, /await clearPendingPreview\(\)[\s\S]{0,160}await supaSignOut/);
});

test("external sign out and account switches also clear preview memory and storage", () => {
  assert.match(preview, /registerSessionReset\(\(\) => \{/);
  assert.match(preview, /memory = null/);
  assert.match(preview, /appStorage\.remove\(KEY\)/);
});
