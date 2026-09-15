import { readFileSync } from "node:fs";
import test from "node:test";
import assert from "node:assert/strict";

const FILES = [
  "src/screens/roadmap/RoadmapScreen.js",
  "src/screens/roadmap/RouteFullScreen.js",
  "src/screens/roadmap/components/RouteFullSummary.js",
];

test("roadmap jsx props do not contain bare template placeholders", () => {
  for (const file of FILES) {
    const src = readFileSync(file, "utf8");
    assert.doesNotMatch(src, /=\{\$\{/, `${file} has invalid JSX template syntax`);
    assert.doesNotMatch(src, /\?\s*\$\{/, `${file} has invalid ternary template syntax`);
  }
});
