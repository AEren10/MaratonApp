import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  getSession,
  onAuthStateChange,
  signOut as supaSignOut,
  deleteAccount as supaDeleteAccount,
} from "../supabase/auth";
import { store, RESET_STORE } from "../store/store";
import { onAuthError } from "../lib/authEvents";
import { setUserContext } from "../lib/errorReporting";
import { initAnalytics, setAnalyticsUser, stopAnalytics, flushAnalytics, track } from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import { clearUserScopedStorage } from "../lib/storage/userScopedStorage";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const loggingOut = useRef(false);

  useEffect(() => {
    getSession()
      .then((s) => {
        setSession(s);
        setUser(s?.user ?? null);
        setUserContext(s?.user ?? null);
        if (s?.user?.id) initAnalytics(s.user.id);
      })
      .catch((e) => {
        if (__DEV__) console.warn("[Auth] getSession failed", e.message || e);
      })
      .finally(() => setLoading(false));

    const {
      data: { subscription },
    } = onAuthStateChange((event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      setUserContext(s?.user ?? null);
      if (s?.user?.id) {
        initAnalytics(s.user.id).then(() => {
          // D1/D7 dönüş kohortu bu olay olmadan analytics'ten çıkarılamıyordu;
          // elde yalnızca profiles.last_active vardı. TOKEN_REFRESHED'de
          // tetiklenmemesi için olay tipi kontrol ediliyor.
          if (event === "SIGNED_IN") {
            track(EVENTS.AUTH_LOGIN, { provider: s.user.app_metadata?.provider || "unknown" });
          }
        }).catch(() => {});
      } else {
        setAnalyticsUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
      stopAnalytics();
    };
  }, []);

  const logout = useCallback(async () => {
    if (loggingOut.current) return;
    loggingOut.current = true;
    // Bekleyen olayları oturum kapanmadan gönder.
    await flushAnalytics().catch(() => {});
    try {
      await supaSignOut();
    } catch (_) {}
    setSession(null);
    setUser(null);
    store.dispatch({ type: RESET_STORE });
    await clearUserScopedStorage();
    loggingOut.current = false;
  }, []);

  useEffect(() => {
    return onAuthError(() => {
      if (__DEV__) console.warn("[Auth] 401 detected — forcing logout");
      logout();
    });
  }, [logout]);

  const deleteAccount = useCallback(async () => {
    await supaDeleteAccount();
    setSession(null);
    setUser(null);
    store.dispatch({ type: RESET_STORE });
    await clearUserScopedStorage();
  }, []);

  const value = useMemo(() => ({ session, user, loading, logout, deleteAccount }), [session, user, loading, logout, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
