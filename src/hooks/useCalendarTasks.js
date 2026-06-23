import { useState, useEffect, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "@maraton:calendar_tasks";

export function useCalendarTasks() {
  const [tasks, setTasks] = useState({});

  useEffect(() => {
    AsyncStorage.getItem(KEY).then((raw) => {
      if (raw) setTasks(JSON.parse(raw));
    }).catch(() => {});
  }, []);

  const persist = useCallback((next) => {
    AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => {});
  }, []);

  const addTask = useCallback((date, task) => {
    setTasks((prev) => {
      const list = [...(prev[date] || []), { ...task, id: Date.now().toString(), done: false }];
      const next = { ...prev, [date]: list };
      persist(next);
      return next;
    });
  }, [persist]);

  const toggleTask = useCallback((date, taskId) => {
    setTasks((prev) => {
      const list = (prev[date] || []).map((t) => t.id === taskId ? { ...t, done: !t.done } : t);
      const next = { ...prev, [date]: list };
      persist(next);
      return next;
    });
  }, [persist]);

  const removeTask = useCallback((date, taskId) => {
    setTasks((prev) => {
      const list = (prev[date] || []).filter((t) => t.id !== taskId);
      const next = { ...prev };
      if (list.length) next[date] = list;
      else delete next[date];
      persist(next);
      return next;
    });
  }, [persist]);

  return { tasks, addTask, toggleTask, removeTask };
}
