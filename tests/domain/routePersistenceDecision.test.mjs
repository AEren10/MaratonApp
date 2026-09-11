import assert from "node:assert/strict";
import test from "node:test";

import {
  ROUTE_PERSISTENCE_DECISION_VERSION,
  routePersistenceDecision,
} from "../../src/domain/route/routePersistenceDecision.js";

test("persists the first route snapshot", () => {
  const decision = routePersistenceDecision({ routeCreated: false });

  assert.equal(decision.version, ROUTE_PERSISTENCE_DECISION_VERSION);
  assert.equal(decision.shouldPersist, true);
  assert.equal(decision.reason, "first_route");
});

test("does not rewrite an unchanged route", () => {
  const decision = routePersistenceDecision({
    routeCreated: true,
    revisionSummary: {
      changed: false,
      decision: { shouldCreateRevision: false },
    },
  });

  assert.equal(decision.shouldPersist, false);
  assert.equal(decision.reason, "unchanged_route");
});

test("keeps low urgency automatic revisions as preview", () => {
  const decision = routePersistenceDecision({
    mode: "auto",
    routeCreated: true,
    revisionSummary: {
      changed: true,
      decision: { urgency: "low", shouldCreateRevision: true },
    },
  });

  assert.equal(decision.shouldPersist, false);
  assert.equal(decision.reason, "low_urgency_preview");
});

test("allows explicit low urgency route saves", () => {
  const decision = routePersistenceDecision({
    mode: "explicit",
    routeCreated: true,
    revisionSummary: {
      changed: true,
      decision: { urgency: "low", shouldCreateRevision: true },
    },
  });

  assert.equal(decision.shouldPersist, true);
  assert.equal(decision.reason, "low_revision");
});

test("persists meaningful automatic revisions", () => {
  const decision = routePersistenceDecision({
    mode: "auto",
    routeCreated: true,
    revisionSummary: {
      changed: true,
      decision: { urgency: "high", shouldCreateRevision: true },
    },
  });

  assert.equal(decision.shouldPersist, true);
  assert.equal(decision.reason, "high_revision");
});
