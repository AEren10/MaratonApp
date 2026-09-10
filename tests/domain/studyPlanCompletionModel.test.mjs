import assert from "node:assert/strict";
import test from "node:test";

import {
  expectedStudyContextMatches,
  resolveStudyCompletionScope,
} from "../../src/domain/study/studyPlanCompletionModel.js";

test("allows route-only completion without a plan task key", () => {
  assert.deepEqual(resolveStudyCompletionScope({
    userId: "user-1",
    routeStopId: "stop-1",
  }), {
    shouldCompletePlan: false,
    shouldCompleteRoute: true,
    skipped: null,
  });
});

test("requires at least one completion target", () => {
  assert.deepEqual(resolveStudyCompletionScope({ userId: "user-1" }), {
    skipped: "missing_context",
  });
});

test("protects a route stop when saved study context changed", () => {
  assert.equal(expectedStudyContextMatches({
    expectedSubject: "matematik",
    expectedTopic: "Problemler",
    studySubject: "turkce",
    studyTopic: "Paragraf",
  }), false);
});
