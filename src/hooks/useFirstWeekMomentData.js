import { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";

import { useAuth } from "../contexts/AuthContext";
import { buildFirstWeekMomentData } from "../domain/premium/firstWeekMoments";
import { dateKey } from "../lib/dateUtils";
import { getStudyLogs } from "../supabase/studyLogs";
import { selectTodayLogs } from "../store/slices/studyLogSlice";
import { selectTrials } from "../store/slices/trialSlice";
import { useStudyRoute } from "./useStudyRoute";

const DAY_MS = 86400000;

function weekRange(createdAt) {
  const start = createdAt ? new Date(createdAt) : null;
  if (!start || Number.isNaN(start.getTime())) return null;
  const end = new Date(start.getTime() + (7 * DAY_MS) - 1);
  return { from: dateKey(start), to: dateKey(end) };
}

export function useFirstWeekMomentData() {
  const { user } = useAuth();
  const todayLogs = useSelector(selectTodayLogs);
  const trials = useSelector(selectTrials);
  const route = useStudyRoute({ persist: false });
  const [logs, setLogs] = useState(todayLogs || []);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const userId = user?.id || null;
    const range = weekRange(user?.created_at);
    if (!userId || userId === "dev" || !range) {
      setLogs(todayLogs || []);
      setLoading(false);
      return undefined;
    }

    let cancelled = false;
    setLoading(true);
    getStudyLogs(userId, range).then((rows) => {
      if (!cancelled) setLogs(rows?.length ? rows : (todayLogs || []));
    }).catch(() => {
      if (!cancelled) setLogs(todayLogs || []);
    }).finally(() => {
      if (!cancelled) setLoading(false);
    });
    return () => { cancelled = true; };
  }, [todayLogs, user?.created_at, user?.id]);

  const data = useMemo(() => buildFirstWeekMomentData({
    createdAt: user?.created_at,
    studyLogs: logs,
    trials,
    routeWeeks: route.weeks || [],
  }), [logs, route.weeks, trials, user?.created_at]);

  return { ...data, loading };
}
