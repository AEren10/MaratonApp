import assert from "node:assert/strict";
import test from "node:test";

import {
  isRoutePausedForExam,
  routePausedAtForExam,
  routeStateBelongsToExam,
} from "../../src/domain/route/routePauseState.js";

test("accepts legacy route state without exam type", () => {
  assert.equal(routeStateBelongsToExam({ exam_type: null }, "tyt"), true);
});

test("does not pause a different exam route", () => {
  const state = {
    exam_type: "lgs",
    paused_at: "2026-09-10T10:00:00.000Z",
    resumed_at: null,
  };

  assert.equal(routeStateBelongsToExam(state, "tyt"), false);
  assert.equal(isRoutePausedForExam(state, "tyt"), false);
  assert.equal(routePausedAtForExam(state, "tyt"), null);
});

test("detects active pause for the current exam", () => {
  const state = {
    exam_type: "tyt",
    paused_at: "2026-09-10T10:00:00.000Z",
    resumed_at: null,
  };

  assert.equal(isRoutePausedForExam(state, "tyt"), true);
  assert.equal(routePausedAtForExam(state, "tyt"), state.paused_at);
});

test("treats resumed route as not paused", () => {
  const state = {
    exam_type: "tyt",
    paused_at: "2026-09-10T10:00:00.000Z",
    resumed_at: "2026-09-11T10:00:00.000Z",
  };

  assert.equal(isRoutePausedForExam(state, "tyt"), false);
});
