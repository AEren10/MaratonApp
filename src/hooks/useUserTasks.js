import { useEffect, useState, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useAppDispatch, useAppSelector } from "../store/hooks";
import {
  setUserTasks,
  addUserTask,
  replaceUserTask,
  toggleUserTask as toggleAction,
  setUserTaskCompleted,
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
import { saveUserTaskOffline, patchQueuedPayload } from "../lib/offlineQueue";
import { userTaskSchema } from "../validations/auth";
import { scheduleTaskNotifications, cancelTaskReminders } from "../lib/notifications";
import { track } from "../lib/analytics";
import { useGamification } from "./useGamification";
import { EVENTS } from "../constants/analytics";
import { todayTR } from "../lib/dateUtils";
import { toUserTaskRow } from "../domain/tasks/userTaskModel";

const today = todayTR;

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

  useEffect(() => {
    if (!user?.id || user.id === "dev") return;
    if (existingDay === today()) return;
    let cancelled = false;
    setLoading(true);
    getUserTasksByDate(user.id, today())
      .then((data) => {
        if (!cancelled) dispatch(setUserTasks(data || []));
      })
      .catch((e) => { if (!cancelled) setError(e); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [user?.id, dispatch, existingDay]);

  const createTask = useCallback(async (input) => {
    if (!user?.id || user.id === "dev") {
      throw new Error("Kullanıcı oturumu bulunamadı");
    }
    let parsed;
    try {
      parsed = userTaskSchema.parse(input);
    } catch (e) {
      throw new Error(e.errors?.[0]?.message || "Geçersiz görev bilgisi");
    }
    const tempId = `temp_${Date.now()}`;
    // Kuyruktaki kaydı sonradan bulabilmek için sabit bir kimlik.
    // Eskiden yoktu: çevrimdışı görev kuyrukta kalıyor, iyimser satır
    // sonsuza kadar temp_ id'siyle yaşıyordu.
    const clientOperationId = `usertask_${tempId}`;
    const optimistic = {
      id: tempId,
      client_operation_id: clientOperationId,
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
    const row = toUserTaskRow(optimistic);
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
    const task = tasks.find((t) => t.id === id);
    if (!task) return;
    const previous = task.completed;
    const newCompleted = !previous;
    dispatch(setUserTaskCompleted({ id, completed: newCompleted }));

    // Henüz sunucuda olmayan görev: güncellenecek satır yok, ama kuyrukta
    // bekleyen INSERT var. Tamamlama bilgisini ONA yazıyoruz ki görev en
    // baştan tamamlanmış oluşturulsun. Eskiden burada return ediliyordu ve
    // tamamlama kalıcı olarak kayboluyordu.
    if (typeof id === "string" && id.startsWith("temp_")) {
      patchQueuedPayload(`usertask_${id}`, { completed: newCompleted }).catch(() => {});
      return;
    }

    updateUserTask(id, { completed: newCompleted }).catch(() => {
      // Geri alma mutlak değerle: arada kullanıcı tekrar dokunmuş olsa bile
      // görevi bilinen son doğru duruma döndür.
      dispatch(setUserTaskCompleted({ id, completed: previous }));
    });

    // Aktivasyonun ana metriği. Tanımlıydı ama hiçbir yerden gönderilmiyordu.
    if (newCompleted) {
      track(EVENTS.PLAN_TASK_COMPLETED, {
        subject: task.subject || null,
        source: task.source || null,
      });
      // XP ÖDÜLÜ BURADA — ekranda değil. Önceden yalnızca ana ekrandaki
      // callback ödül veriyordu; aynı görevi Plan Detay'dan işaretleyen
      // kullanıcı hiç XP almıyordu.
      rewardRef.current?.("plan_task_done");
    }

    const doneAfter = tasks.filter((t) => t.id === id ? newCompleted : t.completed).length;
    if (doneAfter >= tasks.length) {
      cancelTaskReminders().catch(() => {});
    }
  }, [dispatch, tasks]);

  const removeTask = useCallback(async (id) => {
    const task = tasks.find((t) => t.id === id);
    dispatch(removeAction(id));
    deleteUserTask(id, user?.id).catch(() => {
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
