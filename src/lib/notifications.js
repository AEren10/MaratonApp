import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { SCREENS } from "../constants/screens";
import { appUrl } from "../navigation/routes";
import { getDaily, getStreakRisk, getWeekly, getZeigarnik as getZeigarnikContent, getOptimalHour } from "./notificationTemplates";
import { getNotificationPrefs, updateNotificationPrefs, registerPushToken } from "../supabase/profiles";
import * as appStorage from "./storage/appStorage";

const STORAGE_KEY = STORAGE_KEYS.NOTIF_PREFS;
const CONTEXT_KEY = STORAGE_KEYS.NOTIF_CONTEXT;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

if (Platform.OS === "android") {
  Notifications.setNotificationChannelAsync("default", {
    name: "Genel Bildirimler",
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    sound: "default",
  }).catch(() => {});
}

export async function requestNotificationPermissions() {
  if (Platform.OS === "web") return false;
  try {
    const { status: existing } = await Notifications.getPermissionsAsync();
    let finalStatus = existing;
    if (existing !== "granted") {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    return finalStatus === "granted";
  } catch (_) {
    return false;
  }
}

export async function getNotifPrefs() {
  try {
    const prefs = await appStorage.getJson(STORAGE_KEY, null);
    if (prefs) return prefs;
  } catch (_) {}
  return {
    dailyReminderEnabled: true,
    dailyReminderHour: 19,
    dailyReminderMinute: 0,
    streakRiskEnabled: true,
    trialReminderEnabled: false,
    taskReminderEnabled: true,
    weeklySummaryEnabled: true,
  };
}

export async function setNotifPrefs(prefs, userId) {
  try {
    await appStorage.setJson(STORAGE_KEY, prefs);
  } catch (_) {}
  if (userId && userId !== "dev") {
    await updateNotificationPrefs(userId, prefs);
  }
}

export async function loadNotifPrefsFromServer(userId) {
  if (!userId || userId === "dev") return null;
  try {
    const prefs = await getNotificationPrefs(userId);
    if (prefs) {
      await appStorage.setJson(STORAGE_KEY, prefs);
      return prefs;
    }
  } catch {}
  return null;
}

export async function cancelAllScheduled() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (_) {}
}

// Sadece verilen tipleri iptal eder. applyNotifPrefs'in her açılışta
// cancelAllScheduled çağırması, plan akışının kurduğu task_reminder
// bildirimlerini de siliyordu — retention'ın en güçlü kancası sessizce
// ölüyordu. Tercih uygulaması artık yalnızca kendi kurduklarına dokunur.
export async function cancelScheduledByType(types) {
  if (Platform.OS === "web") return;
  const wanted = new Set(types);
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (wanted.has(n.content?.data?.type)) {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch (_) {}
}

// applyNotifPrefs'in yönettiği tipler. task_reminder BİLEREK yok.
const PREF_MANAGED_TYPES = [
  "daily_reminder",
  "streak_risk",
  "weekly_summary",
  "trial_reminder",
];

export async function scheduleDailyReminder(hour = 19, minute = 0) {
  if (Platform.OS === "web") return null;
  try {
    const optHour = await getOptimalHour().catch(() => hour);
    const useHour = Math.abs(optHour - hour) <= 3 ? optHour : hour;
    const { title, body } = getDaily();
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: "daily_reminder", url: appUrl(SCREENS.PLAN_DETAIL) },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: useHour,
        minute,
      },
    });
  } catch (_) {
    return null;
  }
}

// Bir sonraki 22:00'ı döndürür. O gün 22:00 geçtiyse yarını verir.
// studiedToday ise bugünü atlayıp doğrudan yarını hedefler.
function nextStreakRiskDate(studiedToday) {
  const target = new Date();
  target.setSeconds(0, 0);
  target.setMinutes(0);
  if (studiedToday || target.getHours() >= 22) {
    target.setDate(target.getDate() + 1);
  }
  target.setHours(22);
  return target;
}

