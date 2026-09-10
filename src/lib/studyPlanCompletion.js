import * as Crypto from "expo-crypto";

import { findPlanTaskByStudyContext } from "../domain/plan/planTaskIdentity";
import {
  expectedStudyContextMatches,
  resolveStudyCompletionScope,
} from "../domain/study/studyPlanCompletionModel";
import { savePlanTaskToggleOffline } from "./offlineQueue";
import { getDailyPlan } from "../supabase/plans";
import { transitionRouteStop } from "../supabase/routePlan";

export async function completeStudyPlanContext({
  userId,
  studyDate,
  subjectKey,
  topic,
  planSubjectKey,
  planTopicName,
  planTaskKey,
  routeStopId,
  routeStopVersion,
  routeSubjectKey,
  routeTopicName,
} = {}) {
  const scope = resolveStudyCompletionScope({ userId, planTaskKey, routeStopId });
  if (scope.skipped) return { skipped: scope.skipped };

  const expectedSubject = scope.shouldCompletePlan ? planSubjectKey : routeSubjectKey;
  const expectedTopic = scope.shouldCompletePlan ? planTopicName : routeTopicName;
  const matches = expectedStudyContextMatches({
    expectedSubject,
    expectedTopic,
    studySubject: subjectKey,
    studyTopic: topic,
  });
  if (!matches) return { skipped: "study_changed" };

  const result = { planCompleted: false, routeCompleted: false };

  if (routeStopId) {
    try {
      await transitionRouteStop({
        stopId: routeStopId,
        transition: "completed",
        expectedVersion: routeStopVersion ?? 1,
        clientOperationId: Crypto.randomUUID(),
        payload: {
          source: "study_save",
          plan_task_key: planTaskKey || null,
        },
      });
      result.routeCompleted = true;
    } catch (e) {
      result.routeError = e;
      return result;
    }
  }

  if (!scope.shouldCompletePlan) {
    result.planSkipped = "missing_plan_task";
    return result;
  }

  try {
    const dbPlan = await getDailyPlan(userId, studyDate);
    const dbTask = findPlanTaskByStudyContext(dbPlan?.plan_tasks || [], {
      subject: planSubjectKey,
      topic: planTopicName,
    });
    if (dbTask && !dbTask.completed) {
      await savePlanTaskToggleOffline(dbTask.id, true);
      result.planCompleted = true;
    } else if (dbTask?.completed) {
      result.planAlreadyCompleted = true;
    } else {
      result.planSkipped = "task_not_found";
    }
  } catch (e) {
    result.planError = e;
  }

  return result;
}
