import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { getStudyLogs } from "../supabase/studyLogs";

// Ozet donemi icin calisma kayitlari (sunucu otorite). from/to YYYY-MM-DD.
export function useSummaryLogs(from, to, enabled = true) {
  const { user } = useAuth();
  const [state, setState] = useState({ logs: [], loading: true, error: null });
  const [tick, setTick] = useState(0);
  const retry = useCallback(() => setTick((n) => n + 1), []);

  useEffect(() => {
    if (!enabled) return undefined;
    if (!user?.id || user.id === "dev" || !from || !to) {
      setState({ logs: [], loading: false, error: null });
      return undefined;
    }
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    getStudyLogs(user.id, { from, to })
      .then((logs) => { if (!cancelled) setState({ logs: logs || [], loading: false, error: null }); })
      .catch((error) => { if (!cancelled) setState({ logs: [], loading: false, error }); });
    return () => { cancelled = true; };
  }, [user?.id, from, to, enabled, tick]);

  return { ...state, retry };
}
