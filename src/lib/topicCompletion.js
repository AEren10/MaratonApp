import { useEffect, useSyncExternalStore } from "react";

import * as appStorage from "./storage/appStorage";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { makeTopicKey, isTopicDone } from "../domain/curriculum/topicCompletion";
import { getKnownTopics, saveKnownTopics } from "../supabase/routePrefs";
import { todayTR } from "./dateUtils";
import { emitRouteUpdated } from "./routeEvents";
import { registerSessionReset } from "./session/sessionReset";

export { makeTopicKey, isTopicDone };

// "HALLETTIM" ISARETLERI -- ogrencinin konuya attigi tik.
//
// Eskiden yalniz cihazda tutuluyordu ve ROTA HIC OKUMUYORDU: "Limit'i
// okulda bitirdim" diye isaretleyen ogrenciye rota Limit vermeye devam
// ediyordu; telefon degisince tikler kayboluyordu. Artik:
//   - sunucu otorite (route_prefs.known_topics), cihaz yalniz yedek
//   - eski cihaz tikleri ilk okumada sunucuyla birlesir (kaybolmaz)
//   - deger: tik tarihi ("YYYY-MM-DD") ya da false; rota tarihten tekrar
//     zamanini hesaplar
//   - degisiklik rotayi yeniden cizdirir (emitRouteUpdated)
const keyFor = (userId) => userScopedKey(STORAGE_KEYS.COMPLETED_TOPICS, userId || "guest");
const isServerUser = (userId) => Boolean(userId) && userId !== "dev" && userId !== "guest";

const store = { userId: null, map: {}, loaded: false };
const listeners = new Set();
let snapshot = { ...store };
const setStore = (patch) => { Object.assign(store, patch); snapshot = { ...store }; listeners.forEach((l) => l()); };
registerSessionReset(() => setStore({ userId: null, map: {}, loaded: false }));

async function readLocal(userId) {
  try {
    const data = await appStorage.getJson(keyFor(userId), {});
    return data && typeof data === "object" ? data : {};
  } catch (_) {
    return {};
  }
}

export async function getCompletedTopicsMap(userId) {
  const local = await readLocal(userId);
  if (!isServerUser(userId)) return local;
  try {
    const server = await getKnownTopics(userId);
    // Cihazda olup sunucuda olmayan (eski) tikler bir kez tasinir.
    const missing = Object.keys(local).filter((k) => !(k in server));
    const merged = { ...local, ...server };
    if (missing.length) saveKnownTopics(userId, merged).catch(() => {});
    appStorage.setJson(keyFor(userId), merged).catch(() => {});
    // Yalniz ayni kullanicinin kaydi tazelenir; cikistan sonra donen eski
    // yanit bos store'u baskasinin haritasiyla doldurmasin.
    if (store.userId === userId) setStore({ userId, map: merged, loaded: true });
    return merged;
  } catch (_) {
    return local; // cevrimdisi: cihaz yedegi
  }
}

export async function saveCompletedTopicsMap(userId, map) {
  try { await appStorage.setJson(keyFor(userId), map || {}); } catch (_) {}
  if (isServerUser(userId)) await saveKnownTopics(userId, map || {});
  setStore({ userId, map: map || {}, loaded: true });
  emitRouteUpdated({ action: "known_topics_changed" });
}

export async function toggleTopicCompletion(userId, subjectKey, topicName, currentDone) {
  const currentMap = await getCompletedTopicsMap(userId);
  const k = makeTopicKey(subjectKey, topicName);
  const nextMap = { ...currentMap, [k]: currentDone ? false : todayTR() };
  await saveCompletedTopicsMap(userId, nextMap);
  return nextMap;
}

/** Rota icin: kullanicinin tik haritasi (tek kopya, sunucudan). */
export function useKnownTopicsMap(userId) {
  const state = useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => snapshot,
    () => snapshot,
  );
  useEffect(() => {
    if (!userId || (state.loaded && state.userId === userId)) return;
    // Gec donen eski kullanici yaniti (cikista unmount olmus kanca) yeni
    // kullanicinin haritasini ezmesin.
    let alive = true;
    getCompletedTopicsMap(userId).then((map) => {
      if (alive) setStore({ userId, map, loaded: true });
    }).catch(() => {});
    return () => { alive = false; };
  }, [userId, state.loaded, state.userId]);
  return state.userId === userId ? state.map : EMPTY;
}
const EMPTY = {};
