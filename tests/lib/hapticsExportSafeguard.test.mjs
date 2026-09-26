import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const hapticsSource = readFileSync(new URL("../../src/lib/haptics.js", import.meta.url), "utf8");

test("haptics module exports warning as alias for warn to prevent runtime crashes", () => {
  assert.match(hapticsSource, /export const warn = guard\(/);
  assert.match(hapticsSource, /export const warning = warn;/);
  assert.match(hapticsSource, /export const tap = guard\(/);
  assert.match(hapticsSource, /export const select = guard\(/);
  assert.match(hapticsSource, /export const medium = guard\(/);
  assert.match(hapticsSource, /export const success = guard\(/);
  assert.match(hapticsSource, /export const error = guard\(/);
});
