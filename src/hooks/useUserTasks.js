import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setUserTasks,
  addUserTask,
  replaceUserTask,
  setUserTaskCompleted,
  removeUserTask as removeAction,
  clearUserTasks,
  selectUserTasks,
  selectUserTasksProgress,
} from "../store/slices/userTasksSlice";
import { getUserTasksByDate, deleteUserTasksByDate } from "../supabase/userTasks";
import {
  saveUserTaskOffline,
  saveUserTaskUpdateOffline,
  deleteUserTaskOffline,
  patchQueuedPayload,
  removeFromQueue,
} from "../lib/offlineQueue";
import { userTaskSchema } from "../validations/auth";
import { scheduleTaskNotifications, cancelTaskReminders } from "../lib/notifications";
import { track } from "../lib/analytics";
import { useGamification } from "./useGamification";
import { EVENTS } from "../constants/analytics";
import { todayTR } from "../lib/dateUtils";
import { toUserTaskRow, buildOptimisticUserTask } from "../domain/tasks/userTaskModel";
import { STORAGE_KEYS, datedUserKey } from "../constants/storageKeys";
import { getJson, setJson } from "../lib/storage/appStorage";

const today = todayTR;
const getUserTaskRewardedKey = (userId) => datedUserKey(STORAGE_KEYS.USER_TASK_REWARDED_PREFIX, todayTR(), userId);

export function useUserTasks() {
  const { reward } = useGamification();
  const rewardRef = useRef(reward);
  rewardRef.current = reward;

  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectUserTasks);
  const progress = useAppSelector(selectUserTasksProgress);
  const existingDay = useAppSelector((state) => state.userTasks.day);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const rewardedTaskIdsRef = useRef(new Set());

  useEffect(() => {
    rewardedTaskIdsRef.current = new Set();
    if (!user?.id || user.id === "dev") return;
    getJson(getUserTaskRewardedKey(user.id), []).then((ids) => {
      if (Array.isArray(ids)) ids.forEach((id) => rewardedTaskIdsRef.current.add(id));
    });
  }, [user?.id]);

  useEffect(() => {
    if (!user?.id || user.id === "dev" || existingDay === today()) return;
    let cancelled = false;
    setLoading(true);
    getUserTasksByDate(user.id, today())
      .then((data) => {
        if (cancelled) return;
        (data || []).forEach((t) => { if (t.completed) rewardedTaskIdsRef.current.add(t.id); });
        dispatch(setUserTasks(data || []));
      })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, dispatch, existingDay]);

  const createTask = useCallback(async (input) => {
    if (!user?.id || user.id === "dev") throw new Error("Kullanıcı oturumu bulunamadı");
    let parsed;
    try {
      parsed = userTaskSchema.parse(input);
    } catch (e) {
      throw new Error(e.errors?.[0]?.message || "Geçersiz görev bilgisi");
    }
    const optimistic = buildOptimisticUserTask(parsed, user.id, today());
    const tempId = optimistic.id;
    dispatch(addUserTask(optimistic));
    saveUserTaskOffline(toUserTaskRow(optimistic))
      .then((result) => {
        if (result.saved && result.data) dispatch(replaceUserTask({ tempId, real: result.data }));
        const newTotal = tasks.length + 1;
        const newDone = tasks.filter((t) => t.completed).length;
        if (newDone < newTotal) scheduleTaskNotifications(newTotal, user?.id).catch(() => {});
      })
      .catch(() => { dispatch(removeAction(tempId)); });
    return optimistic;
  }, [user?.id, dispatch, tasks]);

  const toggleTask = useCallback(async (id) => {
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const previous = task.completed;
    const newCompleted = !previous;
    dispatch(setUserTaskCompleted({ id, completed: newCompleted }));

    if (typeof id === "string" && id.startsWith("temp_")) {
      patchQueuedPayload(`usertask_${id}`, { completed: newCompleted }).catch(() => {});
      return;
    }

    saveUserTaskUpdateOffline(id, { completed: newCompleted }, user?.id).then((result) => {
      if (result.queued || result.saved) return;
      dispatch(setUserTaskCompleted({ id, completed: previous }));
    });

    if (newCompleted) {
      track(EVENTS.PLAN_TASK_COMPLETED, { subject: task.subject || null, source: task.source || null });
      if (!rewardedTaskIdsRef.current.has(id)) {
        rewardedTaskIdsRef.current.add(id);
        if (user?.id) setJson(getUserTaskRewardedKey(user.id), [...rewardedTaskIdsRef.current]).catch(() => {});
        rewardRef.current?.("plan_task_done");
      }
    }

    const doneAfter = tasks.filter((t) => (t.id === id ? newCompleted : t.completed)).length;
    if (doneAfter >= tasks.length) cancelTaskReminders().catch(() => {});
  }, [dispatch, tasks, user?.id]);

  const removeTask = useCallback(async (id) => {
    const task = tasks.find((t) => t.id === id);
    dispatch(removeAction(id));
    if (typeof id === "string" && id.startsWith("temp_")) {
      removeFromQueue(`usertask_${id}`).catch(() => { if (task) dispatch(addUserTask(task)); });
      return;
    }
    deleteUserTaskOffline(id, user?.id).then((result) => {
      if (result.queued || result.saved) return;
      if (task) dispatch(addUserTask(task));
    });
  }, [dispatch, tasks, user?.id]);

  const clearAll = useCallback(async () => {
    if (!user?.id) return;
    dispatch(clearUserTasks());
    cancelTaskReminders().catch(() => {});
    deleteUserTasksByDate(user.id, today()).catch(() => {});
  }, [user?.id, dispatch]);

  return { tasks, progress, loading, error, createTask, toggleTask, removeTask, clearAll };
}
