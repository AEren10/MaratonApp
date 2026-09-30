import * as Crypto from "expo-crypto";

import { findPlanTaskByStudyContext } from "../domain/plan/planTaskIdentity";
import {
  expectedStudyContextMatches,
  resolveStudyCompletionScope,
} from "../domain/study/studyPlanCompletionModel";
import { savePlanTaskToggleOffline } from "./offlineQueue";
import { saveRouteStopTransitionOffline } from "./offlineQueue";
import { getDailyPlan } from "../supabase/plans";

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
  routeStopQuestions = 0,
  questionCount = null,
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

  // Planlananin yarisindan azi cozulduyse durak "bitti" sayilmaz: hafta
  // sabit, bitmis sayilan durak bir daha gelmiyor ve kalan is kayboluyordu.
  // Soru girilmediyse (okuma, konu calismasi) olculemez; kural devreye girmez.
  const solved = Number(questionCount) || 0;
  const planned = Number(routeStopQuestions) || 0;
  if (planned > 0 && solved > 0 && solved < planned * 0.5) {
    return { ...result, skipped: "partial", solved, planned };
  }

  if (routeStopId) {
    try {
      const routeResult = await saveRouteStopTransitionOffline({
        userId,
        stopId: routeStopId,
        transition: "completed",
        expectedVersion: routeStopVersion ?? 1,
        clientOperationId: Crypto.randomUUID(),
        payload: {
          source: "study_save",
          plan_task_key: planTaskKey || null,
        },
      });
      result.routeCompleted = routeResult.saved;
      result.routeQueued = routeResult.queued;
      if (routeResult.error && !routeResult.queued) {
        result.routeError = routeResult.error;
        return result;
      }
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
      await savePlanTaskToggleOffline(dbTask.id, true, userId);
      result.planCompleted = true;
      result.planTaskOperationId = `plan_task_${dbTask.id}`;
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
