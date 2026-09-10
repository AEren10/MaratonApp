import { planTaskMatchesStudy } from "../plan/planTaskIdentity.js";

export function resolveStudyCompletionScope({ userId, planTaskKey, routeStopId } = {}) {
  if (!userId || userId === "dev") return { skipped: "missing_context" };

  const shouldCompletePlan = !!planTaskKey;
  const shouldCompleteRoute = !!routeStopId;
  if (!shouldCompletePlan && !shouldCompleteRoute) return { skipped: "missing_context" };

  return { shouldCompletePlan, shouldCompleteRoute, skipped: null };
}

export function expectedStudyContextMatches({
  expectedSubject,
  expectedTopic,
  studySubject,
  studyTopic,
} = {}) {
  if (!expectedSubject && !expectedTopic) return true;
  return planTaskMatchesStudy({
    planSubject: expectedSubject,
    planTopic: expectedTopic,
    studySubject,
    studyTopic,
  });
}
