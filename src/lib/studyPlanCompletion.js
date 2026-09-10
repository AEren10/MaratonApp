import * as Crypto from "expo-crypto";

import { planTaskMatchesStudy, findPlanTaskByStudyContext } from "../domain/plan/planTaskIdentity";
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
} = {}) {
  if (!userId || userId === "dev" || !planTaskKey) return { skipped: "missing_context" };

  const matches = planTaskMatchesStudy({
    planSubject: planSubjectKey,
    planTopic: planTopicName,
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
          plan_task_key: planTaskKey,
        },
      });
      result.routeCompleted = true;
    } catch (e) {
      result.routeError = e;
      return result;
    }
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
