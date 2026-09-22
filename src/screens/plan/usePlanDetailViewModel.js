import { useEffect, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { useUserTasks } from "../../hooks/useUserTasks";
import { usePlanCompletion } from "../../hooks/usePlanCompletion";
import { usePlanContext } from "../../hooks/usePlanContext";
import { generateDailyPlan } from "../../lib/planEngine";
import { dateKey, todayTR } from "../../lib/dateUtils";
import { buildPlanTaskKey } from "../../domain/plan/planTaskIdentity";
import { usePlanDetailTasks } from "./usePlanDetailTasks";

export function formatMinutes(minutes) {
  if (!minutes) return "0 dk";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m} dk`;
  return m ? `${h} sa ${m} dk` : `${h} sa`;
}

export function usePlanDetailViewModel({ C, forceEmpty }) {
  const navigation = useNavigation();
  const { user } = useAuth();
  const showAlert = useAlert();
  const studyRoute = useStudyRoute();
  const planCtx = usePlanContext();
  const { tasks: userTasks, toggleTask: toggleUserTask, removeTask: removeUserTask } = useUserTasks();
  const { isDone, toggle, syncPlan } = usePlanCompletion(user?.id);

  // Günlük planın durakları: tüm haftanın değil, o güne ait duraklar
  const generatedTasks = useMemo(() => {
    const routeWeekStops = studyRoute.currentWeek?.stops || [];
    const generated = generateDailyPlan({ ...planCtx, routeWeekStops });
    const tasks = [...(generated.tasks || [])];

    // Bugün tamamlanmış rota duraklarını da dahil et: kullanıcı ekranı kapatsa
    // ya da gün içinde tekrar açsa bile bugün bitirdiği duraklar ve dakikalar kaybolmaz.
    const today = todayTR();
    const existingKeys = new Set(tasks.map((t) => t.planTaskKey || t.stopId));
    routeWeekStops.forEach((stop) => {
      const stopKey = stop.logicalStopKey ? buildPlanTaskKey(stop.subject, stop.topic) : null;
      const isCompletedToday = stop.lifecycleStatus === "completed" && (
        (stop.completedAt && dateKey(new Date(stop.completedAt)) === today) ||
        (stopKey && isDone?.(stopKey)) ||
        isDone?.(stop.id)
      );
      const key = stopKey || `plan_${stop.id || stop.stopId}`;
      if (isCompletedToday && !existingKeys.has(key) && !existingKeys.has(stop.id)) {
        const estMinutes = stop.cost?.minutes || stop.minutes || (stop.cost?.questions ? stop.cost.questions * 2 : 30);
        tasks.unshift({
          subject: stop.subject,
          subjectLabel: stop.subject,
          topic: stop.topic,
          topicLabel: stop.topic,
          stopId: stop.id || stop.stopId,
          version: stop.version,
          questionCount: stop.cost?.questions || stop.questions || 0,
          estimatedMinutes: estMinutes,
          minutes: estMinutes,
          completed: true,
          planTaskKey: key,
          reason: "Bugün tamamlanan durak",
          rkind: "green",
        });
        existingKeys.add(key);
      }
    });

    return tasks;
  }, [planCtx, studyRoute.currentWeek?.stops, isDone]);

  const detail = usePlanDetailTasks({
    C,
    plan: { tasks: generatedTasks },
    adHocTasks: [],
    userTasks,
    isPlanDone: isDone,
    navigation,
    showAlert,
    togglePlanDone: toggle,
    toggleUserTask,
    removeUserTask,
    transitionStop: studyRoute.transitionStop,
  });

  const plannedMinutes = useMemo(
    () => detail.tasks.reduce((sum, task) => sum + (task.minutes ?? ((task.q || 0) * 2)), 0),
    [detail.tasks],
  );
  const doneMinutes = useMemo(
    () => detail.tasks
      .filter((task) => task.done)
      .reduce((sum, task) => sum + (task.minutes ?? ((task.q || 0) * 2)), 0),
    [detail.tasks],
  );
  const hasTasks = detail.tasks.length > 0 && !forceEmpty;
  // Duraklar gelmeden bos gostermek kullaniciya yalan soyler: rota fetch'i
  // bitene kadar plan zaten bos gorunur.
  const loading = !studyRoute.routeStopsLoaded;

  useEffect(() => {
    if (!generatedTasks.length) return;
    syncPlan({
      tasks: generatedTasks,
      totalQuestions: generatedTasks.reduce((sum, task) => sum + (task.questionCount || 0), 0),
      estimatedMinutes: plannedMinutes,
    });
  }, [generatedTasks, plannedMinutes, syncPlan]);

  return { detail, doneMinutes, hasTasks, loading, navigation, plannedMinutes };
}
