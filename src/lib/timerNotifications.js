import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

import { phaseEndContent } from "../domain/study/phaseEndReminder";
import { cancelScheduledByType } from "./notifications";

const TIMER_PHASE_END_TYPE = "timer_phase_end";

// Pomodoro fazinin bittigi ana tek bir yerel bildirim. Uygulama on plandayken
// OS banner'i zaten bastirilir (bkz. notifications.js handler), yani yalniz
// ekran kapali ya da baska uygulamadayken gorunur.
export async function scheduleTimerPhaseEnd(seconds, phase) {
  if (Platform.OS === "web" || !(seconds > 0)) return null;
  await cancelScheduledByType([TIMER_PHASE_END_TYPE]);
  const { title, body } = phaseEndContent(phase);
  try {
    return await Notifications.scheduleNotificationAsync({
      content: { title, body, sound: "default", data: { type: TIMER_PHASE_END_TYPE } },
      trigger: { type: Notifications.SchedulableTriggerInputTypes.TIME_INTERVAL, seconds, repeats: false },
    });
  } catch {
    return null;
  }
}

export async function cancelTimerPhaseEnd() {
  if (Platform.OS === "web") return;
  await cancelScheduledByType([TIMER_PHASE_END_TYPE]);
}
