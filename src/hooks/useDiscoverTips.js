import { useCallback, useEffect, useState } from "react";

import { STORAGE_KEYS } from "../constants/storageKeys";
import * as appStorage from "../lib/storage/appStorage";

// KESIF IPUCLARI — widget ve hikaye paylasimi uygulamanin icinde hic
// anilmiyordu. Ana sayfada TEK ipucu gorunur; kapatilan ya da acilan bir
// daha gelmez, sira bir sonrakine gecer. Kullanici en az bir gun
// calismadan hic ipucu cikmaz: ilk gun ekran zaten yeterince dolu.
export const DISCOVER_TIPS = Object.freeze({ WIDGET: "widget", STORY: "story" });
const ORDER = [DISCOVER_TIPS.WIDGET, DISCOVER_TIPS.STORY];

export function useDiscoverTips({ eligible = true } = {}) {
  const [closed, setClosed] = useState(null);

  useEffect(() => {
    let alive = true;
    appStorage.getJson(STORAGE_KEYS.DISCOVER_TIPS, {})
      .then((v) => { if (alive) setClosed(v || {}); })
      .catch(() => { if (alive) setClosed({}); });
    return () => { alive = false; };
  }, []);

  const close = useCallback((key) => {
    setClosed((prev) => {
      const next = { ...(prev || {}), [key]: Date.now() };
      appStorage.setJson(STORAGE_KEYS.DISCOVER_TIPS, next).catch(() => {});
      return next;
    });
  }, []);

  const tip = eligible && closed ? ORDER.find((key) => !closed[key]) || null : null;
  return { tip, close };
}
