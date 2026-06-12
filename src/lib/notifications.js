import * as Notifications from "expo-notifications";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@maraton:notifPrefs";

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
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Çalışma zamanı 📚",
        body: "Bugün hala bir kayıt girmedin. 15 dakika bile yeter — başla!",
        data: { type: "daily_reminder", url: "maraton://plan" },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  } catch (_) {
    return null;
  }
}

export async function scheduleStreakRiskReminder() {
  if (Platform.OS === "web") return null;
  try {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title: "Streak'in tehlikede 🔥",
        body: "Bugün hiç çalışma kaydetmedin. Birazcık çalış, seriyi bozma!",
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

export async function applyNotifPrefs(prefs) {
  await cancelAllScheduled();
  if (!prefs) return;
  if (prefs.dailyReminderEnabled) {
    await scheduleDailyReminder(prefs.dailyReminderHour, prefs.dailyReminderMinute);
  }
  if (prefs.streakRiskEnabled) {
    await scheduleStreakRiskReminder();
  }
}

export async function notifyXP(amount) {
  if (Platform.OS === "web") return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: `+${amount} XP kazandın! 🎉`,
        body: "Devam et, daha çok kazanabilirsin!",
        data: { type: "xp" },
      },
      trigger: null,
    });
  } catch (_) {}
}
