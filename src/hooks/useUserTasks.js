import { useEffect, useState, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setUserTasks,
  addUserTask,
  toggleUserTask as toggleAction,
  removeUserTask as removeAction,
  clearUserTasks,
  selectUserTasks,
  selectUserTasksProgress,
} from "../store/slices/userTasksSlice";
import {
  getUserTasksByDate,
  createUserTask,
  updateUserTask,
  deleteUserTask,
  deleteUserTasksByDate,
} from "../supabase/userTasks";
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
    const row = {
      user_id: user.id,
      task_date: today(),
      subject: parsed.subject,
      topic: parsed.topic || null,
      question_count: parsed.questionCount,
      note: parsed.note || null,
    };
    const saved = await createUserTask(row);
    dispatch(addUserTask(saved));
    const newTotal = tasks.length + 1;
    const newDone = tasks.filter((t) => t.completed).length;
    if (newDone < newTotal) {
      await scheduleTaskNotifications(newTotal).catch(() => {});
    }
    return saved;
  }, [user?.id, dispatch, tasks]);

  const toggleTask = useCallback(async (id) => {
    dispatch(toggleAction(id));
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const newCompleted = !task.completed;
    updateUserTask(id, { completed: newCompleted }).catch(() => {});
    const doneAfter = tasks.filter((t) => t.id === id ? newCompleted : t.completed).length;
    if (doneAfter >= tasks.length) {
      cancelTaskReminders().catch(() => {});
    }
  }, [dispatch, tasks]);

  const removeTask = useCallback(async (id) => {
    dispatch(removeAction(id));
    deleteUserTask(id).catch(() => {});
  }, [dispatch]);

  const clearAll = useCallback(async () => {
    if (!user?.id) return;
    dispatch(clearUserTasks());
    cancelTaskReminders().catch(() => {});
    deleteUserTasksByDate(user.id, today()).catch(() => {});
  }, [user?.id, dispatch]);

  return { tasks, progress, loading, createTask, toggleTask, removeTask, clearAll };
}
