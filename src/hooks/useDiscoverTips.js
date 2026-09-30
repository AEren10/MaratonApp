import { useCallback, useEffect, useState } from "react";
import { Platform } from "react-native";

import { STORAGE_KEYS } from "../constants/storageKeys";
import * as appStorage from "../lib/storage/appStorage";

// KESIF IPUCLARI — widget ve hikaye paylasimi uygulamanin icinde hic
// anilmiyordu. Ana sayfada TEK ipucu gorunur; kapatilan ya da acilan bir
// daha gelmez, sira bir sonrakine gecer. Kullanici en az bir gun
// calismadan hic ipucu cikmaz: ilk gun ekran zaten yeterince dolu.
//
// Durum MODUL duzeyinde, tek kopya: Ana sayfa ile Widget rehberi ayni
// kaydi gorur (rehberde kapatilan ipucu ana sayfadan hemen kalkar). Yazma
// yuklemeyi bekler; eskiden rehber yukleme bitmeden bos kayitla yazip
// daha once kapatilan ipuclarini geri getiriyordu.
export const DISCOVER_TIPS = Object.freeze({ WIDGET: "widget", STORY: "story", SCHEDULE: "schedule", HABIT: "habit", KNOWN_TOPICS: "known_topics" });
// Widget'lar yalniz iOS'ta var.
const ORDER = Platform.OS === "ios" ? [DISCOVER_TIPS.WIDGET, DISCOVER_TIPS.STORY] : [DISCOVER_TIPS.STORY];

let state = null;
let loading = null;
const listeners = new Set();
const emit = () => listeners.forEach((fn) => fn(state));

function load() {
  if (!loading) {
    loading = appStorage.getJson(STORAGE_KEYS.DISCOVER_TIPS, {})
      .then((v) => { state = { ...(v || {}), ...(state || {}) }; emit(); })
      .catch(() => { state = state || {}; emit(); });
  }
  return loading;
}

export function useDiscoverTips({ eligible = true } = {}) {
  const [closed, setClosed] = useState(state);

  useEffect(() => {
    listeners.add(setClosed);
    load();
    return () => { listeners.delete(setClosed); };
  }, []);

  const close = useCallback((key) => {
    load().then(() => {
      if (state?.[key]) return;
      state = { ...(state || {}), [key]: Date.now() };
      emit();
      appStorage.setJson(STORAGE_KEYS.DISCOVER_TIPS, state).catch(() => {});
    });
  }, []);

  // Tekrarlayan ipucu (aylik hatirlatma): kapatma anini her seferinde yeniler.
  const snooze = useCallback((key) => {
    load().then(() => {
      state = { ...(state || {}), [key]: Date.now() };
      emit();
      appStorage.setJson(STORAGE_KEYS.DISCOVER_TIPS, state).catch(() => {});
    });
  }, []);

  const isClosed = useCallback((key) => Boolean(closed?.[key]), [closed]);
  const closedAt = useCallback((key) => Number(closed?.[key]) || 0, [closed]);
  const tip = eligible && closed ? ORDER.find((key) => !closed[key]) || null : null;
  return { tip, close, snooze, isClosed, closedAt, loaded: Boolean(closed), closed };
}
