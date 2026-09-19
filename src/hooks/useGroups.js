import { useCallback, useEffect, useState } from "react";

import { useAuth } from "../contexts/AuthContext";
import { listMyGroups } from "../supabase/groups";
import { captureError } from "../lib/errorReporting";

export function useGroups({ autoLoad = true } = {}) {
  const { user } = useAuth();
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(autoLoad);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const userId = user?.id;

  const load = useCallback(async ({ refresh = false } = {}) => {
    if (!userId || userId === "dev") {
      setGroups([]);
      setError(null);
      setLoading(false);
      setRefreshing(false);
      return [];
    }
    if (refresh) setRefreshing(true);
    else setLoading(true);
    try {
      const rows = await listMyGroups();
      setGroups(rows);
      setError(null);
      return rows;
    } catch (e) {
      setError(e);
      captureError(e, { context: "groups_load" });
      throw e;
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!autoLoad) return undefined;
    let cancelled = false;
    load().catch((e) => {
      if (!cancelled) setError(e);
    });
    return () => { cancelled = true; };
  }, [autoLoad, load]);

  return {
    groups,
    loading,
    refreshing,
    error,
    reload: load,
    refresh: () => load({ refresh: true }),
    setGroups,
  };
}
