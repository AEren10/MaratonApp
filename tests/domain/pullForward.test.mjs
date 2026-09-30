import test from "node:test";
import assert from "node:assert/strict";

import { applyPulls, pullCandidate } from "../../src/domain/program/pullForward.js";

const stop = (key, status = "upcoming") => ({ logicalStopKey: key, lifecycleStatus: status });
const weeks = () => [
  { weekStart: "2026-09-28", stops: [stop("a:2026-09-28:0", "completed")] },
  { weekStart: "2026-10-05", stops: [stop("b:2026-10-05:0"), stop("c:2026-10-05:0")] },
];

test("bu haftanin durak kalmadiysa gelecek haftanin ilk acik duragi aday", () => {
  assert.equal(pullCandidate(weeks(), "2026-10-01").logicalStopKey, "b:2026-10-05:0");
});

test("bu haftada acik durak varsa one cekme onerilmez", () => {
  const w = weeks();
  w[0].stops.push(stop("d:2026-09-28:0", "active"));
  assert.equal(pullCandidate(w, "2026-10-01"), null);
});

test("bugune tasinan gelecek hafta duragi bu haftaya aktarilir, oradan cikar", () => {
  const out = applyPulls(weeks(), { "b:2026-10-05:0": "2026-10-01" });
  assert.deepEqual(out[0].stops.map((s) => s.logicalStopKey), ["a:2026-09-28:0", "b:2026-10-05:0"]);
  assert.equal(out[0].stops[1].pulledForward, true);
  assert.deepEqual(out[1].stops.map((s) => s.logicalStopKey), ["c:2026-10-05:0"]);
});

test("ayni hafta icindeki tasima ve ileri tasima dokunulmaz", () => {
  const w = weeks();
  const out = applyPulls(w, { "b:2026-10-05:0": "2026-10-07", "a:2026-09-28:0": "2026-10-06" });
  assert.equal(out, w);
});
