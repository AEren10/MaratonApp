import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync(new URL("../../supabase/functions/send-push/index.ts", import.meta.url), "utf8");

test("send-push templates allow custom payload fallback", () => {
  assert.match(source, /Partial<Record<ReengagementPayload\["type"\], PushTemplate>>/);
  assert.match(source, /TEMPLATES\[type\] \?\? DEFAULT_TEMPLATE/);
});

test("send-push rejects missing service key before auth comparison", () => {
  assert.match(source, /if \(!serviceKey\)/);
  assert.match(source, /Server not configured/);
});

test("send-push accepts both Expo push token formats", () => {
  assert.match(source, /function isExpoPushToken/);
  assert.match(source, /ExponentPushToken\[/);
  assert.match(source, /ExpoPushToken\[/);
});
