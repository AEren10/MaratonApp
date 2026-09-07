import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../../constants/storageKeys";

// DİKKAT: OFFLINE_QUEUE ve OFFLINE_DEAD_LETTER bu listede OLMAMALI.
// Kuyruk zaten getOperationUserId ile kullanıcı bazlı filtreleniyor
// (offlineQueue.js:227,283). Buraya eklenirse çıkışta — özellikle token
// süresi dolunca tetiklenen istem dışı onAuthError→logout yolunda —
// gönderilmemiş çalışma/deneme kayıtları kalıcı olarak silinir.
export const USER_SCOPED_KEYS = [
  STORAGE_KEYS.GOALS,
  STORAGE_KEYS.LAST_ACTIVE,
  STORAGE_KEYS.LOGIN_REWARDED,
  STORAGE_KEYS.COMEBACK_SHOWN,
  STORAGE_KEYS.NUDGE_POPUP_SHOWN,
  STORAGE_KEYS.GAMIFICATION,
  STORAGE_KEYS.PENDING_STREAK,
  STORAGE_KEYS.CALENDAR_TASKS,
  STORAGE_KEYS.EXAM_CONFIG,
  STORAGE_KEYS.CLAIMED_MILESTONES,
  STORAGE_KEYS.STUDY_HOURS,
  STORAGE_KEYS.LEAGUE_RESULT,
  STORAGE_KEYS.ENDOWED_SHOWN,
  STORAGE_KEYS.WRAPPED_LAST,
  STORAGE_KEYS.STUDY_SESSION_COUNT,
  STORAGE_KEYS.PAYWALL_SHOWN_SESSION,
  STORAGE_KEYS.PENDING_REFERRAL,
  STORAGE_KEYS.PENDING_FRIEND_CODE,
  STORAGE_KEYS.PENDING_GROUP_CODE,
  STORAGE_KEYS.ANALYTICS_BUFFER,
  // Bildirim tercihleri kullanıcıya özel: A'nın kapattığı bildirim B'ye
  // açık gelmesin. Sunucudan loadNotifPrefsFromServer yeniden dolduruyor.
  STORAGE_KEYS.NOTIF_PREFS,
];

export const USER_SCOPED_PREFIXES = [
  STORAGE_KEYS.DAILY_GOAL_DONE_PREFIX,
  STORAGE_KEYS.PLAN_DONE_PREFIX,
  `${STORAGE_KEYS.DAILY_GOAL_DONE_PREFIX}_`,
  `${STORAGE_KEYS.PLAN_DONE_PREFIX}_`,
];

export async function clearUserScopedStorage() {
  try {
    const allKeys = await AsyncStorage.getAllKeys();
    const dynamicKeys = allKeys.filter((key) =>
      USER_SCOPED_PREFIXES.some((prefix) => key.startsWith(prefix)) ||
      USER_SCOPED_KEYS.some((baseKey) => key.startsWith(`${baseKey}:`)),
    );
    await AsyncStorage.multiRemove([...new Set([...USER_SCOPED_KEYS, ...dynamicKeys])]);
  } catch (_) {}
}
