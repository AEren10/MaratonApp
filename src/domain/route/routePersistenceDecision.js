export const ROUTE_PERSISTENCE_DECISION_VERSION = "route-persistence-decision-v1";

export function routePersistenceDecision({
  mode = "auto",
  routeCreated = false,
  revisionSummary = null,
} = {}) {
  if (!routeCreated) {
    return {
      version: ROUTE_PERSISTENCE_DECISION_VERSION,
      shouldPersist: true,
      reason: "first_route",
    };
  }

  if (!revisionSummary) {
    return {
      version: ROUTE_PERSISTENCE_DECISION_VERSION,
      shouldPersist: false,
      reason: "missing_revision_summary",
    };
  }

  if (revisionSummary.changed === false || revisionSummary.decision?.shouldCreateRevision === false) {
    return {
      version: ROUTE_PERSISTENCE_DECISION_VERSION,
      shouldPersist: false,
      reason: "unchanged_route",
    };
  }

  if (mode === "auto" && revisionSummary.decision?.urgency === "low") {
    return {
      version: ROUTE_PERSISTENCE_DECISION_VERSION,
      shouldPersist: false,
      reason: "low_urgency_preview",
    };
  }

  return {
    version: ROUTE_PERSISTENCE_DECISION_VERSION,
    shouldPersist: true,
    reason: revisionSummary.decision?.urgency
      ? `${revisionSummary.decision.urgency}_revision`
      : "changed_revision",
  };
}
