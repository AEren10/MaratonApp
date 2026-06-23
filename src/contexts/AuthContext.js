import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { supabase } from "../supabase/client";
import { signOut as supaSignOut, deleteAccount as supaDeleteAccount } from "../supabase/auth";

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
