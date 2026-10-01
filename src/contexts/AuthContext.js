import { createContext, useContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import * as Linking from "expo-linking";
import { getSession, onAuthStateChange, isRecoveryUrl } from "../supabase/auth";
import { onAuthError } from "../lib/authEvents";
import { setUserContext } from "../lib/errorReporting";
import {
  closeAnalytics,
  initAnalytics,
  stopAnalytics,
  flushAnalytics,
  trackForAnalyticsUser,
} from "../lib/analytics";
import { EVENTS } from "../constants/analytics";
import { resetLocalSession } from "../lib/session/resetLocalSession";
import { createUserTracker, signOutUser, deleteUserAccount } from "../lib/session/sessionLifecycle";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const loggingOut = useRef(false);
  const tracker = useMemo(() => createUserTracker(() => loggingOut.current), []);

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
    let active = true;
    const safetyTimer = setTimeout(() => { if (active) setLoading(false); }, 2000);
    getSession()
      .then((s) => {
        tracker.observe(s?.user?.id);
        setSession(s);
        setUser(s?.user ?? null);
        setUserContext(s?.user ?? null);
        if (s?.user?.id) initAnalytics(s.user.id);
      })
      .catch((e) => {
        if (__DEV__) console.warn("[Auth] getSession failed", e.message || e);
      })
      .finally(() => { clearTimeout(safetyTimer); if (active) setLoading(false); });

    const {
      data: { subscription },
    } = onAuthStateChange((event, s) => {
      tracker.observe(s?.user?.id);
      setSession(s);
      setUser(s?.user ?? null);
      setUserContext(s?.user ?? null);
      if (s?.user?.id) {
        initAnalytics(s.user.id).then((initialized) => {
          // D1/D7 dönüş kohortu bu olay olmadan analytics'ten çıkarılamıyordu;
          // elde yalnızca profiles.last_active vardı. TOKEN_REFRESHED'de
          // tetiklenmemesi için olay tipi kontrol ediliyor.
          if (event === "SIGNED_IN" && initialized !== false) {
            trackForAnalyticsUser(s.user.id, EVENTS.AUTH_LOGIN, {
              provider: s.user.app_metadata?.provider || "unknown",
            });
          }
        }).catch(() => {});
      } else {
        // SIGNED_OUT callback'i her platformda garanti degil. Geldiginde de
        // onceki kullanicinin timer/kimligini burada kesin olarak kapat.
        closeAnalytics({ flush: false }).catch(() => {});
      }
    });

    return () => {
      subscription.unsubscribe();
      stopAnalytics();
    };
  }, [tracker]);

  const logout = useCallback(async () => {
    if (loggingOut.current) return;
    loggingOut.current = true;
    // Bekleyen olayları oturum kapanmadan gönder ve kimliği callback'e
    // güvenmeden kapat. Başarısız analytics hiçbir zaman çıkışı engellemez.
    await closeAnalytics({ flush: true }).catch(() => {});
    await signOutUser(user?.id);
    tracker.forget();
    setSession(null);
    setUser(null);
    // Redux + modul onbellekleri + widget + bildirim (ikinci kez: ucustaki
    // bir kurulum ilk iptalden sonra yazmis olabilir) + yerel anahtarlar.
    await resetLocalSession();
    loggingOut.current = false;
  }, [user?.id, tracker]);

  useEffect(() => {
    return onAuthError(() => {
      if (__DEV__) console.warn("[Auth] 401 detected — forcing logout");
      logout();
    });
  }, [logout]);

  const deleteAccount = useCallback(async () => {
    if (loggingOut.current) throw new Error("session_ending");
    loggingOut.current = true;
    try {
      // Hata firlatirsa hicbir sey temizlenmez; kullanici girisli kalir.
      await flushAnalytics().catch(() => {});
      const result = await deleteUserAccount();
      await closeAnalytics({ flush: false }).catch(() => {});
      tracker.forget();
      setSession(null);
      setUser(null);
      await resetLocalSession();
      return result;
    } finally {
      loggingOut.current = false;
    }
  }, [tracker]);

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
