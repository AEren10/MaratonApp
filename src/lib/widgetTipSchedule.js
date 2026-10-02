import { Platform } from "react-native";

import * as appStorage from "./storage/appStorage";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";

const KEY = "@maraton:widget_tip_at";
const DAY = 86400000;

// Widget bildiriminin tarihi BIR KEZ sabitlenir: plan her acilista yeniden
// kuruluyor; tarih her seferinde "iki gun sonra" olsaydi her gun acan
// kullaniciya hic gelmezdi. Kosul: iOS (widget yalniz orada), hesap en az
// 7 gunluk, widget rehberi daha once acilmamis/kapatilmamis. Tarih gectiyse
// bir daha kurulmaz (null).
export async function widgetTipAt(userId, createdAt, now = Date.now()) {
  if (Platform.OS !== "ios" || !userId || !createdAt) return null;
  if (now - new Date(createdAt).getTime() < 7 * DAY) return null;
  const tips = await appStorage.getJson(STORAGE_KEYS.DISCOVER_TIPS, {}).catch(() => ({}));
  if (tips?.widget) return null;
  const key = userScopedKey(KEY, userId);
  const saved = await appStorage.getString(key).catch(() => null);
  if (saved) return Date.parse(saved) > now ? saved : null;
  // Pazar (haftalik bildirim) ve ayin 1'i (aylik) dolu: o gunlere dusmesin,
  // yoksa oncelik 0 olan ipucu o gun elenir ve bir daha kurulmaz.
  const d = new Date(now + 2 * DAY);
  while (d.getDay() === 0 || d.getDate() === 1) d.setDate(d.getDate() + 1);
  d.setHours(13, 0, 0, 0);
  const at = d.toISOString();
  await appStorage.setString(key, at).catch(() => {});
  return at;
}
