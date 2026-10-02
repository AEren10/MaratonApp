import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SCREENS } from "../../constants/screens";
import * as haptic from "../../lib/haptics";
import { mapGeneratedTask, mapAdHocTask, mapUserTask, taskAsStop } from "./planTaskMappers";
import { useStopCompletion } from "../../hooks/useStopCompletion";
import { mergePlanTasks } from "./mergePlanTasks";
import { usePlanTaskUndo } from "./usePlanTaskUndo";
import { trackPlanAllCompletedOnce, trackPlanTaskCompleted } from "../../lib/planAnalytics";

export function usePlanDetailTasks({
  C,
  plan,
  adHocTasks,
  userTasks,
  isPlanDone,
  navigation,
  showAlert,
  togglePlanDone,
  toggleUserTask,
  removeUserTask,
  transitionStop,
  userId,
}) {
  const initialTasks = useMemo(() => [
    ...userTasks.filter((t) => t.subject !== "__calendar").map((t) => mapUserTask(t, C)),
    ...adHocTasks.map((t) => mapAdHocTask(t, C)),
    ...plan.tasks.map((t) => mapGeneratedTask(t, C, isPlanDone)),
  ], [C, plan, adHocTasks, userTasks, isPlanDone]);

  const stopLog = useStopCompletion();
  const [tasks, setTasks] = useState(initialTasks);
  const tasksRef = useRef(tasks);
  const completedHistoryRef = useRef(new Map());
  const [reasonTask, setReasonTask] = useState(null);
  tasksRef.current = tasks;

  const undo = usePlanTaskUndo({
    tasksRef, setTasks, completedHistoryRef, isPlanDone, togglePlanDone, toggleUserTask, transitionStop, stopLog,
  });

  const taskSig = initialTasks.map((t) => t.id).join("|");
  useEffect(() => {
    setTasks((prev) => mergePlanTasks(initialTasks, prev, completedHistoryRef.current, isPlanDone));
  }, [taskSig]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTask = useCallback(async (id) => {
    const task = tasksRef.current.find((item) => item.id === id);
    if (!task) return;
    if (task.routeStop && task.done) {
      haptic.select();
      undo.confirmReopen(task);
      return;
    }

    const nextDone = !task.done;
    const completesPlan = nextDone && tasksRef.current.every((item) => item.id === id || item.done);

    // Optimistik anında güncelleme: durak ekrandan kaybolmaz, dakikası hemen artar
    setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, done: nextDone } : item)));

    if (nextDone) {
      completedHistoryRef.current.set(id, { ...task, done: true });
      haptic.success();
    } else {
      completedHistoryRef.current.delete(id);
      haptic.select();
    }

    let taskSaved = true;
    if (task.userTask) taskSaved = await toggleUserTask(id);
    else togglePlanDone(id);
    // Ana sayfadaki tikle ayni kayit: grafik, seri ve konu ilerlemesi buradan
    // da beslenir (eskiden bu ekranin tiki hicbir calisma kaydi yazmiyordu).
    const logWrite = (nextDone ? stopLog.complete : stopLog.undo)(taskAsStop(task));

    if (task.routeStop && nextDone) {
      try {
        await transitionStop(task.routeStop, "completed", { source: "daily_plan" });
        trackPlanTaskCompleted(task, "plan_detail");
      } catch {
        setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, done: false } : item)));
        completedHistoryRef.current.delete(id);
        if (task.userTask) toggleUserTask(id);
        else togglePlanDone(id);
        // Silme, yazma bittikten SONRA: once biterse gec gelen kayit geride kalirdi.
        Promise.resolve(logWrite).finally(() => stopLog.undo(taskAsStop(task)));
        showAlert("Durak tamamlanamadı", "Rota güncellenemedi. Bağlantını kontrol edip yeniden dene.");
        taskSaved = false;
      }
    } else if (nextDone && !task.userTask) {
      taskSaved = Boolean(await logWrite);
      if (taskSaved) trackPlanTaskCompleted(task, "plan_detail");
    }

    if (!taskSaved) {
      setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, done: false } : item)));
      completedHistoryRef.current.delete(id);
      if (task.userTask && nextDone) await Promise.resolve(logWrite).finally(() => stopLog.undo(taskAsStop(task)));
    } else if (completesPlan) {
      await trackPlanAllCompletedOnce(userId, tasksRef.current.map((item) => (
        item.id === id ? { ...item, done: true } : item
      )), "plan_detail");
    }
  }, [showAlert, stopLog, toggleUserTask, togglePlanDone, transitionStop, userId, undo]);

  const startTask = useCallback((id) => {
    const task = tasksRef.current.find((t) => t.id === id);
    navigation.navigate(SCREENS.STUDY_TIMER, {
      taskId: id,
      planTaskKey: task?.planTask ? id : undefined,
      subjectKey: task?.s?.key,
      topicName: task?.topic,
      planSubjectKey: task?.planSubjectKey,
      planTopicName: task?.planTopicName,
      routeStopId: task?.routeStop?.stopId,
      routeStopVersion: task?.routeStop?.version,
    });
  }, [navigation]);

  const moveTask = useCallback((id, direction) => {
    setTasks((prev) => {
      const idx = prev.findIndex((t) => t.id === id);
      if (idx === -1) return prev;
      const targetIdx = direction === "up" ? idx - 1 : idx + 1;
      if (targetIdx < 0 || targetIdx >= prev.length) return prev;
      const copy = [...prev];
      const [item] = copy.splice(idx, 1);
      copy.splice(targetIdx, 0, item);
      return copy;
    });
    haptic.select();
  }, []);

  const removeTask = useCallback((id) => {
    const task = tasksRef.current.find((t) => t.id === id);
    if (task?.userTask && removeUserTask) removeUserTask(id);
    if (task?.routeStop && transitionStop) {
      transitionStop(task.routeStop, "skipped", { source: "reorganize_day" }).catch?.(() => {});
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    haptic.warn();
  }, [removeUserTask, transitionStop]);

  const clearRemaining = useCallback(() => {
    const remaining = tasksRef.current.filter((t) => !t.done);
    for (const task of remaining) {
      if (task.userTask && removeUserTask) removeUserTask(task.id);
      if (task.routeStop && transitionStop) {
        transitionStop(task.routeStop, "skipped", { source: "reorganize_day_clear" }).catch?.(() => {});
      }
    }
    setTasks((prev) => prev.filter((t) => t.done));
    haptic.warn();
  }, [removeUserTask, transitionStop]);

  const showReason = useCallback((id) => {
    const task = tasksRef.current.find((t) => t.id === id);
    if (task) setReasonTask(task);
  }, []);

  return {
    clearRemaining, doneCount: tasks.filter((t) => t.done).length,
    moveTask, reasonTask, removeTask, setReasonTask,
    showReason, startTask, tasks, toggleTask, editTask: undo.editTask,
  };
}