/**
 * Seri-riski hatırlatması.
 *
 * Önceden DAILY tetikleyiciydi: her gün 22:00'da, o gün çalışılmış olsa bile
 * "serin tehlikede" diye bildirim gidiyordu. DAILY tetikleyici tek bir günü
 * atlayamadığı için yanlış-pozitif kaçınılmazdı — ve yanlış-pozitif bildirim,
 * kullanıcının bildirimleri tamamen kapatmasının en hızlı yolu.
 *
 * Artık TEK SEFERLİK: her senkronda yeniden kuruluyor, o gün çalışıldıysa
 * yarına atılıyor. Uygulamayı hiç açmayan kullanıcılar için sunucu tarafındaki
 * push (send-push / streak_risk) devrede — o zaten "bugün aktif olmayan"ları
 * hedefliyor, yani ikisi çakışmaz.
 */
export async function scheduleStreakRiskReminder(streak = 0, studiedToday = false) {
  if (Platform.OS === "web") return null;
  try {
    const { title, body } = streak > 0
      ? getStreakRisk(streak)
      : { title: "Streak'in tehlikede!", body: "Bugün hiç çalışma kaydetmedin. Seriyi bozma!" };
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: "streak_risk", url: appUrl(SCREENS.HOME) },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: nextStreakRiskDate(studiedToday),
      },
    });
  } catch (_) {
    return null;
  }
}

export async function scheduleWeeklySummary(weeklyVars = {}) {
  if (Platform.OS === "web") return null;
  try {
    const hasVars = weeklyVars.xp || weeklyVars.questions || weeklyVars.minutes;
    const { title, body } = hasVars
      ? getWeekly({ xp: weeklyVars.xp || 0, questions: weeklyVars.questions || 0, minutes: weeklyVars.minutes || 0 })
      : { title: "Haftalık raporun hazır", body: "Bu haftanın özetine göz at!" };
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: "weekly_summary", url: appUrl(SCREENS.WEEKLY_REVIEW) },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 1,
        hour: 10,
        minute: 0,
      },
    });
  } catch (_) {
    return null;
  }
}

export async function scheduleTrialReminder() {
  if (Platform.OS === "web") return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Deneme zamanı 📝",
        body: "Bu hafta henüz deneme girmedin. Kendini test et!",
        data: { type: "trial_reminder", url: appUrl(SCREENS.TRIAL_ENTRY) },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
        weekday: 4,
        hour: 18,
        minute: 0,
      },
    });
  } catch {
    return null;
  }
}

/**
 * Bildirim bağlamının son bilinen hâli.
 *
 * Neden var: applyNotifPrefs her çağrıldığında yönettiği TÜM bildirimleri
 * iptal edip yeniden kuruyor. Ama üç yer (App.js açılışı, onboarding'de
 * hedef kaydı, bildirim ayarları) bunu bağlam VERMEDEN çağırıyordu.
 * Bağlam boş olunca streak=0 ve studiedToday=false varsayılıyor; sonuç:
 * bugün çalışmış, 40 günlük serisi olan kullanıcı "Bugün hiç çalışma
 * kaydetmedin, seriyi bozma!" bildirimi alıyordu. Üstelik useDataSync'in
 * doğru bağlamla kurduğu bildirim de bu sırada siliniyordu.
 *
 * Artık bağlam diske yazılıyor ve verilmediğinde oradan okunuyor.
 */
async function readNotifContext() {
  try { return (await appStorage.getJson(CONTEXT_KEY, null)) || {}; } catch { return {}; }
}

export async function saveNotifContext(context = {}) {
  try { await appStorage.setJson(CONTEXT_KEY, context); } catch (_) {}
}

