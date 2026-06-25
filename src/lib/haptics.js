import * as Haptics from "expo-haptics";
import AsyncStorage from "@react-native-async-storage/async-storage";

const PREF_KEY = "@maraton:haptics_enabled";
let _enabled = true;

export async function loadHapticPref() {
  try {
    const v = await AsyncStorage.getItem(PREF_KEY);
    if (v !== null) _enabled = v === "true";
  } catch {}
}

export async function setHapticEnabled(val) {
  _enabled = val;
  try { await AsyncStorage.setItem(PREF_KEY, String(val)); } catch {}
}

export function isHapticEnabled() { return _enabled; }

const guard = (fn) => () => { if (_enabled) fn().catch(() => {}); };

export const tap = guard(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
export const select = guard(() => Haptics.selectionAsync());
export const medium = guard(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));
export const success = guard(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
export const warn = guard(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
export const error = guard(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
