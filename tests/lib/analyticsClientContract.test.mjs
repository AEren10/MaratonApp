import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const analytics = readFileSync(new URL("../../src/lib/analytics.js", import.meta.url), "utf8");
const auth = readFileSync(new URL("../../src/contexts/AuthContext.js", import.meta.url), "utf8");

test("analytics stores user partitions and acknowledges delivered ids", () => {
  assert.match(analytics, /buffersByUser/);
  assert.match(analytics, /client_event_id: event\.clientEventId/);
  assert.match(analytics, /acknowledgeAnalyticsPartition\(buffersByUser, owner, deliveredIds\)/);
  assert.match(analytics, /flushesByUser/);
});

test("logout and account deletion explicitly close analytics identity", () => {
  assert.match(auth, /await closeAnalytics\(\{ flush: true \}\)/);
  assert.match(auth, /const result = await deleteUserAccount\(\);[\s\S]*closeAnalytics\(\{ flush: false \}\)/);
});

test("login tracking is owner-bound after asynchronous initialization", () => {
  assert.match(auth, /trackForAnalyticsUser\(s\.user\.id, EVENTS\.AUTH_LOGIN/);
  assert.doesNotMatch(auth, /initAnalytics\(s\.user\.id\)[\s\S]{0,300}\btrack\(EVENTS\.AUTH_LOGIN/);
});
