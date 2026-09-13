import * as appStorage from "./storage/appStorage";
import { STORAGE_KEYS, userScopedKey } from "../constants/storageKeys";
import { rehearsalReminderAt } from "../domain/exam/examRehearsal";
import { scheduleRehearsalReminder, cancelRehearsalReminder } from "./notifications";

// Kurulmus deneme provasi (tek kayit). Cihaza ozel; "O gün başka durak
// açılmaz" kurali Ana Sayfa'da bu kayittan okunuyor.
const keyFor = (userId) => userScopedKey(STORAGE_KEYS.EXAM_REHEARSAL, userId);

export async function loadRehearsal(userId) {
  const raw = await appStorage.getJson(keyFor(userId), null);
  return raw && typeof raw.dateKey === "string" ? raw : null;
}

export async function saveRehearsal(userId, rehearsal) {
  await appStorage.setJson(keyFor(userId), rehearsal);
  const at = rehearsalReminderAt(rehearsal);
  if (at) await scheduleRehearsalReminder(at);
  else await cancelRehearsalReminder();
}

export async function clearRehearsal(userId) {
  await appStorage.remove(keyFor(userId));
  await cancelRehearsalReminder();
}
