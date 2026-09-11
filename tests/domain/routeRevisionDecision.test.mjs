import assert from "node:assert/strict";
import test from "node:test";

import {
  ROUTE_REVISION_DECISION_VERSION,
  routeRevisionDecision,
} from "../../src/domain/route/routeRevisionDecision.js";

test("keeps unchanged route revisions quiet", () => {
  const decision = routeRevisionDecision({
    counts: { added: 0, removed: 0, moved: 0, resized: 0 },
    totalChanges: 0,
  });

  assert.equal(decision.version, ROUTE_REVISION_DECISION_VERSION);
  assert.equal(decision.changed, false);
  assert.equal(decision.urgency, "none");
  assert.equal(decision.shouldNotify, false);
  assert.equal(decision.shouldCreateRevision, false);
  assert.equal(decision.primaryAction, "continue_current_route");
});

test("marks structural route changes as visible revision work", () => {
  const decision = routeRevisionDecision({
    counts: { added: 2, removed: 0, moved: 0, resized: 0 },
    totalChanges: 2,
  });

  assert.equal(decision.changed, true);
  assert.equal(decision.urgency, "high");
  assert.equal(decision.shouldNotify, true);
  assert.equal(decision.shouldCreateRevision, true);
  assert.match(decision.reason, /Yeni güçlü sinyal/);
});

test("keeps small ordering changes softer than structural changes", () => {
  const decision = routeRevisionDecision({
    counts: { added: 0, removed: 0, moved: 1, resized: 0 },
    totalChanges: 1,
  });

  assert.equal(decision.changed, true);
  assert.equal(decision.urgency, "low");
  assert.equal(decision.shouldNotify, false);
  assert.match(decision.headline, /Sıra/);
});
