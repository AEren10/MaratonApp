import { useEffect, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { useUserTasks } from "../../hooks/useUserTasks";
import { usePlanCompletion } from "../../hooks/usePlanCompletion";
import { usePlanContext } from "../../hooks/usePlanContext";
import { generateDailyPlan } from "../../lib/planEngine";
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
    return generated.tasks || [];
  }, [planCtx, studyRoute.currentWeek?.stops]);

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

  useEffect(() => {
    if (!generatedTasks.length) return;
    syncPlan({
      tasks: generatedTasks,
      totalQuestions: generatedTasks.reduce((sum, task) => sum + (task.questionCount || 0), 0),
      estimatedMinutes: plannedMinutes,
    });
  }, [generatedTasks, plannedMinutes, syncPlan]);

  return { detail, doneMinutes, hasTasks, navigation, plannedMinutes };
}
