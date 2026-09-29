import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { getRouteHabits, saveRouteHabits } from "../supabase/routePrefs";
import { resolveHabits } from "../domain/route/habits";
import { emitRouteUpdated } from "../lib/routeEvents";
import { captureError } from "../lib/errorReporting";

// Gunluk rutinler -- tek kopya (ana sayfa, gunun plani, Program ve rota
// ayni listeyi gorur). Sunucu otoritedir: kaydetme sunucuya yazilinca
// kabul edilir; basarisizsa eski liste geri gelir.
const EMPTY = [];
const store = { userId: null, saved: [], loaded: false, loading: false };
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());
let snapshot = { ...store };
const setStore = (patch) => { Object.assign(store, patch); snapshot = { ...store }; emit(); };

function load(userId) {
  if (!userId || store.loading || (store.loaded && store.userId === userId)) return;
  setStore({ userId, loading: true, ...(store.userId !== userId ? { saved: [], loaded: false } : {}) });
  getRouteHabits(userId)
    .then((saved) => setStore({ saved, loaded: true, loading: false }))
    .catch(() => setStore({ loaded: true, loading: false }));
}

export function useRouteHabits() {
  const { user } = useAuth();
  const { examType } = useExam();
  const state = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => snapshot,
    () => snapshot,
  );
  useEffect(() => { load(user?.id); }, [user?.id]);

  const save = useCallback(async (next) => {
    const prev = store.saved;
    setStore({ saved: next });
    try {
      await saveRouteHabits(user?.id, next);
      emitRouteUpdated({ action: "habits_changed" });
      return true;
    } catch (e) {
      captureError(e, { context: "route_habits_save" });
      setStore({ saved: prev });
      return false;
    }
  }, [user?.id]);

  const sameUser = state.userId === user?.id;
  const saved = sameUser ? state.saved : EMPTY;
  const habits = useMemo(() => resolveHabits(saved, examType), [saved, examType]);
  return {
    saved,
    habits,
    loaded: sameUser && state.loaded,
    save,
  };
}
