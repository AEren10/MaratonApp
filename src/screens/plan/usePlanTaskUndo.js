import { useCallback } from "react";

import { useStopRecordActions } from "../../hooks/useStopRecordActions";
import { taskAsStop } from "./planTaskMappers";

// "Programin tamami"nda bitmis rota duragini geri acma ve kaydini duzeltme.
// Sira ana sayfadakiyle ayni: once rota (sunucu yalniz bugun bitenleri
// acar), basarirsa tik kalkar ve kayit silinir.
export function usePlanTaskUndo({ tasksRef, setTasks, completedHistoryRef, isPlanDone, togglePlanDone, toggleUserTask, transitionStop, stopLog }) {
  const record = useStopRecordActions();

  const reopen = useCallback(async (task) => {
    const res = await Promise.resolve(transitionStop?.(task.routeStop, "upcoming", { source: "daily_plan_undo" }))
      .catch(() => null);
    if (res?.lifecycle_status !== "upcoming") {
      record.undoFailed();
      return;
    }
    completedHistoryRef.current.delete(task.id);
    setTasks((prev) => prev.map((item) => (item.id === task.id ? { ...item, done: false } : item)));
    if (task.userTask) toggleUserTask(task.id);
    else if (isPlanDone(task.id)) togglePlanDone(task.id);
    stopLog.undo(taskAsStop(task));
  }, [completedHistoryRef, isPlanDone, record, setTasks, stopLog, togglePlanDone, toggleUserTask, transitionStop]);

  const confirmReopen = useCallback((task) => {
    record.confirmUndo(taskAsStop(task), () => reopen(task));
  }, [record, reopen]);

  const editTask = useCallback((id) => {
    const task = tasksRef.current.find((item) => item.id === id);
    if (task?.done) record.openEdit(taskAsStop(task));
  }, [record, tasksRef]);

  return { confirmReopen, editTask };
}
