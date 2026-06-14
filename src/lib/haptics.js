import * as Haptics from "expo-haptics";

// Premium dokunsal geri bildirim — tutarlı, ölçülü kullanım için sarmalayıcı.
// Hepsi fire-and-forget; desteklenmeyen cihazda sessizce geçer.

export const tap = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
export const select = () => Haptics.selectionAsync().catch(() => {});
export const medium = () => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
export const success = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
export const warn = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning).catch(() => {});
export const error = () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error).catch(() => {});
