import assert from "node:assert/strict";
import test from "node:test";

import {
  firstRouteAction,
  routeActionTimerParams,
} from "../../src/domain/route/routeStartAction.js";

test("selects the active route stop before upcoming stops", () => {
  const action = firstRouteAction([
    {
      id: "upcoming-1",
      lifecycle_status: "upcoming",
      subject: "turkce",
      subject_label: "Türkçe",
      topic: "Paragraf",
      week_start: "2026-09-14",
      position: 0,
      version: 2,
    },
    {
      id: "active-1",
      lifecycle_status: "active",
      subject: "matematik",
      subject_label: "Matematik",
      topic: "Problemler",
      week_start: "2026-09-21",
      position: 2,
      version: 5,
    },
  ]);

  assert.equal(action.stopId, "active-1");
  assert.equal(action.title, "Matematik · Problemler");
  assert.deepEqual(routeActionTimerParams(action), {
    subjectKey: "matematik",
    topicName: "Problemler",
    routeStopId: "active-1",
    routeStopVersion: 5,
  });
});

test("falls back to the earliest upcoming route stop", () => {
  const action = firstRouteAction([
    { id: "b", lifecycleStatus: "upcoming", subject: "fen", topic: "Kuvvet", weekStart: "2026-09-21", position: 1 },
    { id: "a", lifecycleStatus: "upcoming", subject: "turkce", topic: "Sözcükte Anlam", weekStart: "2026-09-14", position: 0 },
  ]);

  assert.equal(action.stopId, "a");
  assert.equal(action.subjectLabel, "turkce");
});

test("ignores terminal route stops", () => {
  const action = firstRouteAction([
    { id: "done", lifecycle_status: "completed", subject: "matematik", topic: "Problemler" },
    { id: "skip", lifecycle_status: "skipped", subject: "turkce", topic: "Paragraf" },
  ]);

  assert.equal(action, null);
});
