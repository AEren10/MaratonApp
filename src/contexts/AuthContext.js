import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../supabase/client";
import { signOut as supaSignOut, deleteAccount as supaDeleteAccount } from "../supabase/auth";

const AuthContext = createContext(null);

const DEV_BYPASS = __DEV__ && process.env.EXPO_PUBLIC_DEV_AUTH === "true";

export function AuthProvider({ children }) {
  const [session, setSession] = useState(DEV_BYPASS ? { user: { id: "dev" } } : null);
  const [user, setUser] = useState(DEV_BYPASS ? { id: "dev", email: "dev@test.com" } : null);
  const [loading, setLoading] = useState(DEV_BYPASS ? false : true);

  useEffect(() => {
    if (DEV_BYPASS) return;
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
    if (DEV_BYPASS) {
      setSession(null);
      setUser(null);
      return;
    }
    await supaSignOut();
  }, []);

  const deleteAccount = useCallback(async () => {
    await supaDeleteAccount();
    setSession(null);
    setUser(null);
  }, []);

  const value = useMemo(() => ({ session, user, loading, logout, deleteAccount }), [session, user, loading, logout, deleteAccount]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
