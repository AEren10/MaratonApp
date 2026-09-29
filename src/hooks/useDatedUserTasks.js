import { useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { getUserTasksByDate } from "../supabase/userTasks";
import { saveUserTaskOffline } from "../lib/offlineQueue";
import { buildOptimisticUserTask, toUserTaskRow } from "../domain/tasks/userTaskModel";

// BUGUN DISI gunlerin ek gorevleri. Bugunun listesi Redux'ta (useUserTasks);
// Program > Hafta'da ileri bir gun secilip "Durak ekle" denince gorev o gune
// yazilir ve burada tutulur. Modul duzeyinde tek kopya: ekleyen ekran ile
// Program ayni kaydi gorur, geri donunce durak aninda orada.
const cache = new Map(); // dateKey -> tasks[]
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn());

function put(dateKey, tasks) {
  cache.set(dateKey, tasks);
  emit();
}

export async function createDatedTask(parsed, userId, dateKey) {
  const optimistic = buildOptimisticUserTask(parsed, userId, dateKey);
  put(dateKey, [...(cache.get(dateKey) || []), optimistic]);
  saveUserTaskOffline(toUserTaskRow(optimistic))
    .then((result) => {
      if (!result.saved || !result.data) return;
      put(dateKey, (cache.get(dateKey) || []).map((t) => (t.id === optimistic.id ? result.data : t)));
    })
    .catch(() => put(dateKey, (cache.get(dateKey) || []).filter((t) => t.id !== optimistic.id)));
  return optimistic;
}

export function useDatedUserTasks(dateKey) {
  const { user } = useAuth();
  const userId = user?.id && user.id !== "dev" ? user.id : null;
  const [, setTick] = useState(0);

  useEffect(() => {
    const fn = () => setTick((n) => n + 1);
    listeners.add(fn);
    return () => { listeners.delete(fn); };
  }, []);

  useEffect(() => {
    if (!userId || !dateKey) return;
    let alive = true;
    getUserTasksByDate(userId, dateKey)
      .then((rows) => {
        if (!alive) return;
        // Sunucudan gelenler + henuz yazilmamis iyimser kayitlar.
        const pending = (cache.get(dateKey) || []).filter((t) => String(t.id).startsWith("temp_"));
        put(dateKey, [...(rows || []), ...pending]);
      })
      .catch(() => {});
    return () => { alive = false; };
  }, [userId, dateKey]);

  return cache.get(dateKey) || [];
}
