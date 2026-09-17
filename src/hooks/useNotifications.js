import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "../contexts/AuthContext";
import {
  listNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from "../supabase/notifications";
import { SCREENS } from "../constants/screens";
import { captureError } from "../lib/errorReporting";

function screenExists(screen) {
  return !!screen && Object.values(SCREENS).includes(screen);
}

export function useNotifications() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const userId = user?.id;

  const load = useCallback(async ({ refresh = false } = {}) => {
    if (!userId || userId === "dev") {
      setItems([]);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return;
    }
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const rows = await listNotifications(userId);
      setItems(rows);
      setError(null);
    } catch (e) {
      setError(e);
      captureError(e, { context: "notifications_load" });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    let cancelled = false;
    if (!userId || userId === "dev") {
      setItems([]);
      setLoading(false);
      return () => { cancelled = true; };
    }
    setLoading(true);
    listNotifications(userId)
      .then((rows) => {
        if (!cancelled) {
          setItems(rows);
          setError(null);
        }
      })
      .catch((e) => {
        if (!cancelled) {
          setError(e);
          captureError(e, { context: "notifications_initial_load" });
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [userId]);

  const openNotification = useCallback(async (item) => {
    if (!item) return;
    if (!item.read && userId) {
      setItems((prev) => prev.map((n) => (n.id === item.id ? { ...n, read: true, readAt: new Date().toISOString() } : n)));
      markNotificationRead(item.id, userId).catch((e) => {
        captureError(e, { context: "notification_mark_read" });
      });
    }
    if (screenExists(item.routeName)) {
      navigation.navigate(item.routeName, item.routeParams || {});
    }
  }, [navigation, userId]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    const now = new Date().toISOString();
    setItems((prev) => prev.map((n) => ({ ...n, read: true, readAt: n.readAt || now })));
    try {
      await markAllNotificationsRead(userId);
    } catch (e) {
      captureError(e, { context: "notifications_mark_all_read" });
      load({ refresh: true });
    }
  }, [load, userId]);

  const unreadCount = useMemo(() => items.filter((item) => !item.read).length, [items]);

  return {
    notifications: items,
    unreadCount,
    loading,
    refreshing,
    error,
    refresh: () => load({ refresh: true }),
    retry: () => load({ refresh: false }),
    openNotification,
    markAllRead,
  };
}