export async function applyNotifPrefs(prefs, context) {
  await cancelScheduledByType(PREF_MANAGED_TYPES);
  if (!prefs) return;
  if (context) await saveNotifContext(context);
  else context = await readNotifContext();
  if (prefs.dailyReminderEnabled) {
    await scheduleDailyReminder(prefs.dailyReminderHour, prefs.dailyReminderMinute);
  }
  // Bağlam hiç bilinmiyorsa (ilk açılış, henüz senkron olmadı) streak-risk
  // bildirimi KURULMAZ. Kurulsaydı studiedToday=false varsayımıyla yanlış
  // uyarı giderdi; useDataSync birkaç saniye sonra doğru bağlamla çağırıyor.
  if (prefs.streakRiskEnabled && context.studiedToday !== undefined) {
    await scheduleStreakRiskReminder(context.streak, context.studiedToday);
  }
  if (prefs.weeklySummaryEnabled !== false) {
    await scheduleWeeklySummary(context.weeklyVars);
  }
  if (prefs.trialReminderEnabled) {
    await scheduleTrialReminder();
  }
}

export async function scheduleTaskNotifications(taskCount) {
  if (Platform.OS === "web") return;
  const prefs = await getNotifPrefs();
  if (prefs.taskReminderEnabled === false) return;
  await cancelTaskReminders();
  try {
    const zContent = getZeigarnikContent({ count: taskCount, subject: "", percent: "" });
    await Notifications.scheduleNotificationAsync({
      content: {
        title: zContent.title || "Yarım kalan görevlerin var",
        body: zContent.body || `${taskCount} görev tamamlanmamış. Geri dön ve bitir!`,
        data: { type: "task_reminder", url: appUrl(SCREENS.PLAN_DETAIL) },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL,
        seconds: 9000,
      },
    });
    const now = new Date();
    if (now.getHours() < 20) {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: "Bugünkü hedeflerine ulaşmadın 🎯",
          body: "Hâlâ tamamlanmamış görevlerin var. Son bir hamle!",
          data: { type: "task_reminder", url: appUrl(SCREENS.PLAN_DETAIL) },
        },
        trigger: {
          type: Notifications.SchedulableTriggerInputTypes.DAILY,
          hour: 20,
          minute: 0,
        },
      });
    }
  } catch (_) {}
}

export async function cancelTaskReminders() {
  if (Platform.OS === "web") return;
  try {
    const all = await Notifications.getAllScheduledNotificationsAsync();
    for (const n of all) {
      if (n.content?.data?.type === "task_reminder") {
        await Notifications.cancelScheduledNotificationAsync(n.identifier);
      }
    }
  } catch (_) {}
}

/**
 * İzin verildikten HEMEN SONRA push token'ı sunucuya yazar.
 *
 * Boşluk şuydu: registerPushToken yalnızca useDataSync'teki loadAll içinde
 * çağrılıyordu. Onboarding'de kullanıcı izni verdiğinde loadAll çoktan
 * çalışmış oluyor ve o an izin yokken getExpoPushToken() null dönmüştü —
 * yani yeni kullanıcının token'ı hiç kaydedilmiyordu. Sonuç: sunucu
 * tarafındaki re-engagement push'u (send-push) o kullanıcıya ulaşamıyordu;
 * token ancak uygulama arka plana alınıp geri açılınca yazılıyordu.
 */
export async function ensurePushTokenRegistered(userId) {
  if (!userId || userId === "dev" || Platform.OS === "web") return false;
  try {
    const token = await getExpoPushToken();
    if (!token) return false;
    await registerPushToken(userId, token);
    return true;
  } catch (_) {
    return false;
  }
}

export async function getExpoPushToken() {
  if (Platform.OS === "web") return null;
  try {
    const { status } = await Notifications.getPermissionsAsync();
    if (status !== "granted") return null;
    const { data } = await Notifications.getExpoPushTokenAsync({
      projectId: "b7c40c1c-f724-4c07-ad36-696ef890ce64",
    });
    return data;
  } catch {
    return null;
  }
}
