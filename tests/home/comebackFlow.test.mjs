import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const heroSource = readFileSync(
  new URL("../../src/screens/home/components/HomeHero.js", import.meta.url),
  "utf8",
);
const screenSource = readFileSync(
  new URL("../../src/screens/home/HomeScreen.js", import.meta.url),
  "utf8",
);
const overlaySource = readFileSync(
  new URL("../../src/screens/home/components/HomeComebackOverlay.js", import.meta.url),
  "utf8",
);
const modalSource = readFileSync(
  new URL("../../src/components/common/ComebackModal.js", import.meta.url),
  "utf8",
);

test("comeback prompt is owned by the home hero", () => {
  assert.match(screenSource, /comeback=\{h\.comebackFlow\.stage === "prompt" \? h\.comeback : null\}/);
  assert.match(heroSource, /onBeginComeback\?\.\(\);/);
  assert.match(heroSource, /onStartTask\?\.\(task\);/);
});

test("comeback overlay cannot render the old prompt over the hero", () => {
  assert.match(overlaySource, /disablePrompt/);
  assert.match(modalSource, /stage === "prompt" && !disablePrompt/);
  assert.doesNotMatch(overlaySource, /useComebackFlow/);
});
