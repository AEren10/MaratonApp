import { useCallback, useEffect, useMemo, useSyncExternalStore } from "react";

import { useAuth } from "../contexts/AuthContext";
import { useExam } from "../contexts/ExamContext";
import { getRouteHabits, saveRouteHabits } from "../supabase/routePrefs";
import { resolveHabits } from "../domain/route/habits";
import { emitRouteUpdated } from "../lib/routeEvents";
import { captureError } from "../lib/errorReporting";
import { registerSessionReset } from "../lib/session/sessionReset";

// Gunluk rutinler -- tek kopya (ana sayfa, gunun plani, Program ve rota
// ayni listeyi gorur). Sunucu otoritedir.
// - loaded: sunucudan basariyla okundu. Duzenleme YALNIZ bundan sonra;
//   okunmadan kaydetmek sunucudaki listeyi ezerdi.
// - settled: okuma denendi ve bitti (hata dahil). Rota kaydi bunu bekler;
//   kalici bir hata rotanin hic kaydedilmemesine yol acmasin.
// - Hata sonrasi bir sonraki mount'ta yeniden denenir.
// - Kullanici degisirse eski kullanicinin yaniti atilir.
const EMPTY = [];
const store = { userId: null, saved: EMPTY, loaded: false, settled: false, inflightFor: null };
const listeners = new Set();
let snapshot = { ...store };
const setStore = (patch) => { Object.assign(store, patch); snapshot = { ...store }; listeners.forEach((l) => l()); };
registerSessionReset(() => setStore({ userId: null, saved: EMPTY, loaded: false, settled: false, inflightFor: null }));

function load(userId) {
  if (!userId) return;
  if (store.userId !== userId) setStore({ userId, saved: EMPTY, loaded: false, settled: false });
  if (store.loaded || store.inflightFor === userId) return;
  setStore({ inflightFor: userId });
  getRouteHabits(userId)
    .then((saved) => {
      if (store.userId !== userId) return;
      setStore({ saved, loaded: true, settled: true, inflightFor: null });
    })
    .catch(() => {
      if (store.userId !== userId) return;
      setStore({ settled: true, inflightFor: null });
    });
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
    if (!store.loaded || store.userId !== user?.id) return false;
    const prev = store.saved;
    setStore({ saved: next });
    try {
      await saveRouteHabits(user?.id, next);
      emitRouteUpdated({ action: "habits_changed" });
      return true;
    } catch (e) {
      captureError(e, { context: "route_habits_save" });
      if (store.userId === user?.id) setStore({ saved: prev });
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
    settled: sameUser && state.settled,
    save,
  };
}
