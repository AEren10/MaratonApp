import { useCallback, useEffect, useSyncExternalStore } from "react";

import { useAuth } from "../contexts/AuthContext";
import { getStopMoves, saveStopMoves } from "../supabase/routePrefs";
import { postponeTarget, withMove } from "../domain/program/stopMoves";
import { captureError } from "../lib/errorReporting";
import { todayTR } from "../lib/dateUtils";
import { registerSessionReset } from "../lib/session/sessionReset";

// Ogrencinin tasidigi/erteledigi duraklar -- tek kopya. Gun dagitimi
// (assignWeekStops) bunlara uyar; ana sayfa, gunun plani, Program Hafta/Ay
// ayni haritayi okumali. Sunucu otoritedir; yazim basarisizsa geri alinir.
// Yuklenmeden yazim yapilmaz: sunucudaki haritayi ezerdi.
const EMPTY = {};
const store = { userId: null, moves: EMPTY, loaded: false, inflightFor: null };
const listeners = new Set();
let snapshot = { ...store };
const setStore = (patch) => { Object.assign(store, patch); snapshot = { ...store }; listeners.forEach((l) => l()); };
// Cikista bosalt: ucustaki yanit userId eslesmedigi icin atilir.
registerSessionReset(() => setStore({ userId: null, moves: EMPTY, loaded: false, inflightFor: null }));

function load(userId) {
  if (!userId) return;
  if (store.userId !== userId) setStore({ userId, moves: EMPTY, loaded: false });
  if (store.loaded || store.inflightFor === userId) return;
  setStore({ inflightFor: userId });
  getStopMoves(userId)
    .then((moves) => { if (store.userId === userId) setStore({ moves, loaded: true, inflightFor: null }); })
    .catch(() => { if (store.userId === userId) setStore({ inflightFor: null }); });
}

export function useStopMoves() {
  const { user } = useAuth();
  const state = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => snapshot,
    () => snapshot,
  );
  useEffect(() => { load(user?.id); }, [user?.id]);

  // Duragi bir gune tasi. Durak kimligi yoksa (kullanici gorevi, rutin) tasinmaz.
  const moveStop = useCallback(async (logicalStopKey, dateKey) => {
    if (!logicalStopKey || !dateKey || !store.loaded || store.userId !== user?.id) return false;
    if (String(logicalStopKey).startsWith("habit:")) return false;
    const prev = store.moves;
    const next = withMove(prev, logicalStopKey, dateKey, todayTR());
    setStore({ moves: next });
    try {
      await saveStopMoves(user?.id, next);
      return true;
    } catch (e) {
      captureError(e, { context: "stop_move_save" });
      if (store.userId === user?.id) setStore({ moves: prev });
      return false;
    }
  }, [user?.id]);

  // Ertele: duragin KENDI gununden sonraki calisma gunu (ayni hafta).
  // fromDate verilmezse bugun. Gelecek haftanin duragi bu haftaya kaymasin.
  // Donus: { ok, reason } -- reason "no_day" (haftada gun kalmadi) | "save_failed".
  const postponeStop = useCallback(async (logicalStopKey, schedule, fromDate = null) => {
    const base = fromDate && fromDate > todayTR() ? fromDate : todayTR();
    const target = postponeTarget(base, schedule);
    if (!target) return { ok: false, reason: "no_day" };
    const ok = await moveStop(logicalStopKey, target);
    return ok ? { ok: true, target } : { ok: false, reason: "save_failed" };
  }, [moveStop]);

  const sameUser = state.userId === user?.id;
  return {
    moves: sameUser ? state.moves : EMPTY,
    loaded: sameUser && state.loaded,
    moveStop,
    postponeStop,
  };
}
