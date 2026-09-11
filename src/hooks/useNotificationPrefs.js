import { useState, useCallback, useEffect } from "react";
import * as Notifications from "expo-notifications";
import { useFocusEffect } from "@react-navigation/native";
import {
  getNotifPrefs,
  setNotifPrefs,
  applyNotifPrefs,
  requestNotificationPermissions,
  ensurePushTokenRegistered,
} from "../lib/notifications";
import { useAlert } from "../contexts/AlertContext";
import { useAuth } from "../contexts/AuthContext";

// Bildirim tercihleri + izin durumu. Ekrandan ayrildi ki
// NotificationsSettingsScreen sadece goruntu kalsin (AGENTS.md: is mantigi
// hook/lib'te olur).
export function useNotificationPrefs() {
  const [prefs, setPrefs] = useState(null);
  const [busy, setBusy] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const showAlert = useAlert();
  const { user } = useAuth();

  useEffect(() => {
    getNotifPrefs().then(setPrefs);
  }, []);

  const checkPermission = useCallback(async () => {
    try {
      const { status } = await Notifications.getPermissionsAsync();
      setPermissionDenied(status === "denied");
    } catch (_) {}
  }, []);

  useFocusEffect(
    useCallback(() => {
      checkPermission();
    }, [checkPermission])
  );

  const update = useCallback(
    async (patch) => {
      if (!prefs) return;
      const next = { ...prefs, ...patch };
      setPrefs(next);
      setBusy(true);
      try {
        const anyEnabled = next.dailyReminderEnabled || next.streakRiskEnabled || next.weeklySummaryEnabled;
        if (anyEnabled) {
          const granted = await requestNotificationPermissions();
          if (granted) {
            await ensurePushTokenRegistered(user?.id);
          } else {
            showAlert("İzin Gerekli", "Bildirim izni vermeden hatırlatıcı kuramayız.");
            next.dailyReminderEnabled = false;
            next.streakRiskEnabled = false;
            next.weeklySummaryEnabled = false;
            setPrefs(next);
          }
          await checkPermission();
        }
        await setNotifPrefs(next, user?.id);
        await applyNotifPrefs(next);
      } finally {
        setBusy(false);
      }
    },
    [prefs, user?.id, showAlert, checkPermission]
  );

  return { prefs, busy, permissionDenied, update, dismissDenied: () => setPermissionDenied(false) };
}
