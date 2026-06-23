import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabase/client";
import { signOut as supaSignOut, deleteAccount as supaDeleteAccount } from "../supabase/auth";
import { store, RESET_STORE } from "../store/store";
import { STORAGE_KEYS } from "../constants/storageKeys";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession()
      .then(({ data: { session: s } }) => {
        setSession(s);
        setUser(s?.user ?? null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const logout = useCallback(async () => {
    try {
      await supaSignOut();
    } catch (_) {}
    setSession(null);
    setUser(null);
    store.dispatch({ type: RESET_STORE });
    AsyncStorage.multiRemove([
      STORAGE_KEYS.OFFLINE_QUEUE,
      STORAGE_KEYS.GOALS,
      STORAGE_KEYS.LAST_ACTIVE,
      STORAGE_KEYS.LOGIN_REWARDED,
      STORAGE_KEYS.COMEBACK_SHOWN,
      STORAGE_KEYS.NUDGE_POPUP_SHOWN,
      STORAGE_KEYS.GAMIFICATION,
      STORAGE_KEYS.PENDING_STREAK,
      STORAGE_KEYS.CALENDAR_TASKS,
    ]).catch(() => {});
  }, []);

  const deleteAccount = useCallback(async () => {
    await supaDeleteAccount();
    setSession(null);
    setUser(null);
    store.dispatch({ type: RESET_STORE });
    AsyncStorage.multiRemove([
      STORAGE_KEYS.OFFLINE_QUEUE,
      STORAGE_KEYS.GOALS,
      STORAGE_KEYS.LAST_ACTIVE,
      STORAGE_KEYS.LOGIN_REWARDED,
      STORAGE_KEYS.COMEBACK_SHOWN,
      STORAGE_KEYS.NUDGE_POPUP_SHOWN,
      STORAGE_KEYS.GAMIFICATION,
      STORAGE_KEYS.PENDING_STREAK,
      STORAGE_KEYS.CALENDAR_TASKS,
    ]).catch(() => {});
  }, []);

  const value = useMemo(() => ({ session, user, loading, logout, deleteAccount }), [session, user, loading, logout, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
