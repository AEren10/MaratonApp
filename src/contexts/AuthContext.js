import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import * as Linking from "expo-linking";
import {
  getSession,
  onAuthStateChange,
  signOut as supaSignOut,
  deleteAccount as supaDeleteAccount,
  isRecoveryUrl,
} from "../supabase/auth";
import { cancelAllScheduled } from "../lib/notifications";
import { unregisterPushToken } from "../supabase/profiles";
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

  // ŞİFRE SIFIRLAMA MODU
  //
  // Sıfırlama linki bir OTURUM kuruyor. AppNavigator ekranı yalnızca session'a
  // bakarak seçtiği için, oturum kurulur kurulmaz AuthStack (ve içindeki
  // SetNewPassword ekranı) unmount oluyordu: kullanıcı şifresini yazamadan
  // form ekrandan siliniyordu — şifre sıfırlama fiilen çalışmıyordu.
  //
  // Bu bayrak, sıfırlama akışı bitene kadar navigasyonu oturumdan bağımsız
  // olarak kurtarma yığınında tutuyor.
  const [recoveryMode, setRecoveryMode] = useState(false);
  const [recoveryUrl, setRecoveryUrl] = useState(null);

  const endRecovery = useCallback(() => {
    setRecoveryMode(false);
    setRecoveryUrl(null);
  }, []);

  useEffect(() => {
    let active = true;
    const accept = (url) => {
      if (!active || !url || !isRecoveryUrl(url)) return;
      setRecoveryUrl(url);
      setRecoveryMode(true);
    };
    Linking.getInitialURL().then(accept).catch(() => {});
    const sub = Linking.addEventListener("url", ({ url }) => accept(url));
    return () => { active = false; sub?.remove?.(); };
  }, []);

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

    // BİLDİRİM TEMİZLİĞİ — oturum kapanmadan ÖNCE, token'ı silmek için
    // hâlâ yetkimiz varken.
    //
    // Eskiden çıkışta hiçbir şey temizlenmiyordu. İki sonucu vardı:
    //   1) Cihaz, çıkmış kullanıcının planlanmış hatırlatmalarını atmaya
    //      devam ediyordu — üstelik metinlerinde onun serisi ve çalışma
    //      verisi yazıyordu.
    //   2) Aynı cihaza ikinci kullanıcı girince push token iki profilde
    //      birden duruyor, birinciye atılan push ikincinin telefonunda
    //      çıkıyordu. Paylaşılan cihazda kullanıcılar arası sızıntı.
    const leavingUserId = user?.id;
    await cancelAllScheduled().catch(() => {});
    if (leavingUserId) await unregisterPushToken(leavingUserId).catch(() => {});

    try {
      await supaSignOut();
    } catch (_) {}
    setSession(null);
    setUser(null);
    store.dispatch({ type: RESET_STORE });
    await clearUserScopedStorage();
    loggingOut.current = false;
  }, [user?.id]);

  useEffect(() => {
    return onAuthError(() => {
      if (__DEV__) console.warn("[Auth] 401 detected — forcing logout");
      logout();
    });
  }, [logout]);

  const deleteAccount = useCallback(async () => {
    // Hesap silinirken de planlanmış bildirimler kalmamalı.
    await cancelAllScheduled().catch(() => {});
    const result = await supaDeleteAccount();
    setSession(null);
    setUser(null);
    store.dispatch({ type: RESET_STORE });
    await clearUserScopedStorage();
    // Dosya temizliği kısmen başarısız olduysa çağıran bunu kullanıcıya
    // söyleyebilsin — "tüm veriler silindi" demek doğru olmaz.
    return result || { storageFailures: [] };
  }, []);

  const value = useMemo(
    () => ({ session, user, loading, logout, deleteAccount, recoveryMode, recoveryUrl, endRecovery }),
    [session, user, loading, logout, deleteAccount, recoveryMode, recoveryUrl, endRecovery],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
