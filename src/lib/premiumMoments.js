import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import * as appStorage from "./storage/appStorage";
import { accessEndedDecision } from "../domain/premium/accessEnded";

// Premium anlarinin kullaniciya ayrik yerel kaydi.

export async function isProPreviewSeen(source, userId) {
  if (!source || !userId) return false;
  const seen = await appStorage.getJson(userScopedKey(STORAGE_KEYS.PRO_PREVIEW_SEEN, userId), []);
  return Array.isArray(seen) && seen.includes(source);
}

export async function markProPreviewSeen(source, userId) {
  if (!source || !userId) return;
  const key = userScopedKey(STORAGE_KEYS.PRO_PREVIEW_SEEN, userId);
  const seen = await appStorage.getJson(key, []);
  const list = Array.isArray(seen) ? seen : [];
  if (!list.includes(source)) await appStorage.setJson(key, [...list, source]);
}

/** Deneme Bitti bu snapshot'ta gosterilmeli mi? Kaydi da gunceller. */
export async function consumeAccessEnded(snapshot, userId) {
  if (!userId || userId === "dev" || !snapshot) return false;
  const key = userScopedKey(STORAGE_KEYS.ACCESS_ENDED, userId);
  const state = await appStorage.getJson(key, {});
  const { show, next } = accessEndedDecision({ snapshot, state });
  if (next) await appStorage.setJson(key, next);
  return show;
}
