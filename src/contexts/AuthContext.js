import { createContext, useContext, useEffect, useState, useCallback } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../supabase/client";
import { signOut as supaSignOut } from "../supabase/auth";

const AuthContext = createContext(null);

const DEV_BYPASS = false;

export function AuthProvider({ children }) {
  const [session, setSession] = useState(DEV_BYPASS ? { user: { id: "dev" } } : null);
  const [user, setUser] = useState(DEV_BYPASS ? { id: "dev", email: "dev@test.com" } : null);
  const [loading, setLoading] = useState(DEV_BYPASS ? false : true);

  useEffect(() => {
    if (DEV_BYPASS) return;
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

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
    await AsyncStorage.removeItem("@exam_config");
    await supaSignOut();
  }, []);

  const value = { session, user, loading, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
};
