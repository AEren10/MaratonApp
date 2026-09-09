import assert from "node:assert/strict";
import test from "node:test";

import {
  createRouteRevision,
  decorateScheduledRoute,
  makeRouteStopRootKey,
} from "../../src/domain/route/routeIdentity.js";

const stop = (topic, overrides = {}) => ({
  subject: "matematik",
  subjectLabel: "Matematik",
  topic,
  cost: { questions: 20, minutes: 28 },
  ...overrides,
});

test("stop identity is stable and exam scoped", () => {
  assert.equal(makeRouteStopRootKey(stop("Problemler"), "yks"), makeRouteStopRootKey(stop("Problemler"), "yks"));
  assert.notEqual(makeRouteStopRootKey(stop("Problemler"), "yks"), makeRouteStopRootKey(stop("Problemler"), "lgs"));
});

test("decorator creates one active stop and stable segment identities", () => {
  const weeks = [
    { weekNo: 1, weekStart: "2026-09-07", stops: [stop("Problemler", { partial: true })] },
    { weekNo: 2, weekStart: "2026-09-14", stops: [stop("Problemler", { continued: true }), stop("Fonksiyonlar")] },
  ];
  const first = decorateScheduledRoute(weeks, { examType: "yks" });
  const second = decorateScheduledRoute(weeks, { examType: "yks" });
  const statuses = first.flatMap((week) => week.stops.map((item) => item.lifecycleStatus));
  assert.equal(statuses.filter((status) => status === "active").length, 1);
  assert.deepEqual(
    first.flatMap((week) => week.stops.map((item) => item.logicalStopKey)),
    second.flatMap((week) => week.stops.map((item) => item.logicalStopKey)),
  );
  assert.equal(first[1].stops[0].segmentIndex, 1);
});

test("revision key changes only when route inputs change", () => {
  const weeks = decorateScheduledRoute([
    { weekNo: 1, weekStart: "2026-09-07", stops: [stop("Problemler")] },
  ], { examType: "yks" });
  const input = { weeks, examType: "yks", weekStart: "2026-09-07", capacity: { questionsPerWeek: 140 } };
  assert.deepEqual(createRouteRevision(input), createRouteRevision(input));
  assert.notEqual(
    createRouteRevision(input).revisionKey,
    createRouteRevision({ ...input, capacity: { questionsPerWeek: 180 } }).revisionKey,
  );
});
