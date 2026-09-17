import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useAuth } from "../contexts/AuthContext";
import {
  saveUserTaskOffline,
  saveUserTaskUpdateOffline,
  deleteUserTaskOffline,
  patchQueuedPayload,
  removeFromQueue,
} from "../lib/offlineQueue";
import { getJson, setJson } from "../lib/storage/appStorage";
import { handleSupabaseError } from "../supabase/handleError";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { getCalendarTasks } from "../supabase/userTasks";

const KEY = STORAGE_KEYS.CALENDAR_TASKS;
const CAL_SUBJECT = "__calendar";

export function useCalendarTasks() {
  const [tasks, setTasks] = useState({});
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const synced = useRef(false);
  const userId = user?.id;
  const cacheKey = useMemo(() => userScopedKey(KEY, userId), [userId]);

  useEffect(() => {
    synced.current = false;
    if (!userId) {
      setTasks({});
      return undefined;
    }
    let cancelled = false;
    getJson(cacheKey, {}).then((storedTasks) => {
      if (!cancelled && storedTasks && typeof storedTasks === "object") setTasks(storedTasks);
    });
    return () => { cancelled = true; };
  }, [cacheKey, userId]);

  useEffect(() => {
    if (!userId || synced.current) return;
    synced.current = true;
    let cancelled = false;
    getCalendarTasks(userId, CAL_SUBJECT)
      .then((data) => {
        if (cancelled || !data?.length) return;
        setTasks((prev) => {
          const merged = { ...prev };
          data.forEach((row) => {
            const list = merged[row.task_date] || [];
            const existingIndex = list.findIndex((t) =>
              t.remoteId === row.id ||
              (row.client_operation_id && (
                t.pendingOperationId === row.client_operation_id ||
                t.client_operation_id === row.client_operation_id
              ))
            );
            const task = {
              id: row.id,
              remoteId: row.id,
              title: row.note,
              done: !!row.completed,
              pendingOperationId: null,
              client_operation_id: row.client_operation_id || null,
            };
            if (existingIndex >= 0) {
              list[existingIndex] = { ...list[existingIndex], ...task };
            } else {
              list.push(task);
            }
            merged[row.task_date] = list;
          });
          setJson(cacheKey, merged);
          return merged;
        });
      })
      .catch((e) => { if (!cancelled) setError(e); });
    return () => { cancelled = true; };
  }, [cacheKey, userId]);

  const persist = useCallback((next) => {
    setJson(cacheKey, next);
  }, [cacheKey]);

  const addTask = useCallback((date, task) => {
    const localId = Date.now().toString();
    const clientOperationId = `calendartask_${localId}`;
    setTasks((prev) => {
      const list = [
        ...(prev[date] || []),
        {
          ...task,
          id: localId,
          done: false,
          pendingOperationId: clientOperationId,
          client_operation_id: clientOperationId,
        },
      ];
      const next = { ...prev, [date]: list };
      persist(next);
      return next;
    });
    if (user?.id) {
      // Sunucuya yazılamazsa offline kuyruğa düşsün — önceden hata tamamen
      // yutuluyordu, görev sadece bu telefonda kalıp yeni cihazda kayboluyordu.
      saveUserTaskOffline({
        user_id: user.id, task_date: date, subject: CAL_SUBJECT,
        note: task.title, completed: false, client_operation_id: clientOperationId,
      }).then((res) => {
        if (!res?.data?.id) return;
        setTasks((prev) => {
          const list = (prev[date] || []).map((t) =>
            t.id === localId ? { ...t, remoteId: res.data.id, pendingOperationId: null } : t,
          );
          const next = { ...prev, [date]: list };
          persist(next);
          return next;
        });
      }).catch((e) => {
        handleSupabaseError(e, "calendar:addTask");
        setError(e);
        setTasks((prev) => {
          const list = (prev[date] || []).filter((t) => t.id !== localId);
          const next = { ...prev };
          if (list.length) next[date] = list;
          else delete next[date];
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
        saveUserTaskUpdateOffline(toggled.remoteId, { completed: toggled.done }, userId).then((result) => {
          if (result?.saved || result?.queued) return;
          const e = result?.error || new Error("calendar_task_update_failed");
          handleSupabaseError(e, "calendar:toggleTask");
          setTasks((revert) => {
            const revList = (revert[date] || []).map((t) => t.id === taskId ? { ...t, done: !t.done } : t);
            const revNext = { ...revert, [date]: revList };
            persist(revNext);
            return revNext;
          });
        });
      } else if (toggled?.pendingOperationId) {
        patchQueuedPayload(toggled.pendingOperationId, { completed: toggled.done }).catch((e) => {
          handleSupabaseError(e, "calendar:toggleQueuedTask");
          setError(e);
        });
      }
      return next;
    });
  }, [persist, userId]);

  const removeTask = useCallback((date, taskId) => {
    setTasks((prev) => {
      const removed = (prev[date] || []).find((t) => t.id === taskId);
      const list = (prev[date] || []).filter((t) => t.id !== taskId);
      const next = { ...prev };
      if (list.length) next[date] = list;
      else delete next[date];
      persist(next);
      if (removed?.remoteId) {
        deleteUserTaskOffline(removed.remoteId, userId).then((result) => {
          if (result?.saved || result?.queued) return;
          const e = result?.error || new Error("calendar_task_delete_failed");
          handleSupabaseError(e, "calendar:removeTask");
          setTasks((revert) => {
            const revList = [...(revert[date] || []), removed];
            const revNext = { ...revert, [date]: revList };
            persist(revNext);
            return revNext;
          });
        });
      } else if (removed?.pendingOperationId) {
        removeFromQueue(removed.pendingOperationId).catch((e) => {
          handleSupabaseError(e, "calendar:removeQueuedTask");
          setError(e);
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
