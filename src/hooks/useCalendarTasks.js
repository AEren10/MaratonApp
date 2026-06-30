import { useState, useEffect, useCallback, useRef } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../supabase/client";
import { STORAGE_KEYS } from "../constants/storageKeys";

const KEY = STORAGE_KEYS.CALENDAR_TASKS;
const CAL_SUBJECT = "__calendar";

export function useCalendarTasks() {
  const [tasks, setTasks] = useState({});
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setTasks(JSON.parse(raw));
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!user?.id || synced.current) return;
    synced.current = true;
    supabase
      .from("user_tasks")
      .select("id, task_date, note, completed")
      .eq("user_id", user.id)
      .eq("subject", CAL_SUBJECT)
      .order("created_at", { ascending: true })
      .then(({ data, error: fetchErr }) => {
        if (fetchErr) { setError(fetchErr); return; }
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
          AsyncStorage.setItem(KEY, JSON.stringify(merged)).catch(() => {});
          return merged;
        });
      });
  }, [user?.id]);

  const persist = useCallback((next) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
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
      supabase.from("user_tasks").insert({
        user_id: user.id, task_date: date, subject: CAL_SUBJECT,
        note: task.title, completed: false,
      }).select("id").single().then(({ data }) => {
        if (!data) return;
        setTasks((prev) => {
          const list = (prev[date] || []).map((t) =>
            t.id === localId ? { ...t, remoteId: data.id } : t,
          );
          const next = { ...prev, [date]: list };
          persist(next);
          return next;
        });
      }).catch(() => {});
    }
  }, [persist, user?.id]);

  const toggleTask = useCallback((date, taskId) => {
    setTasks((prev) => {
      const list = (prev[date] || []).map((t) => t.id === taskId ? { ...t, done: !t.done } : t);
      const next = { ...prev, [date]: list };
      persist(next);
      const toggled = list.find((t) => t.id === taskId);
      if (toggled?.remoteId) {
        supabase.from("user_tasks").update({ completed: toggled.done }).eq("id", toggled.remoteId).catch(() => {
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
        supabase.from("user_tasks").delete().eq("id", removed.remoteId).catch(() => {
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
  }, [persist]);

  return { tasks, addTask, toggleTask, removeTask, error };
}
