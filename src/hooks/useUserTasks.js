import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setUserTasks,
  addUserTask,
  replaceUserTask,
  toggleUserTask as toggleAction,
  removeUserTask as removeAction,
  clearUserTasks,
  selectUserTasks,
  selectUserTasksProgress,
} from "../store/slices/userTasksSlice";
import {
  getUserTasksByDate,
  updateUserTask,
  deleteUserTask,
  deleteUserTasksByDate,
} from "../supabase/userTasks";
import { saveUserTaskOffline } from "../lib/offlineQueue";
import { userTaskSchema } from "../validations/auth";
import { scheduleTaskNotifications, cancelTaskReminders } from "../lib/notifications";

const today = () => new Date().toISOString().split("T")[0];

export function useUserTasks() {
  const { user } = useAuth();
  const dispatch = useAppDispatch();
  const tasks = useAppSelector(selectUserTasks);
  const progress = useAppSelector(selectUserTasksProgress);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    let cancelled = false;
    setLoading(true);
    getUserTasksByDate(user.id, today())
      .then((data) => {
        if (!cancelled) dispatch(setUserTasks(data || []));
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, dispatch]);

  const createTask = useCallback(async (input) => {
    const parsed = userTaskSchema.parse(input);
    const tempId = `temp_${Date.now()}`;
    const optimistic = {
      id: tempId,
      user_id: user?.id,
      task_date: today(),
      subject: parsed.subject,
      topic: parsed.topic || null,
      question_count: parsed.questionCount || 0,
      target_minutes: parsed.targetMinutes || null,
      note: parsed.note || null,
      completed: false,
      created_at: new Date().toISOString(),
    };
    dispatch(addUserTask(optimistic));
    const row = { ...optimistic };
    delete row.id;
    delete row.created_at;
    saveUserTaskOffline(row)
      .then((result) => {
        if (result.saved && result.data) {
          dispatch(replaceUserTask({ tempId, real: result.data }));
        }
        const newTotal = tasks.length + 1;
        const newDone = tasks.filter((t) => t.completed).length;
        if (newDone < newTotal) scheduleTaskNotifications(newTotal).catch(() => {});
      })
      .catch(() => {
        dispatch(removeAction(tempId));
      });
    return optimistic;
  }, [user?.id, dispatch, tasks]);

  const toggleTask = useCallback(async (id) => {
    dispatch(toggleAction(id));
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    updateUserTask(id, { completed: newCompleted }).catch(() => {
      dispatch(toggleAction(id));
    });
    const doneAfter = tasks.filter((t) => t.id === id ? newCompleted : t.completed).length;
    if (doneAfter >= tasks.length) {
      cancelTaskReminders().catch(() => {});
    }
  }, [dispatch, tasks]);

  const removeTask = useCallback(async (id) => {
    const task = tasks.find((t) => t.id === id);
    dispatch(removeAction(id));
    deleteUserTask(id, user.id).catch(() => {
      if (task) dispatch(addUserTask(task));
    });
  }, [dispatch, tasks, user.id]);

  const clearAll = useCallback(async () => {
    if (!user?.id) return;
    dispatch(clearUserTasks());
    cancelTaskReminders().catch(() => {});
    deleteUserTasksByDate(user.id, today()).catch(() => {});
  }, [user?.id, dispatch]);

  return { tasks, progress, loading, createTask, toggleTask, removeTask, clearAll };
}
