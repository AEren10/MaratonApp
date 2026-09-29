import test from "node:test";
import assert from "node:assert/strict";

import {
  invalidateInFlightResource,
  makeInFlightKey,
  resetInFlightRequests,
  shareInFlight,
} from "../../src/lib/inflightRequest.js";

test.beforeEach(() => resetInFlightRequests());

test("eight identical reads share one loader and receive separate shallow copies", async () => {
  let calls = 0;
  let release;
  const gate = new Promise((resolve) => { release = resolve; });
  const key = makeInFlightKey("study_logs", "user-1", {
    from: "2026-08-01",
    to: "2026-09-29",
    limit: 1000,
  });
  const loader = async () => {
    calls += 1;
    await gate;
    return [{ id: 1 }, { id: 2 }];
  };

  const reads = Array.from({ length: 8 }, () => shareInFlight(key, loader));
  release();
  const results = await Promise.all(reads);

  assert.equal(calls, 1);
  assert.equal(results.length, 8);
  results[0].sort((a, b) => b.id - a.id);
  assert.deepEqual(results[0].map((row) => row.id), [2, 1]);
  assert.deepEqual(results[1].map((row) => row.id), [1, 2]);
  assert.notStrictEqual(results[0], results[1]);
});

test("all request parameters participate in the key", () => {
  const base = makeInFlightKey("study_logs", "user-1", {
    from: "2026-08-01", to: "2026-09-29", limit: 1000,
  });
  assert.notEqual(base, makeInFlightKey("study_logs", "user-2", {
    from: "2026-08-01", to: "2026-09-29", limit: 1000,
  }));
  assert.notEqual(base, makeInFlightKey("study_logs", "user-1", {
    from: "2026-08-02", to: "2026-09-29", limit: 1000,
  }));
  assert.notEqual(base, makeInFlightKey("study_logs", "user-1", {
    from: "2026-08-01", to: "2026-09-29", limit: 20,
  }));
});

test("completed and failed reads are not cached", async () => {
  const key = makeInFlightKey("topic_progress", "user-1", {});
  let calls = 0;
  const loader = async () => {
    calls += 1;
    if (calls === 1) throw new Error("temporary");
    return [{ id: calls }];
  };

  await assert.rejects(shareInFlight(key, loader), /temporary/);
  assert.deepEqual(await shareInFlight(key, loader), [{ id: 2 }]);
  assert.deepEqual(await shareInFlight(key, loader), [{ id: 3 }]);
  assert.equal(calls, 3);
});

test("resource invalidation lets the next read bypass an older in-flight request", async () => {
  const key = makeInFlightKey("route_plan", "user-1", { examType: "tyt_ayt" });
  const releases = [];
  let calls = 0;
  const loader = () => new Promise((resolve) => {
    calls += 1;
    const version = calls;
    releases.push(() => resolve([{ version }]));
  });

  const staleRead = shareInFlight(key, loader);
  await Promise.resolve();
  invalidateInFlightResource("route_plan", "user-1");
  const freshRead = shareInFlight(key, loader);
  await Promise.resolve();

  assert.equal(calls, 2);
  releases[0]();
  releases[1]();
  assert.deepEqual(await staleRead, [{ version: 1 }]);
  assert.deepEqual(await freshRead, [{ version: 2 }]);
});
