import { useEffect, useMemo } from "react";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../../contexts/AuthContext";
import { useAlert } from "../../contexts/AlertContext";
import { useStudyRoute } from "../../hooks/useStudyRoute";
import { useUserTasks } from "../../hooks/useUserTasks";
import { useClassSchedule } from "../../hooks/useClassSchedule";
import { useRehearsalToday } from "../../hooks/useRehearsalToday";
import { todayPlanStops } from "../../domain/program/todayStops";
import { useDayPlanOptions } from "../../hooks/useDayPlanOptions";
import { useHabitStops } from "../../hooks/useHabitStops";
import { usePlanCompletion } from "../../hooks/usePlanCompletion";
import { usePlanContext } from "../../hooks/usePlanContext";
import { generateDailyPlan } from "../../lib/planEngine";
import { dateKey, todayTR } from "../../lib/dateUtils";
import { buildPlanTaskKey } from "../../domain/plan/planTaskIdentity";
import { usePlanDetailTasks } from "./usePlanDetailTasks";
import { EVENTS } from "../../constants/analytics";
import { track } from "../../lib/analytics";

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
  const { schedule, ready: scheduleReady } = useClassSchedule();
  const dayOpts = useDayPlanOptions();
  const habitStops = useHabitStops(todayTR());
  // Deneme provasi gunu baska durak acilmaz (Ana sayfa ile ayni kural).
  const rehearsalToday = useRehearsalToday(user?.id);

  useEffect(() => {
    track(EVENTS.PLAN_VIEWED, { surface: "plan_detail" });
  }, []);

  // Günlük planın durakları: tüm haftanın değil, o güne ait duraklar (en fazla 3-4 durak)
  const generatedTasks = useMemo(() => {
    // Rota duraklari gelmeden kurulmaz: hafta bos gorunur ve motor rota yok
    // sanip eski tip tam gun plani uretiyordu (bir saniye 11 durak, sonra 2).
    if (rehearsalToday || !scheduleReady || !studyRoute.routeStopsLoaded) return [];
    const today = todayTR();
    const doneToday = (stop) => {
      // Plan gorevinin anahtariyla AYNI: rota duraginda plan_<logicalStopKey>.
      // Eskiden plan_<ders>_<konu> kuruluyordu; burada isaretlenen durak
      // 'bugun bitti' sayilmiyordu.
      const stopKey = buildPlanTaskKey(stop);
      return (
        (stop.lifecycleStatus === "completed" && (
          (stop.completedAt && dateKey(new Date(stop.completedAt)) === today) ||
          stop.completedToday === true
        )) ||
        (stopKey && isDone?.(stopKey)) ||
        isDone?.(stop.id)
      );
    };
    // Ana sayfa ve Program > Hafta ile ayni liste: ders programinin bugune
    // dusurdugu duraklar (bkz. domain/program/todayStops).
    const rawStops = [...habitStops, ...todayPlanStops(studyRoute.currentWeek, schedule, today, { isCompletedToday: doneToday, ...dayOpts })];
    const routeWeekStops = rawStops.map((stop) => {
      const isCompletedToday = doneToday(stop);
      if (isCompletedToday && stop.lifecycleStatus !== "completed") {
        return { ...stop, lifecycleStatus: "completed", completedToday: true };
      }
      return stop;
    });
    const generated = generateDailyPlan({
      ...planCtx,
      routeWeekStops,
      routeActive: (studyRoute.currentWeek?.stops || []).length > 0,
    });
    return generated.tasks || [];
  }, [planCtx, studyRoute.currentWeek, schedule, isDone, rehearsalToday, scheduleReady, dayOpts, habitStops, studyRoute.routeStopsLoaded]);

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
    userId: user?.id,
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
  const loading = !studyRoute.routeStopsLoaded || !scheduleReady;

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
