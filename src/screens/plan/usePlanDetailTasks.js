import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SCREENS } from "../../constants/screens";
import * as haptic from "../../lib/haptics";
import { mapGeneratedTask, mapAdHocTask, mapUserTask } from "./planTaskMappers";

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
}) {
  const initialTasks = useMemo(() => [
    ...userTasks.map((t) => mapUserTask(t, C)),
    ...adHocTasks.map((t) => mapAdHocTask(t, C)),
    ...plan.tasks.map((t) => mapGeneratedTask(t, C, isPlanDone)),
  ], [C, plan, adHocTasks, userTasks, isPlanDone]);

  const [tasks, setTasks] = useState(initialTasks);
  const tasksRef = useRef(tasks);
  const [reasonTask, setReasonTask] = useState(null);
  tasksRef.current = tasks;

  const taskSig = initialTasks.map((t) => t.id).join("|");
  useEffect(() => {
    setTasks((prev) => {
      const doneById = {};
      prev.forEach((t) => { doneById[t.id] = t.done; });
      return initialTasks.map((t) => ({ ...t, done: doneById[t.id] ?? t.done }));
    });
  }, [taskSig]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTask = useCallback(async (id) => {
    const task = tasksRef.current.find((item) => item.id === id);
    if (!task || (task.routeStop && task.done)) return;
    if (task.routeStop && !task.done) {
      try {
        await transitionStop(task.routeStop, "completed", { source: "daily_plan" });
      } catch {
        showAlert("Durak tamamlanamadı", "Rota güncellenemedi. Bağlantını kontrol edip yeniden dene.");
        return;
      }
    }
    if (task.userTask) toggleUserTask(id);
    else togglePlanDone(id);
    if (!task.done) haptic.success();
    setTasks((prev) => prev.map((item) => (
      item.id === id ? { ...item, done: !item.done } : item
    )));
  }, [showAlert, toggleUserTask, togglePlanDone, transitionStop]);

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
    if (task?.userTask && removeUserTask) {
      removeUserTask(id);
    }
    setTasks((prev) => prev.filter((t) => t.id !== id));
    haptic.warning();
  }, [removeUserTask]);

  const clearRemaining = useCallback(() => {
    setTasks((prev) => prev.filter((t) => t.done));
    haptic.warning();
  }, []);

  const showReason = useCallback((id) => {
    const task = tasksRef.current.find((t) => t.id === id);
    if (task) setReasonTask(task);
  }, []);

  return {
    clearRemaining,
    doneCount: tasks.filter((t) => t.done).length,
    moveTask,
    reasonTask,
    removeTask,
    setReasonTask,
    showReason,
    startTask,
    tasks,
    toggleTask,
  };
}
