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
    routeSubjectKey: "matematik",
    routeTopicName: "Problemler",
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

test("accepts persisted stopId shape from the route screen", () => {
  const action = firstRouteAction([
    { stopId: "persisted-1", lifecycleStatus: "active", subject: "fen", topic: "Basınç", version: 3 },
  ]);

  assert.deepEqual(routeActionTimerParams(action), {
    subjectKey: "fen",
    topicName: "Basınç",
    routeSubjectKey: "fen",
    routeTopicName: "Basınç",
    routeStopId: "persisted-1",
    routeStopVersion: 3,
  });
});

test("adds reasoning, confidence and effort metadata to the next route action", () => {
  const action = firstRouteAction([
    {
      id: "active-2",
      lifecycleStatus: "active",
      subject: "matematik",
      subjectLabel: "Matematik",
      topic: "Problemler",
      cost: { questions: 72, minutes: 120 },
      dataConfidence: "medium",
      insight: {
        reasonCode: "LOW_ACCURACY",
        reasonText: "Son denemelerde zayıf kalan alana denk geliyor.",
        expectedNetGain: 1.24,
      },
    },
  ]);

  assert.equal(action.reasonCode, "LOW_ACCURACY");
  assert.equal(action.confidenceLabel, "orta");
  assert.equal(action.effort, "72 soru · ~120 dk");
  assert.equal(action.impact, "~+1.2 net potansiyeli");
  assert.match(action.message, /Son denemelerde zayıf kalan/);
});

test("skips locked and frozen route stops because they are not startable", () => {
  const action = firstRouteAction([
    { id: "locked", lifecycleStatus: "active", locked: true, subject: "matematik", topic: "Problemler" },
    { id: "frozen", lifecycleStatus: "upcoming", frozenUntil: "2026-09-17", subject: "turkce", topic: "Paragraf" },
    { id: "next", lifecycleStatus: "upcoming", subject: "fen", topic: "Basınç", weekStart: "2026-09-14" },
  ]);

  assert.equal(action.stopId, "next");
  assert.equal(action.status, "upcoming");
});

test("ignores terminal route stops", () => {
  const action = firstRouteAction([
    { id: "done", lifecycle_status: "completed", subject: "matematik", topic: "Problemler" },
    { id: "skip", lifecycle_status: "skipped", subject: "turkce", topic: "Paragraf" },
  ]);

  assert.equal(action, null);
});
