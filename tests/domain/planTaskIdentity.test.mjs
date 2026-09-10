import assert from "node:assert/strict";
import test from "node:test";

import {
  buildPlanTaskKey,
  findPlanTaskByStudyContext,
  normalizePlanTopic,
  planTaskMatchesStudy,
} from "../../src/domain/plan/planTaskIdentity.js";

test("builds the same stable key for subject topic plan tasks", () => {
  assert.equal(buildPlanTaskKey("matematik", "Problemler"), "plan_matematik_problemler");
  assert.equal(
    buildPlanTaskKey({ subject: "matematik", topic: " Problemler " }),
    "plan_matematik_problemler",
  );
});

test("uses logical route stop key when a generated route task has one", () => {
  assert.equal(
    buildPlanTaskKey({ subject: "matematik", topic: "Problemler", logicalStopKey: "math:a" }),
    "plan_math:a",
  );
});

test("matches a saved study only when original plan context stayed intact", () => {
  assert.equal(planTaskMatchesStudy({
    planSubject: "turkce",
    planTopic: "Paragraf",
    studySubject: "turkce",
    studyTopic: "paragraf",
  }), true);
  assert.equal(planTaskMatchesStudy({
    planSubject: "turkce",
    planTopic: "Paragraf",
    studySubject: "matematik",
    studyTopic: "Problemler",
  }), false);
  assert.equal(planTaskMatchesStudy({
    planSubject: "matematik",
    planTopic: null,
    studySubject: "matematik",
    studyTopic: "Problemler",
  }), true);
});

test("finds the daily plan row by subject and normalized topic", () => {
  const row = findPlanTaskByStudyContext([
    { id: "a", subject: "matematik", topic: "Problemler" },
    { id: "b", subject: "turkce", topic: "Paragraf" },
  ], { subject: "turkce", topic: " paragraf " });

  assert.equal(row.id, "b");
  assert.equal(normalizePlanTopic(null), "genel");
});
