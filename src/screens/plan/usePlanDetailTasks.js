import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SCREENS } from "../../constants/screens";
import * as haptic from "../../lib/haptics";
import { mapGeneratedTask, mapAdHocTask, mapUserTask } from "./planTaskMappers";

function mergeTasks(initialTasks, prev, history, isPlanDone) {
  const doneById = {};
  prev.forEach((t) => { if (t.done) doneById[t.id] = true; });
  history.forEach((_t, id) => { doneById[id] = true; });

  const nextTasks = initialTasks.map((t) => {
    const isDoneNow = doneById[t.id] ?? (isPlanDone ? isPlanDone(t.id) : t.done);
    if (isDoneNow) history.set(t.id, { ...t, done: true });
    return { ...t, done: isDoneNow };
  });

  const presentIds = new Set(nextTasks.map((t) => t.id));
  prev.forEach((t) => {
    if (t.done && !presentIds.has(t.id)) { nextTasks.push(t); presentIds.add(t.id); }
  });
  history.forEach((item, id) => {
    if (!presentIds.has(id)) { nextTasks.push({ ...item, done: true }); presentIds.add(id); }
  });
  return nextTasks;
}

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
    ...userTasks.filter((t) => t.subject !== "__calendar").map((t) => mapUserTask(t, C)),
    ...adHocTasks.map((t) => mapAdHocTask(t, C)),
    ...plan.tasks.map((t) => mapGeneratedTask(t, C, isPlanDone)),
  ], [C, plan, adHocTasks, userTasks, isPlanDone]);

  const [tasks, setTasks] = useState(initialTasks);
  const tasksRef = useRef(tasks);
  const completedHistoryRef = useRef(new Map());
  const [reasonTask, setReasonTask] = useState(null);
  tasksRef.current = tasks;

  const taskSig = initialTasks.map((t) => t.id).join("|");
  useEffect(() => {
    setTasks((prev) => mergeTasks(initialTasks, prev, completedHistoryRef.current, isPlanDone));
  }, [taskSig]); // eslint-disable-line react-hooks/exhaustive-deps

  const toggleTask = useCallback(async (id) => {
    const task = tasksRef.current.find((item) => item.id === id);
    if (!task) return;
    if (task.routeStop && task.done) {
      haptic.select();
      return;
    }

    const nextDone = !task.done;

    // Optimistik anında güncelleme: durak ekrandan kaybolmaz, dakikası hemen artar
    setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, done: nextDone } : item)));

    if (nextDone) {
      completedHistoryRef.current.set(id, { ...task, done: true });
      haptic.success();
    } else {
      completedHistoryRef.current.delete(id);
      haptic.select();
    }

    if (task.userTask) toggleUserTask(id);
    else togglePlanDone(id);

    if (task.routeStop && nextDone) {
      try {
        await transitionStop(task.routeStop, "completed", { source: "daily_plan" });
      } catch {
        setTasks((prev) => prev.map((item) => (item.id === id ? { ...item, done: false } : item)));
        completedHistoryRef.current.delete(id);
        if (task.userTask) toggleUserTask(id);
        else togglePlanDone(id);
        showAlert("Durak tamamlanamadı", "Rota güncellenemedi. Bağlantını kontrol edip yeniden dene.");
      }
    }
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
    if (task?.userTask && removeUserTask) removeUserTask(id);
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
    clearRemaining, doneCount: tasks.filter((t) => t.done).length,
    moveTask, reasonTask, removeTask, setReasonTask,
    showReason, startTask, tasks, toggleTask,
  };
}
