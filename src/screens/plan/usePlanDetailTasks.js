import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { SCREENS } from "../../constants/screens";
import * as haptic from "../../lib/haptics";
import { getSubjectByKey } from "../../themes/subjects";

function mapGeneratedTask(t, C, isPlanDone) {
  const pid = t.logicalStopKey
    ? `plan_${t.logicalStopKey}`
    : `plan_${t.subject}_${t.topic || "genel"}`;
  const subj = getSubjectByKey(t.subject);
  return {
    id: pid,
    s: subj || { key: t.subject, label: t.subjectLabel, color: t.color, icon: "bookOpen" },
    topic: t.topicLabel || "Genel çalışma",
    topicKey: t.topic,
    q: t.questionCount,
    reason: t.reason,
    rkind: t.rkind || "gray",
    done: isPlanDone(pid),
    routeStop: t.stopId ? { stopId: t.stopId, version: t.version } : null,
  };
}

function mapAdHocTask(t, C) {
  const subj = getSubjectByKey(t.subject);
  return {
    id: t.id,
    s: subj || { key: t.subject, label: t.subjectLabel, color: t.color || C.amber, icon: "bookOpen" },
    topic: t.topic || "Genel çalışma",
    topicKey: t.topic,
    q: t.questionCount,
    reason: t.reason,
    rkind: "red",
    done: false,
    adHoc: true,
  };
}

function mapUserTask(t, C) {
  const subj = getSubjectByKey(t.subject);
  return {
    id: t.id,
    s: subj || { key: t.subject, label: t.subject, color: C.accent, icon: "bookOpen" },
    topic: t.topic || "Genel çalışma",
    topicKey: t.topic,
    q: t.questionCount ?? t.question_count ?? 0,
    reason: t.note || "Senin eklediğin görev",
    rkind: "blue",
    done: t.completed,
    userTask: true,
  };
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
      subjectKey: task?.s?.key,
      topicName: task?.topic,
    });
  }, [navigation]);

  const showReason = useCallback((id) => {
    const task = tasksRef.current.find((t) => t.id === id);
    if (task) setReasonTask(task);
  }, []);

  return {
    doneCount: tasks.filter((t) => t.done).length,
    reasonTask,
    setReasonTask,
    showReason,
    startTask,
    tasks,
    toggleTask,
  };
}
