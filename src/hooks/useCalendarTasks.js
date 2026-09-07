import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import { saveUserTaskOffline } from "../lib/offlineQueue";
import { getJson, setJson } from "../lib/storage/appStorage";
import { handleSupabaseError } from "../supabase/handleError";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getCalendarTasks, updateUserTask, deleteUserTask } from "../supabase/userTasks";

const KEY = STORAGE_KEYS.CALENDAR_TASKS;
const CAL_SUBJECT = "__calendar";

export function useCalendarTasks() {
  const [tasks, setTasks] = useState({});
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    getJson(KEY, {}).then((storedTasks) => {
      if (storedTasks && typeof storedTasks === "object") setTasks(storedTasks);
    });
  }, []);

  useEffect(() => {
    if (!user?.id || synced.current) return;
    synced.current = true;
    getCalendarTasks(user.id, CAL_SUBJECT)
      .then((data) => {
        if (!data?.length) return;
        setTasks((prev) => {
          const merged = { ...prev };
          data.forEach((row) => {
            const list = merged[row.task_date] || [];
            if (!list.some((t) => t.remoteId === row.id)) {
              list.push({ id: row.id, remoteId: row.id, title: row.note, done: !!row.completed });
            }
            merged[row.task_date] = list;
          });
          setJson(KEY, merged);
          return merged;
        });
      })
      .catch(setError);
  }, [user?.id]);

  const persist = useCallback((next) => {
    setJson(KEY, next);
  }, []);

  const addTask = useCallback((date, task) => {
    const localId = Date.now().toString();
    setTasks((prev) => {
      const list = [...(prev[date] || []), { ...task, id: localId, done: false }];
      const next = { ...prev, [date]: list };
      persist(next);
      return next;
    });
    if (user?.id) {
      // Sunucuya yazılamazsa offline kuyruğa düşsün — önceden hata tamamen
      // yutuluyordu, görev sadece bu telefonda kalıp yeni cihazda kayboluyordu.
      saveUserTaskOffline({
        user_id: user.id, task_date: date, subject: CAL_SUBJECT,
        note: task.title, completed: false,
      }).then((res) => {
        if (!res?.data?.id) return;
        setTasks((prev) => {
          const list = (prev[date] || []).map((t) =>
            t.id === localId ? { ...t, remoteId: res.data.id } : t,
          );
          const next = { ...prev, [date]: list };
          persist(next);
          return next;
        });
      });
    }
  }, [persist, user?.id]);

  const toggleTask = useCallback((date, taskId) => {
    setTasks((prev) => {
      const list = (prev[date] || []).map((t) => t.id === taskId ? { ...t, done: !t.done } : t);
      const next = { ...prev, [date]: list };
      persist(next);
      const toggled = list.find((t) => t.id === taskId);
      if (toggled?.remoteId) {
        updateUserTask(toggled.remoteId, { completed: toggled.done }).catch((e) => {
          handleSupabaseError(e, "calendar:toggleTask");
          setTasks((revert) => {
            const revList = (revert[date] || []).map((t) => t.id === taskId ? { ...t, done: !t.done } : t);
            const revNext = { ...revert, [date]: revList };
            persist(revNext);
            return revNext;
          });
        });
      }
      return next;
    });
  }, [persist]);

  const removeTask = useCallback((date, taskId) => {
    setTasks((prev) => {
      const removed = (prev[date] || []).find((t) => t.id === taskId);
      const list = (prev[date] || []).filter((t) => t.id !== taskId);
      const next = { ...prev };
      if (list.length) next[date] = list;
      else delete next[date];
      persist(next);
      if (removed?.remoteId) {
        deleteUserTask(removed.remoteId, user?.id).catch((e) => {
          handleSupabaseError(e, "calendar:removeTask");
          setTasks((revert) => {
            const revList = [...(revert[date] || []), removed];
            const revNext = { ...revert, [date]: revList };
            persist(revNext);
            return revNext;
          });
        });
      }
      return next;
    });
  }, [persist, user?.id]);

  return { tasks, addTask, toggleTask, removeTask, error };
}
