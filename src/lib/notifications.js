import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { STORAGE_KEYS } from "../constants/storageKeys";
import { getDaily, getStreakRisk, getWeekly, getZeigarnik as getZeigarnikContent, getOptimalHour } from "./notificationTemplates";

const STORAGE_KEY = STORAGE_KEYS.NOTIF_PREFS;

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

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
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
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

export async function setNotifPrefs(prefs) {
  try {
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (_) {}
}

export async function cancelAllScheduled() {
  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
  } catch (_) {}
}

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
        data: { type: "daily_reminder", url: "maraton://plan" },
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

export async function scheduleStreakRiskReminder(streak = 0) {
  if (Platform.OS === "web") return null;
  try {
    const { title, body } = streak > 0
      ? getStreakRisk(streak)
      : { title: "Streak'in tehlikede!", body: "Bugün hiç çalışma kaydetmedin. Seriyi bozma!" };
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data: { type: "streak_risk", url: "maraton://home" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour: 22,
        minute: 0,
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
        data: { type: "weekly_summary", url: "maraton://weekly-review" },
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
        data: { type: "trial_reminder", url: "maraton://trial-entry" },
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

export async function applyNotifPrefs(prefs, context = {}) {
  await cancelAllScheduled();
  if (!prefs) return;
  if (prefs.dailyReminderEnabled) {
    await scheduleDailyReminder(prefs.dailyReminderHour, prefs.dailyReminderMinute);
  }
  if (prefs.streakRiskEnabled) {
    await scheduleStreakRiskReminder(context.streak);
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
        data: { type: "task_reminder", url: "maraton://plan" },
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
          data: { type: "task_reminder", url: "maraton://plan" },
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
