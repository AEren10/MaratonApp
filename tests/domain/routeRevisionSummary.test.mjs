import assert from "node:assert/strict";
import test from "node:test";

import {
  ROUTE_REVISION_SUMMARY_VERSION,
  summarizeRouteRevision,
} from "../../src/domain/route/routeRevisionSummary.js";

function week(weekStart, stops) {
  return { weekStart, stops };
}

function stop(key, subject, topic, questions = 40, minutes = 60) {
  return {
    logicalStopKey: key,
    subject,
    subjectLabel: subject === "matematik" ? "Matematik" : "Türkçe",
    topic,
    cost: { questions, minutes },
  };
}

test("summarizes added, removed, moved and resized route revision changes", () => {
  const summary = summarizeRouteRevision({
    previousRevision: { revisionKey: "old" },
    nextRevision: { revisionKey: "new" },
    previousWeeks: [
      week("2026-09-14", [stop("a", "matematik", "Problemler"), stop("b", "turkce", "Paragraf")]),
      week("2026-09-21", [stop("c", "matematik", "Geometri", 30, 45)]),
    ],
    nextWeeks: [
      week("2026-09-14", [stop("a", "matematik", "Problemler", 50, 75)]),
      week("2026-09-21", [stop("b", "turkce", "Paragraf"), stop("d", "matematik", "Fonksiyonlar")]),
    ],
  });

  assert.equal(summary.version, ROUTE_REVISION_SUMMARY_VERSION);
  assert.equal(summary.changed, true);
  assert.equal(summary.previousRevisionKey, "old");
  assert.equal(summary.nextRevisionKey, "new");
  assert.equal(summary.counts.added, 1);
  assert.equal(summary.counts.removed, 1);
  assert.equal(summary.counts.moved, 1);
  assert.equal(summary.counts.resized, 1);
  assert.equal(summary.counts.unchanged, 0);
  assert.equal(summary.decision.urgency, "high");
  assert.equal(summary.decision.shouldNotify, true);
  assert.match(summary.headline, /yeniden dengelendi/);
  assert.ok(summary.changes.some((change) => change.type === "resized" && change.delta.questions === 10));
});

test("keeps a quiet summary when the route did not materially change", () => {
  const weeks = [week("2026-09-14", [stop("a", "matematik", "Problemler")])];
  const summary = summarizeRouteRevision({ previousWeeks: weeks, nextWeeks: weeks });

  assert.equal(summary.changed, false);
  assert.equal(summary.totalChanges, 0);
  assert.equal(summary.decision.shouldCreateRevision, false);
  assert.equal(summary.counts.unchanged, 1);
  assert.match(summary.nextAction, /Mevcut plana devam/);
});

test("treats persisted route week stop effort as unchanged", () => {
  const weeks = [{
    week_start: "2026-09-14",
    stops: [{
      logicalStopKey: "a",
      subject: "matematik",
      subjectLabel: "Matematik",
      topic: "Problemler",
      questions: 40,
      minutes: 60,
    }],
  }];
  const summary = summarizeRouteRevision({
    previousRevision: { revision_key: "old-snake" },
    nextRevision: { revision_key: "new-snake" },
    previousWeeks: weeks,
    nextWeeks: weeks,
  });

  assert.equal(summary.changed, false);
  assert.equal(summary.counts.resized, 0);
  assert.equal(summary.counts.unchanged, 1);
  assert.equal(summary.previousRevisionKey, "old-snake");
  assert.equal(summary.nextRevisionKey, "new-snake");
});

test("labels same-week reordering without claiming the stop moved weeks", () => {
  const summary = summarizeRouteRevision({
    previousWeeks: [week("2026-09-14", [
      stop("a", "matematik", "Problemler"),
      stop("b", "turkce", "Paragraf"),
    ])],
    nextWeeks: [week("2026-09-14", [
      stop("b", "turkce", "Paragraf"),
      stop("a", "matematik", "Problemler"),
    ])],
  });

  assert.equal(summary.counts.moved, 2);
  assert.ok(summary.changes.every((change) => change.title.includes("hafta içinde")));
});
